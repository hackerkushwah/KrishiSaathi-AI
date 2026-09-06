/**
 * Server-side AI Provider Orchestration Layer
 * Handles Gemini (Multimodal / Agronomic reasoning),
 * Sarvam AI (Indian language Speech-to-Text & Text-to-Speech),
 * and Groq (High-speed Whisper STT fallback).
 *
 * All API keys remain strictly server-side.
 */

import { GoogleGenAI } from '@google/genai';

export interface TranscriptionResult {
  text: string;
  language: string; // 'hi-IN', 'en-IN', etc.
  provider: 'sarvam' | 'groq' | 'fallback';
}

export interface SpeechSynthesisResult {
  audioBase64: string;
  mimeType: string;
  provider: 'sarvam' | 'browser_fallback';
}

// -------------------------------------------------------------------
// 1. GROQ SPEECH-TO-TEXT PROVIDER (Whisper Large v3)
// -------------------------------------------------------------------
export async function transcribeWithGroq(
  audioBuffer: Buffer,
  mimeType = 'audio/webm',
  languageHint?: string
): Promise<TranscriptionResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('[AI Provider] GROQ_API_KEY not set.');
    return null;
  }

  try {
    const extension = mimeType.includes('wav') ? 'wav' : mimeType.includes('mp4') ? 'm4a' : 'webm';
    const filename = `recording.${extension}`;

    // Construct multipart form-data payload using standard Fetch FormData
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType });
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-large-v3-turbo');
    if (languageHint) {
      // Map 'hi-IN' -> 'hi', 'en-IN' -> 'en'
      const langShort = languageHint.split('-')[0].toLowerCase();
      formData.append('language', langShort);
    }
    formData.append('response_format', 'verbose_json');

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Groq STT] Failed with status ${res.status}: ${errText}`);
      return null;
    }

    const data: any = await res.json();
    const detectedLang = data.language ? `${data.language}-IN` : (languageHint || 'en-IN');
    return {
      text: (data.text || '').trim(),
      language: detectedLang,
      provider: 'groq',
    };
  } catch (error: any) {
    console.warn('[Groq STT] Error occurred during transcription:', error?.message || error);
    return null;
  }
}

// -------------------------------------------------------------------
// 1B. GROQ LLM AGRI-CHAT FALLBACK (llama-3.3-70b-versatile)
// -------------------------------------------------------------------
export async function generateChatWithGroq(
  systemInstruction: string,
  history: ChatTurn[],
  newMessage: string
): Promise<{ textResponse: string; structuredAdvisory?: any; detectedLanguage: string } | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const messages = [
      { role: 'system', content: systemInstruction },
      ...history.map((h) => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content,
      })),
      { role: 'user', content: newMessage },
    ];

    const GROQ_MODELS = ['qwen/qwen3.8-27b', 'qwen/qwen3.6-27b'];
    let lastGroqErr = '';

    for (const model of GROQ_MODELS) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            response_format: { type: 'json_object' },
            temperature: 0.3,
          }),
        });

        if (!res.ok) {
          lastGroqErr = await res.text();
          console.warn(`[Groq Model ${model}] Failed: ${lastGroqErr}. Trying next...`);
          continue;
        }

        const data: any = await res.json();
        const replyRaw = data.choices?.[0]?.message?.content;
        if (!replyRaw) continue;

        const parsed = extractJson(replyRaw);
        return {
          textResponse: parsed.conversational_reply || replyRaw,
          structuredAdvisory: parsed.structured_analysis || undefined,
          detectedLanguage: parsed.detected_language || 'en-IN',
        };
      } catch (e: any) {
        lastGroqErr = e?.message || String(e);
      }
    }

    console.warn('[Groq LLM] All Groq models failed:', lastGroqErr);
    return null;
  } catch (error: any) {
    console.warn('[Groq LLM] Error in fallback chat generation:', error?.message || error);
    return null;
  }
}

// -------------------------------------------------------------------
// 2. SARVAM AI SPEECH-TO-TEXT PROVIDER (saaras:v1 / saaras:v2)
// -------------------------------------------------------------------
export async function transcribeWithSarvam(
  audioBuffer: Buffer,
  mimeType = 'audio/webm',
  languageHint = 'hi-IN'
): Promise<TranscriptionResult | null> {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    console.warn('[AI Provider] SARVAM_API_KEY not set.');
    return null;
  }

  try {
    const extension = mimeType.includes('wav') ? 'wav' : 'webm';
    const filename = `audio.${extension}`;

    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType });
    formData.append('file', blob, filename);
    formData.append('model', 'saaras:v3');
    if (languageHint && languageHint !== 'auto') {
      formData.append('language_code', languageHint);
    }

    const res = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Sarvam STT] Failed with status ${res.status}: ${errText}`);
      return null;
    }

    const data: any = await res.json();
    const detectedLang = data.language_code || languageHint || 'hi-IN';
    return {
      text: (data.transcript || '').trim(),
      language: detectedLang,
      provider: 'sarvam',
    };
  } catch (error: any) {
    console.warn('[Sarvam STT] Error occurred during transcription:', error?.message || error);
    return null;
  }
}

