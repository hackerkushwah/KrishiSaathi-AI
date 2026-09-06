import React, { useState, useEffect, useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Check, 
  PlusCircle, 
  Trash2, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  Info,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Mic,
  MicOff
} from 'lucide-react';
import { ChatMessage, Conversation, VoiceState } from '../types';
import { VoiceVisualizer } from '../components/voice/VoiceVisualizer';
import { ImageQuestionUploader } from '../components/chat/ImageQuestionUploader';

export const AiSaathiView: React.FC = () => {
  const { farm, profile, t, language, saveAdvisory, presetAiQuery, setPresetAiQuery, showToast } = useFarm();

  // Chat conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');

  // Voice Assistant state
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceAutoPlay, setVoiceAutoPlay] = useState<boolean>(() => {
    return localStorage.getItem('krishisaathi_voice_autoplay') !== 'false';
  });
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [savedAdvisoryIds, setSavedAdvisoryIds] = useState<Set<string>>(new Set());
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeTranscriptRef = useRef<string>('');

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, voiceState]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Preset query handling (from dashboard or navigation)
  useEffect(() => {
    if (presetAiQuery) {
      setInputQuery(presetAiQuery);
      handleSendMessage(presetAiQuery);
      setPresetAiQuery(null);
    }
  }, [presetAiQuery]);

  const loadConversations = async () => {
    try {
      const convList = await api.getConversations();
      setConversations(convList);
      if (convList.length > 0 && !activeConversationId) {
        selectConversation(convList[0].id);
      } else if (convList.length === 0) {
        // Start fresh empty chat
        handleNewChat();
      }
    } catch (e) {
      console.warn('Could not load conversations:', e);
    }
  };

  const selectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    try {
      const msgs = await api.getConversationMessages(convId);
      setMessages(msgs);
    } catch {
      setMessages([]);
    }
  };

  const handleNewChat = () => {
    const newId = 'conv-' + Date.now().toString(36);
    setActiveConversationId(newId);
    setMessages([]);
    setSelectedImage(null);
    setInputQuery('');
    stopAudio();
  };

  const handleDeleteConversation = async (convId: string) => {
    await api.deleteConversation(convId);
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConversationId === convId) {
      handleNewChat();
    }
    showToast(t('delete_chat'), 'info');
  };

  const handleClearCurrentConversation = async () => {
    if (!confirm(t('confirm_clear_chat'))) return;
    if (activeConversationId) {
      await api.deleteConversation(activeConversationId);
    }
    handleNewChat();
    showToast(t('clear_chat'), 'info');
  };

  // Audio Playback Helpers
  const playAudio = (audioUrl: string) => {
    if (!audioUrl) return;
    stopAudio();
    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    setActiveAudioUrl(audioUrl);
    setIsPlayingAudio(true);
    setVoiceState('speaking');

    audio.onended = () => {
      setIsPlayingAudio(false);
      setVoiceState('idle');
    };
    audio.onerror = () => {
      setIsPlayingAudio(false);
      setVoiceState('idle');
    };

    audio.play().catch((err) => {
      console.warn('Autoplay restricted by browser:', err);
      setIsPlayingAudio(false);
      setVoiceState('idle');
    });
  };

  const playTextAsVoice = (text: string, langHint = 'hi-IN') => {
    stopAudio();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langHint;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsPlayingAudio(true);
        setVoiceState('speaking');
      };
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setVoiceState('idle');
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setVoiceState('idle');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setVoiceState('idle');
    }
  };

  const stopAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    if (voiceState === 'speaking') {
      setVoiceState('idle');
    }
  };

  const handleReplayVoice = () => {
    if (activeAudioUrl) {
      playAudio(activeAudioUrl);
    }
  };

  const toggleVoiceAutoPlay = () => {
    const next = !voiceAutoPlay;
    setVoiceAutoPlay(next);
    localStorage.setItem('krishisaathi_voice_autoplay', String(next));
  };

  // Voice Assistant: Dual-Engine Speech Recording Flow (Web Speech API + Server STT)
  const speechRecognitionRef = useRef<any>(null);

  const startVoiceRecording = async () => {
    stopAudio();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast(t('voice_mic_denied'), 'error');
      return;
    }

    // 1. Request microphone access first so user gets browser permission prompt immediately
    let micStream: MediaStream;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = micStream;
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      setVoiceState('idle');
      showToast(t('voice_mic_denied'), 'error');
      return;
    }

    // 2. Check for browser native SpeechRecognition (Chrome, Edge, Android, Safari iOS)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

        activeTranscriptRef.current = '';

        recognition.onstart = () => {
          setVoiceState('listening');
        };

        recognition.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript;
          }
          if (fullTranscript.trim()) {
            activeTranscriptRef.current = fullTranscript.trim();
            setInputQuery(fullTranscript);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition error:', e.error);
          if (e.error === 'not-allowed') {
            showToast(t('voice_mic_denied'), 'error');
            setVoiceState('idle');
            // Stop mic stream
            micStream.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
          }
          // On 'no-speech' or other network errors, keep idle
          if (e.error !== 'not-allowed') {
            if (!activeTranscriptRef.current) {
              setVoiceState('idle');
            }
          }
        };

        recognition.onend = async () => {
          // Clean up stream tracks
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
          }

          const captured = activeTranscriptRef.current.trim();
          if (captured) {
            setVoiceState('thinking');
            await handleSendMessage(captured);
          } else {
            setVoiceState('idle');
          }
        };

        speechRecognitionRef.current = recognition;
        recognition.start();
        setVoiceState('listening');
        return;
      } catch (speechErr) {
        console.warn('SpeechRecognition initialization error, fallback to MediaRecorder:', speechErr);
      }
    }

    // 3. MediaRecorder Fallback (records audio chunks and transcribes via Sarvam / Groq)
    try {
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const recorder = new MediaRecorder(micStream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        micStream.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 200) {
          setVoiceState('idle');
          return;
        }

        setVoiceState('transcribing');

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const langHint = language === 'hi' ? 'hi-IN' : 'en-IN';
            const transcribeResult = await api.transcribeVoice(base64Audio, mimeType, langHint);

            if (transcribeResult && transcribeResult.text && transcribeResult.text.trim()) {
              setInputQuery(transcribeResult.text);
              setVoiceState('thinking');
              await handleSendMessage(transcribeResult.text.trim());
            } else {
              setVoiceState('idle');
              showToast('Could not recognize voice. Please try again or type.', 'info');
            }
          } catch (err: any) {
            console.error('Voice transcription error:', err);
            setVoiceState('idle');
            showToast('Voice transcription error. You can type your question.', 'info');
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setVoiceState('listening');
    } catch (recorderErr) {
      console.error('MediaRecorder start failed:', recorderErr);
      micStream.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
      setVoiceState('idle');
      showToast(t('voice_mic_denied'), 'error');
    }
  };

  const stopVoiceRecording = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (_) {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  const cancelVoiceRecording = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.abort();
      } catch (_) {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      if (mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (_) {}
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    activeTranscriptRef.current = '';
    setVoiceState('idle');
  };

  // Send Message (Text, Voice Transcription, or Multimodal Image)
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputQuery).trim();
    if (!query && !selectedImage) return;

    const currentImg = selectedImage;
    const currentMime = selectedMimeType;

    // Clear input & preview immediately for responsive optimistic feel
    setInputQuery('');
    setSelectedImage(null);
    setIsLoading(true);

    // Optimistically add user message to conversation list
    const tempUserMsg: ChatMessage = {
      id: 'temp-u-' + Date.now(),
      conversation_id: activeConversationId || 'temp',
      role: 'user',
      content: query || (currentImg ? 'Please examine this crop image.' : ''),
      message_type: currentImg ? 'image_query' : 'text',
      image_url: currentImg || undefined,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const farmContext = {
        farmer_name: profile?.name || 'Farmer',
        location: farm ? `${farm.district}, ${farm.state}` : 'India',
        crop: farm?.crop_name || 'Crop',
        acres: farm?.acres || 2,
        soil_type: farm?.soil_type || 'black',
        growth_stage: farm?.growth_stage || 'vegetative',
        language,
      };

      const langCode = language === 'hi' ? 'hi-IN' : 'en-IN';

      const result = await api.sendChatMessage({
        conversationId: activeConversationId || undefined,
        message: query,
        imageBase64: currentImg || undefined,
        mimeType: currentMime,
        language: langCode,
        farmContext,
      });

      setActiveConversationId(result.conversationId);

      // Update messages list replacing temp message with server messages
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, result.userMessage, result.assistantMessage];
      });

      // Update conversations sidebar list
      setConversations((prev) => {
        const existing = prev.find((c) => c.id === result.conversationId);
        if (existing) {
          return prev.map((c) =>
            c.id === result.conversationId ? { ...c, updated_at: new Date().toISOString() } : c
          );
        }
        return [
          {
            id: result.conversationId,
            user_id: profile?.id || 'farmer',
            title: (query || 'Crop Advisory').substring(0, 35),
            language: langCode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ...prev,
        ];
      });

      // Handle voice output playback if auto-play is enabled
      if (result.audioUrl) {
        setActiveAudioUrl(result.audioUrl);
        if (voiceAutoPlay) {
          playAudio(result.audioUrl);
        } else {
          setVoiceState('idle');
        }
      } else if (voiceAutoPlay && result.assistantMessage?.content) {
        playTextAsVoice(result.assistantMessage.content, langCode);
      } else {
        setVoiceState('idle');
      }

    } catch (err: any) {
      showToast('Could not get response from AI Saathi. Please retry.', 'error');
      setVoiceState('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToAdvisories = async (msg: ChatMessage) => {
    if (!msg.metadata) return;
    const meta = msg.metadata;
    await saveAdvisory({
      title: meta.title || 'Crop Advisory',
      title_hi: meta.title_hi,
      query: msg.content,
      category: 'crop',
      summary: msg.content,
      possible_causes: meta.possible_causes || [],
      things_to_check: meta.things_to_check || [],
      immediate_action: meta.immediate_action || [],
      weather_consideration: meta.weather_consideration,
      prevention: meta.prevention || [],
      when_to_seek_help: meta.when_to_seek_help,
      confidence: meta.confidence || 0.92,
      reasoning: meta.reasoning,
    });
    setSavedAdvisoryIds((prev) => new Set([...prev, msg.id]));
    showToast(t('advisory_saved'), 'success');
  };

  const handleCopy = (msg: ChatMessage) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedMessageId(msg.id);
    showToast(t('copied'), 'success');
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  const suggestedQuestions = [
    t('q1'),
    t('q2'),
    t('q3'),
    t('q4'),
    t('q5'),
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">

      {/* ========================================================= */}
      {/* 1. ACTIVE FARM CONTEXT HEADER BAR                         */}
      {/* ========================================================= */}
      <div 
        id="ai-context-banner"
        className="bg-white rounded-3xl p-4 md:p-5 border border-emerald-100 shadow-xs flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('ai_context_title')}:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-medium text-slate-700">
            <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-100">
              {farm?.crop_name || 'Crop'}
            </span>
            <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-xl border border-amber-100">
              {farm?.acres || 2} {t('acres')}
            </span>
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200">
              {farm?.district || 'Indore'}, {farm?.state || 'MP'}
            </span>
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200">
              {t(`soil_${farm?.soil_type || 'black'}` as any)}
            </span>
            <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-100">
              {t(`stage_${farm?.growth_stage || 'vegetative'}` as any)}
            </span>
          </div>
        </div>

        {/* Action Controls: New Chat & History Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-new-chat"
            onClick={handleNewChat}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            title={t('new_chat')}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('new_chat')}</span>
          </button>

          <button
            type="button"
            id="btn-toggle-history"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5"
            title={t('chat_history')}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('chat_history')}</span>
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              id="btn-clear-chat"
              onClick={handleClearCurrentConversation}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title={t('clear_chat')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CHAT HISTORY DRAWER (Collapsible)                      */}
      {/* ========================================================= */}
      {showHistoryDrawer && (
        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('chat_history')}
            </h4>
            <button
              type="button"
              onClick={() => setShowHistoryDrawer(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
            >
              Close ✕
            </button>
          </div>

          {conversations.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              {t('no_chat_history')}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 transition-all ${
                    c.id === activeConversationId
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-semibold'
                      : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      selectConversation(c.id);
                      setShowHistoryDrawer(false);
                    }}
                    className="truncate flex-1 text-left"
                  >
                    💬 {c.title || 'Farm Question'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(c.id);
                    }}
                    className={`p-1 rounded-lg transition-colors ${
                      c.id === activeConversationId ? 'hover:bg-emerald-700 text-white' : 'hover:bg-red-50 text-slate-400 hover:text-red-600'
                    }`}
                    title={t('delete_chat')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PREMIUM VOICE ASSISTANT INTERACTION BANNER             */}
      {/* ========================================================= */}
      <VoiceVisualizer
        state={voiceState}
        onStartListening={startVoiceRecording}
        onStopListening={stopVoiceRecording}
        onCancelListening={cancelVoiceRecording}
        onReplayVoice={handleReplayVoice}
        onStopSpeaking={stopAudio}
        hasAudio={Boolean(activeAudioUrl)}
        voiceAutoPlay={voiceAutoPlay}
        onToggleVoiceAutoPlay={toggleVoiceAutoPlay}
        languageName={language === 'hi' ? 'हिंदी / Hindi' : 'English (India)'}
        labels={{
          tapToSpeak: t('voice_tap_to_speak'),
          listening: t('voice_listening'),
          understanding: t('voice_processing'),
          speaking: t('voice_speaking'),
          replay: t('voice_replay'),
          stop: t('voice_stop'),
          cancel: t('voice_cancel'),
          autoPlay: t('voice_auto_play'),
        }}
      />

      {/* ========================================================= */}
      {/* 4. CONVERSATION MESSAGES TIMELINE                         */}
      {/* ========================================================= */}
      <div className="bg-slate-50/70 rounded-3xl p-4 md:p-6 border border-emerald-100 shadow-2xs min-h-[360px] max-h-[620px] overflow-y-auto space-y-5">
        
        {/* Welcome message when conversation is brand new */}
        {messages.length === 0 && (
          <div className="py-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
              <Bot className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-bold text-base text-slate-800">
                {language === 'hi' ? 'नमस्ते! आपका AI कृषि साथी तैयार है' : 'Hello! Your KrishiSaathi AI is ready'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'hi'
                  ? 'बोलकर सवाल पूछें, टाइप करें या पौधे/पत्ती की तस्वीर जोड़कर सीधे पूछें। पिछली बातचीत याद रखकर सही सलाह मिलेगी।'
                  : 'Ask via voice, type freely, or attach a leaf photo. AI Saathi retains conversational context to diagnose issues accurately.'}
              </p>
            </div>

            {/* Suggested quick chips */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {t('suggested_questions_title')}
              </span>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                {suggestedQuestions.map((qText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputQuery(qText);
                      handleSendMessage(qText);
                    }}
                    className="text-xs text-slate-700 bg-white hover:bg-emerald-50 hover:text-emerald-800 px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-2xs transition-all font-medium text-left"
                  >
                    🌱 {qText}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSaved = savedAdvisoryIds.has(msg.id);
          const isCopied = copiedMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
            >
              {/* Assistant Avatar */}
              {!isUser && (
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[88%] md:max-w-[78%] space-y-2.5 rounded-3xl p-4 md:p-5 shadow-2xs transition-all ${
                  isUser
                    ? 'bg-emerald-700 text-white rounded-tr-sm'
                    : 'bg-white text-slate-800 border border-emerald-100 rounded-tl-sm'
                }`}
              >
                {/* Attached Image Preview if present */}
                {msg.image_url && (
                  <div className="rounded-2xl overflow-hidden border border-emerald-600/30 max-h-64 bg-black/10">
                    <img
                      src={msg.image_url}
                      alt="Uploaded crop sample"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Message text content */}
                {msg.content && (
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap font-normal ${isUser ? 'text-white' : 'text-slate-800'}`}>
                    {msg.content}
                  </div>
                )}

                {/* Structured Agricultural Reasoning Card (for AI responses) */}
                {msg.metadata && (
                  <div className="mt-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{msg.metadata.title || t('results_title')}</span>
                      </span>
                      {msg.metadata.confidence && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          {t('confidence_level')}: {Math.round(msg.metadata.confidence * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Possible Causes */}
                    {msg.metadata.possible_causes && msg.metadata.possible_causes.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-600 uppercase">
                          {t('possible_causes')}:
                        </span>
                        <ul className="text-xs space-y-1 text-slate-700">
                          {msg.metadata.possible_causes.map((c, i) => (
                            <li key={i}>• {c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Immediate Actions */}
                    {msg.metadata.immediate_action && msg.metadata.immediate_action.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('immediate_action')}:</span>
                        </span>
                        <div className="space-y-1">
                          {msg.metadata.immediate_action.map((act, i) => (
                            <div key={i} className="text-xs bg-white p-2 rounded-xl border border-emerald-100 font-medium text-slate-800">
                              {i + 1}. {act}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Assistant message bottom controls: Audio Replay, Save, Copy */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (msg.audio_url) {
                            playAudio(msg.audio_url);
                          } else {
                            playTextAsVoice(msg.content, msg.language || (language === 'hi' ? 'hi-IN' : 'en-IN'));
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors flex items-center gap-1 font-semibold"
                        title="Listen to Voice"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Voice</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(msg)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title={t('copy_advice')}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {msg.metadata && (
                        <button
                          type="button"
                          disabled={isSaved}
                          onClick={() => handleSaveToAdvisories(msg)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                            isSaved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                          title={t('save_advisory')}
                        >
                          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                          <span>{isSaved ? 'Saved' : t('save_advisory')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing / Thinking Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
            </div>
            <div className="bg-white border border-emerald-100 rounded-2xl px-4 py-3 shadow-2xs flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">
                {language === 'hi' ? 'AI साथी विचार कर रहा है…' : 'AI Saathi is thinking…'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================= */}
      {/* 5. MULTIMODAL UNIFIED INPUT DOCK                          */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-emerald-100 shadow-md space-y-3">
        
        {/* Selected Image thumbnail bar if uploaded */}
        <ImageQuestionUploader
          imagePreview={selectedImage}
          onImageSelected={(base64, mime) => {
            setSelectedImage(base64);
            setSelectedMimeType(mime);
          }}
          onImageRemoved={() => setSelectedImage(null)}
          disabled={isLoading}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            id="input-ai-chat-query"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading || voiceState === 'listening'}
            placeholder={
              voiceState === 'listening'
                ? t('voice_listening')
                : selectedImage
                ? (language === 'hi' ? 'इस तस्वीर के बारे में सवाल पूछें…' : 'Ask any question about this crop photo…')
                : t('ai_input_placeholder')
            }
            className={`w-full py-4 pl-4 pr-24 text-sm bg-slate-50/80 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 font-medium transition-all ${
              voiceState === 'listening' ? 'border-red-400 ring-2 ring-red-400/20 bg-red-50/40' : 'border-slate-200'
            }`}
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {/* Quick Mic Button inside input bar */}
            <button
              type="button"
              id="btn-input-mic"
              onClick={() => {
                if (voiceState === 'listening') {
                  stopVoiceRecording();
                } else {
                  startVoiceRecording();
                }
              }}
              className={`p-2.5 rounded-xl transition-all ${
                voiceState === 'listening'
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
              title="Voice Input"
            >
              {voiceState === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Submit Button inside input dock */}
            <button
              type="submit"
              id="btn-submit-chat-query"
              disabled={isLoading || (!inputQuery.trim() && !selectedImage)}
              className="p-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all shadow-sm flex items-center justify-center"
              title={t('ai_send')}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-1 font-medium">
          <span>Powered by Google Gemini & Sarvam AI Voice</span>
          <span>Supports Hindi, English, and Hinglish</span>
        </div>

      </div>

    </div>
  );
};