// -------------------------------------------------------------------
// 3. SARVAM AI TEXT-TO-SPEECH PROVIDER (bulbul:v1)
// -------------------------------------------------------------------
export async function synthesizeSpeechWithSarvam(
  text: string,
  targetLanguage = 'hi-IN'
): Promise<SpeechSynthesisResult | null> {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    console.warn('[AI Provider] SARVAM_API_KEY not set.');
    return null;
  }

  // Clean text from markdown syntax and emojis for smooth pronunciation
  const sanitizedText = text
    .replace(/[*#_~`>]/g, '')
    .replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
    .trim();

  // Max 500 chars limit per Sarvam chunk for best latency and audio fluidity
  const clippedText = sanitizedText.length > 500 ? sanitizedText.substring(0, 497) + '...' : sanitizedText;

  try {
    // Detect if text contains Hindi / Devanagari characters
    // Sarvam requires target_language_code to match the character script of inputs
    const hasDevanagari = /[\u0900-\u097F]/.test(clippedText);
    const langCode = hasDevanagari ? 'hi-IN' : 'en-IN';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        inputs: [clippedText],
        target_language_code: langCode,
        pace: 1.0,
        speech_sample_rate: 24000,
        enable_preprocessing: true,
        model: 'bulbul:v3',
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Sarvam TTS] Failed with status ${res.status}: ${errText}`);
      return null;
    }

    const data: any = await res.json();
    const audios = data.audios;
    if (audios && audios.length > 0 && audios[0]) {
      return {
        audioBase64: audios[0],
        mimeType: 'audio/wav',
        provider: 'sarvam',
      };
    }
    return null;
  } catch (error: any) {
    console.warn('[Sarvam TTS] Error occurred during speech synthesis:', error?.message || error);
    return null;
  }
}

// -------------------------------------------------------------------
// 4. MULTI-TURN GEMINI CONVERSATION & VISION REASONING
// -------------------------------------------------------------------
export interface ChatTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image_url?: string;
  metadata?: any;
}

export interface GenerateChatParams {
  ai: GoogleGenAI | null;
  history: ChatTurn[];
  newMessage: string;
  imageBase64?: string;
  mimeType?: string;
  farmContext: any;
  language: string; // 'hi-IN' | 'en-IN' | 'hi' | 'en'
}

export async function generateConversationalChatResponse({
  ai,
  history,
  newMessage,
  imageBase64,
  mimeType = 'image/jpeg',
  farmContext,
  language,
}: GenerateChatParams): Promise<{
  textResponse: string;
  structuredAdvisory?: any;
  detectedLanguage: string;
}> {
  const isHindi = language.startsWith('hi');
  const crop = farmContext?.crop || 'Crop';
  const soil = farmContext?.soil_type || 'black';
  const stage = farmContext?.growth_stage || 'vegetative';
  const location = farmContext?.location || 'India';
  const acres = farmContext?.acres || 2;
  const farmerName = farmContext?.farmer_name || 'Farmer';

  // System instructions for agricultural companion persona with multi-turn memory
  const systemInstruction = `You are KrishiSaathi AI, a world-class AI Agronomist and conversational companion (कृषि साथी) for Indian farmers.
You converse naturally with the farmer named "${farmerName}".

CORE DIRECTIVES:
1. MULTI-TURN CONTEXT & MEMORY:
   - Carefully review the previous conversation history.
   - Cross-question and remember previous details (e.g. crop age, when symptoms began, weather events like recent heavy rain, past fertilizers applied).
   - If the farmer clarifies details ("About 35 days", "It started after rain"), link this immediately to previous messages and adjust the diagnosis (e.g., waterlogging, root stress, specific fungal risks).
2. MULTIMODAL PERCEPTION:
   - If an image is provided in this turn or was referenced previously, examine the leaf/stem/soil/pest patterns directly and answer the user's specific question about it.
   - Do NOT give an absolute or definitive disease declaration; state "Possible issue", "AI assessment", and outline confidence and inspection criteria.
3. INDIAN AGRONOMY PROTOCOLS:
   - Ground dosages, active ingredients, and field recommendations in ICAR (Indian Council of Agricultural Research) and State Agriculture University practices.
   - Mention real active ingredients available in Indian Krishi Seva Kendras (e.g., Emamectin Benzoate, Mancozeb, Propiconazole, Neem-Coated Urea, DAP).
4. FARM CONTEXT:
   - Farm location: ${location}, Crop: ${crop}, Stage: ${stage}, Soil: ${soil}, Acreage: ${acres} acres.
5. LANGUAGE & NATURAL TONE:
   - Language requested: ${isHindi ? 'Hindi (हिंदी)' : 'English (en-IN)'}.
   - If Hindi, respond in fluent, respectful, natural Hindi using terms Indian farmers easily grasp. Hinglish terms like "spray", "dose", "acre", "fertilizer" are welcome where natural.
   - If English, respond in clear, approachable English.
6. OUTPUT STRUCTURE:
   - Provide a conversational, empathetic response text that answers the farmer's question directly.
   - Additionally, when actionable agricultural guidance or disease assessment is relevant, provide structured reasoning (possible_causes, things_to_check, immediate_action, prevention, confidence).
   
FORMAT REQUIREMENT:
Return strictly valid JSON matching this schema:
{
  "conversational_reply": "Direct, helpful, respectful explanation or follow-up question in the requested language",
  "structured_analysis": {
    "title": "Short descriptive title",
    "title_hi": "Title in Hindi",
    "identified_crop": "Crop name",
    "possible_issue": "AI assessment of the condition/issue",
    "confidence": 0.92,
    "possible_causes": ["Cause 1", "Cause 2"],
    "things_to_check": ["Field check 1", "Field check 2"],
    "immediate_action": ["Specific action step 1 with dose", "Specific action step 2"],
    "weather_consideration": "Weather and spray advice",
    "prevention": ["Long-term prevention step 1"],
    "when_to_seek_help": "When to consult local KVK"
  },
  "detected_language": "${isHindi ? 'hi-IN' : 'en-IN'}"
}`;

  if (!ai) {
    // Dynamic rule-based conversation fallback if offline or no Gemini API key
    return generateLocalConversationalFallback(newMessage, history, farmContext, isHindi);
  }

  try {
    // Assemble recent conversation context window (last 6 turns to keep context tight and fast)
    const recentHistory = history.slice(-6).map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    }));

    const currentTurnParts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      currentTurnParts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    currentTurnParts.push({
      text: `Farmer: "${newMessage}"\nRemember to review past messages and respond strictly according to the requested JSON schema.`,
    });

    const AI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];
    let lastError: any = null;

    for (const model of AI_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            ...recentHistory.map((h) => ({
              role: h.role,
              parts: h.parts,
            })),
            {
              role: 'user',
              parts: currentTurnParts,
            },
          ],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        if (response && response.text) {
          const parsed = extractJson(response.text);
          return {
            textResponse: parsed.conversational_reply || response.text,
            structuredAdvisory: parsed.structured_analysis || undefined,
            detectedLanguage: parsed.detected_language || (isHindi ? 'hi-IN' : 'en-IN'),
          };
        }
      } catch (err: any) {
        console.warn(`[Gemini Model ${model}] Failed: ${err?.message || err}. Trying candidate...`);
        lastError = err;
      }
    }

    throw lastError || new Error('All Gemini candidates failed');
  } catch (err: any) {
    console.warn('[Gemini Engine] Primary Gemini failed or rate-limited. Activating Groq Llama-3.3-70B agronomist fallback...');
    
    // Fast high-intelligence fallback using Groq LLaMA 3.3 70B
    const groqResult = await generateChatWithGroq(systemInstruction, history, newMessage);
    if (groqResult) {
      return groqResult;
    }

    return generateLocalConversationalFallback(newMessage, history, farmContext, isHindi);
  }
}

function extractJson(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

function generateLocalConversationalFallback(
  newMessage: string,
  history: ChatTurn[],
  farmContext: any,
  isHindi: boolean
): { textResponse: string; structuredAdvisory?: any; detectedLanguage: string } {
  const q = newMessage.toLowerCase();
  const crop = farmContext?.crop || 'Crop';
  const location = farmContext?.location || 'your area';

  // Check if user is responding with age / rain / duration to follow-up
  const mentionsAge = q.match(/\b\d+\s*(days|दिन|din)\b/) || q.includes('day') || q.includes('दिन');
  const mentionsRain = q.includes('rain') || q.includes('बारिश') || q.includes('पानी') || q.includes('water');

  if (mentionsAge || mentionsRain) {
    const text = isHindi
      ? `जानकारी देने के लिए धन्यवाद। ${crop} में बारिश और जलभराव के बाद जड़ों में ऑक्सीजन की कमी तथा फफूंद (Root Rot/Waterlogging) की संभावना बढ़ जाती है। तुरंत खेत से अतिरिक्त पानी निकालें और 19:19:19 या घुलनशील यूरिया का हल्का स्प्रे करें।`
      : `Thank you for the clarification. In ${crop}, rain and soil waterlogging create root zone hypoxia and fungal vulnerability. Prioritize field drainage immediately, and apply a mild foliar feed (NPK 19:19:19 @ 1 kg/acre) once surface soil breathes.`;

    return {
      textResponse: text,
      structuredAdvisory: {
        title: isHindi ? `${crop} में जलभराव एवं पीलापन प्रबंधन` : `Post-Rain Stress & Chlorosis Management for ${crop}`,
        title_hi: `${crop} में जलभराव एवं पीलापन प्रबंधन`,
        possible_causes: isHindi
          ? ['अत्यधिक नमी से जड़ों में ऑक्सीजन का अभाव', 'सूक्ष्म पोषक तत्वों (आयरन/नाइट्रोजन) का धीमा अवशोषण']
          : ['Root hypoxia due to soil saturation', 'Transient iron and nitrogen uptake suppression'],
        things_to_check: isHindi
          ? ['खेत की क्यारियों में खड़े पानी की निकासी की जांच करें', 'जड़ों का रंग देखें (सफेद स्वस्थ हैं, भूरी या सड़नग्रस्त तनाव दर्शाती हैं)']
          : ['Check field ditches for standing water', 'Examine feeder roots (white = active, dark brown = root rot stress)'],
        immediate_action: isHindi
          ? ['खेत से अतिरिक्त पानी की तत्काल निकासी सुनिश्चित करें', 'मिट्टी सूखने पर कार्बेन्डाजिम 12% + मैंकोजेब 63% WP @ 2 ग्राम/लीटर का स्प्रे करें']
          : ['Ensure immediate excess water drainage from furrows', 'Apply Carbendazim 12% + Mancozeb 63% WP @ 2 g/L to protect crown roots'],
        confidence: 0.91,
      },
      detectedLanguage: isHindi ? 'hi-IN' : 'en-IN',
    };
  }

  // Yellowing
  if (q.includes('yellow') || q.includes('पीला') || q.includes('peela')) {
    const text = isHindi
      ? `${crop} की पत्तियों में पीलापन कई कारणों से हो सकता है—जैसे नाइट्रोजन/सल्फर की कमी, जलभराव या कीट/फफूंद। आपके पौधे कितने दिन के हैं और क्या यह समस्या बारिश या सिंचाई के बाद शुरू हुई?`
      : `Yellowing in ${crop} leaves can stem from several factors, such as nitrogen/sulfur deficiency, waterlogging, or early foliar fungal spotting. How old are your plants, and did this start after recent rain or irrigation?`;

    return {
      textResponse: text,
      structuredAdvisory: {
        title: isHindi ? `${crop} पत्ती पीलापन प्रारंभिक आकलन` : `Initial Foliar Chlorosis Assessment for ${crop}`,
        possible_causes: isHindi
          ? ['पोषक तत्वों की कमी या जड़ क्षेत्र में नमी का तनाव']
          : ['Nutrient deficiency or moisture imbalance in root zone'],
        things_to_check: isHindi
          ? ['क्या पीलापन पुरानी निचली पत्तियों पर है या नए कल्ले/पत्तियों पर?']
          : ['Inspect whether chlorosis appears on older basal leaves or young terminal foliage'],
        immediate_action: isHindi
          ? ['फसल की उम्र और हालिया मौसम की स्थिति की पुष्टि करें']
          : ['Verify exact crop days and recent weather conditions before chemical application'],
        confidence: 0.88,
      },
      detectedLanguage: isHindi ? 'hi-IN' : 'en-IN',
    };
  }

  // Fertilizer / Urea / DAP
  const isFertilizer = q.includes('fertilizer') || q.includes('urea') || q.includes('dap') || q.includes('npk') || q.includes('khad') || q.includes('खाद') || q.includes('यूरिया') || q.includes('dose') || q.includes('खुराक') || q.includes('nutrition');
  if (isFertilizer) {
    const text = isHindi
      ? `${crop} के लिए संतुलित खाद प्रबंधन: बुवाई पर 50 किग्रा DAP + 25 किग्रा यूरिया प्रति एकड़ दें। पहली सिंचाई (21 दिन) पर 40 किग्रा नीम-लेपित यूरिया टॉप-ड्रेसिंग करें। जिंक सल्फेट 33% @ 5 किग्रा/एकड़ अलग से दें। क्या आप बुवाई के समय की खाद या बाद की टॉप-ड्रेसिंग के बारे में जानना चाहते हैं?`
      : `For ${crop}, apply a balanced fertilizer schedule: Basal dose of 50 kg DAP + 25 kg Urea per acre at sowing. First top-dressing at 20-25 days: 40 kg Neem-Coated Urea per acre. Add Zinc Sulphate 33% @ 5 kg/acre separately. Would you like details about basal application or top-dressing timing?`;
    return {
      textResponse: text,
      structuredAdvisory: { title: isHindi ? `${crop} उर्वरक अनुसूची` : `Fertilizer Schedule for ${crop}`, confidence: 0.93 },
      detectedLanguage: isHindi ? 'hi-IN' : 'en-IN',
    };
  }

  // Pest / Insect
  const isPest = q.includes('pest') || q.includes('insect') || q.includes('aphid') || q.includes('whitefly') || q.includes('borer') || q.includes('worm') || q.includes('caterpillar') || q.includes('कीट') || q.includes('सुंडी') || q.includes('कीड़ा') || q.includes('माहू') || q.includes('मक्खी');
  if (isPest) {
    const text = isHindi
      ? `${crop} में कीट नियंत्रण के लिए: रसचूसक कीट (माहू/सफेद मक्खी) हेतु इमिडाक्लोप्रिड 17.8% SL @ 0.5 मिली/लीटर या थायमेथॉक्सम 25% WG @ 0.3 ग्राम/लीटर स्प्रे करें। सुंडी/इल्ली हेतु इमामेक्टिन बेंजोएट 5% SG @ 0.5 ग्राम/लीटर स्प्रे करें। कौन सा कीट दिख रहा है—रसचूसक या सुंडी?`
      : `For ${crop} pest management: For sucking pests (aphids/whiteflies), spray Imidacloprid 17.8% SL @ 0.5 ml/L or Thiamethoxam 25% WG @ 0.3 g/L. For caterpillars/borers, spray Emamectin Benzoate 5% SG @ 0.5 g/L. What type of pest are you seeing—sucking insects or caterpillars?`;
    return {
      textResponse: text,
      structuredAdvisory: { title: isHindi ? `${crop} कीट प्रबंधन` : `Pest Management for ${crop}`, confidence: 0.92 },
      detectedLanguage: isHindi ? 'hi-IN' : 'en-IN',
    };
  }

  // Disease / Fungus / Blight
  const isDisease = q.includes('disease') || q.includes('fungus') || q.includes('blight') || q.includes('rot') || q.includes('rust') || q.includes('mildew') || q.includes('spot') || q.includes('wilt') || q.includes('rog') || q.includes('रोग') || q.includes('फफूंद') || q.includes('झुलसा') || q.includes('गलन');
  if (isDisease) {
    const text = isHindi
      ? `${crop} में रोग प्रबंधन: फफूंद जनित रोगों (झुलसा, गलन) हेतु मैंकोजेब 75% WP @ 2.5 ग्राम/लीटर या कार्बेन्डाजिम 50% WP @ 1 ग्राम/लीटर स्प्रे करें। पत्तियों पर कौन से लक्षण दिख रहे हैं? तस्वीर भेजें तो AI विश्लेषण बेहतर होगा।`
      : `For ${crop} disease management: For fungal diseases (blight, rot), spray Mancozeb 75% WP @ 2.5 g/L or Carbendazim 50% WP @ 1 g/L. What symptoms are you seeing on the leaves? Sending a photo will help AI analysis significantly.`;
    return {
      textResponse: text,
      structuredAdvisory: { title: isHindi ? `${crop} रोग प्रबंधन` : `Disease Management for ${crop}`, confidence: 0.89 },
      detectedLanguage: isHindi ? 'hi-IN' : 'en-IN',
    };
  }

  // Irrigation / Water management
  const isIrrigation = q.includes('irrigat') || q.includes('सिंचाई') || q.includes('watering') || q.includes('drip') || q.includes('flood');
  if (isIrrigation) {
    const text = isHindi
      ? `${crop} में सिंचाई प्रबंधन: फसल की अवस्था के अनुसार सही समय पर सिंचाई करें। अत्यधिक सिंचाई से जड़ सड़न और कम सिंचाई से पोषक तत्वों का अवशोषण कम होता है। ड्रिप सिंचाई 30-40% पानी बचाती है। आपकी सिंचाई का कौन सा पहलू जानना है?`
      : `For ${crop} irrigation: Water at critical growth stages. Over-irrigation causes root rot; under-irrigation reduces nutrient uptake. Drip irrigation saves 30-40% water. Which aspect of irrigation would you like guidance on?`;
    return {
      textResponse: text,
      structuredAdvisory: { title: isHindi ? `${crop} सिंचाई मार्गदर्शन` : `Irrigation Guide for ${crop}`, confidence: 0.90 },
      detectedLanguage: isHindi ? 'hi-IN' : 'en-IN',
    };
  }

  // Weed
  const isWeed = q.includes('weed') || q.includes('herbicide') || q.includes('खरपतवार') || q.includes('घास') || q.includes('निंदाई');
  if (isWeed) {
    const text = isHindi
      ? `${crop} में खरपतवार नियंत्रण: बुवाई के 2-3 दिन बाद पेंडीमिथैलिन 30% EC @ 3.3 लीटर/हेक्टेयर या एट्राज़ीन 50% WP @ 1-1.5 किग्रा/हेक्टेयर का प्री-इमर्जेंस स्प्रे करें। खड़ी फसल में 20-25 दिन पर मैनुअल निराई-गुड़ाई करें।`
      : `For ${crop} weed control: Apply Pendimethalin 30% EC @ 3.3 L/ha or Atrazine 50% WP @ 1-1.5 kg/ha as pre-emergence spray within 2-3 days of sowing. Perform manual weeding at 20-25 days in standing crop.`;
    return {
      textResponse: text,
      structuredAdvisory: { title: isHindi ? `${crop} खरपतवार नियंत्रण` : `Weed Management for ${crop}`, confidence: 0.91 },
      detectedLanguage: isHindi ? 'hi-IN' : 'en-IN',
    };
  }

  // Sowing / Planting
  const isSowing = q.includes('sow') || q.includes('plant') || q.includes('seed') || q.includes('बुवाई') || q.includes('बीज') || q.includes('रोपाई');
  if (isSowing) {
    const text = isHindi
      ? `${crop} की बुवाई: प्रमाणित बीज का ही उपयोग करें। बीज उपचार के लिए कार्बेन्डाजिम 2 ग्राम + इमिडाक्लोप्रिड 5 ग्राम प्रति किलो बीज से उपचार करें। कतार से कतार 22-25 सेमी और पौधे से पौधे 10-15 सेमी दूरी रखें। आपका प्रश्न बुवाई की विधि, बीज दर, या बीज उपचार से संबंधित है?`
      : `For ${crop} sowing: Use certified seeds only. Treat seeds with Carbendazim 2 g + Imidacloprid 5 g per kg of seed. Maintain 22-25 cm row spacing and 10-15 cm plant spacing. Is your question about sowing method, seed rate, or seed treatment?`;
    return {
      textResponse: text,
      structuredAdvisory: { title: isHindi ? `${crop} बुवाई मार्गदर्शन` : `Sowing Guide for ${crop}`, confidence: 0.90 },
      detectedLanguage: isHindi ? 'hi-IN' : 'en-IN',
    };
  }

  // Generic — but ECHO the user's query so it doesn't feel static
  const defaultText = isHindi
    ? `आपने पूछा: "${newMessage}"\n\n${crop} (${location}) के बारे में आपका प्रश्न दर्ज हो गया है। फिलहाल AI सर्वर व्यस्त है, लेकिन मैं कुछ सामान्य सलाह दे सकता हूँ:\n\n1. संतुलित उर्वरक (NPK) का प्रयोग ICAR की अनुशंसा अनुसार करें\n2. कीट दिखें तो तुरंत प्रभावित पत्ती/तने का फोटो भेजें\n3. खेत में जल निकास की व्यवस्था बनाए रखें\n\nकृपया पुनः प्रयास करें या अधिक विस्तार से अपना प्रश्न लिखें।`
    : `Your question: "${newMessage}"\n\nI've noted your query about ${crop} in ${location}. The AI service is currently busy, but here is some general guidance:\n\n1. Follow ICAR-recommended balanced fertilizer (NPK) dosages for your crop stage\n2. If you see pest damage, send a leaf/stem photo for better AI diagnosis\n3. Maintain proper field drainage to prevent root stress\n\nPlease try again shortly, or provide more details for a targeted response.`;

  return {
    textResponse: defaultText,
    detectedLanguage: isHindi ? 'hi-IN' : 'en-IN',
  };
}
