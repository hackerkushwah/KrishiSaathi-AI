import { 
  Advisory, 
  DiseaseScan, 
  Farm, 
  FarmerProfile, 
  SatelliteIntelligence, 
  SoilIntelligence, 
  WeatherData,
  Conversation,
  ChatMessage
} from '../types';

class ApiService {
  private weatherCache: { data: WeatherData; timestamp: number } | null = null;
  private intelCache: any = null;

  async getProfile(): Promise<{ profile: FarmerProfile; farm: Farm }> {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch profile');
      return await res.json();
    } catch (e) {
      console.warn('API getProfile fallback to local cache');
      const cached = localStorage.getItem('krishisaathi_farm_cache');
      if (cached) return JSON.parse(cached);
      throw e;
    }
  }

  async login(email: string, password?: string): Promise<{ profile: FarmerProfile; farm: Farm }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    localStorage.setItem('krishisaathi_farm_cache', JSON.stringify(data));
    return data;
  }

  async loginDemo(): Promise<{ profile: FarmerProfile; farm: Farm }> {
    const res = await fetch('/api/auth/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Demo login failed');
    const data = await res.json();
    localStorage.setItem('krishisaathi_farm_cache', JSON.stringify(data));
    return data;
  }

  async updateFarm(updates: Partial<Farm> & { farmer_name?: string }): Promise<{ farm: Farm; profile: FarmerProfile }> {
    const res = await fetch('/api/farm', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update farm details');
    const data = await res.json();
    localStorage.setItem('krishisaathi_farm_cache', JSON.stringify(data));
    return data;
  }

  async getWeather(district?: string): Promise<WeatherData> {
    const now = Date.now();
    if (this.weatherCache && now - this.weatherCache.timestamp < 1000 * 60 * 5) {
      return this.weatherCache.data;
    }

    try {
      const res = await fetch(`/api/weather?district=${encodeURIComponent(district || 'Indore')}`);
      if (!res.ok) throw new Error('Weather API failed');
      const data: WeatherData = await res.json();
      this.weatherCache = { data, timestamp: now };
      return data;
    } catch (e) {
      if (this.weatherCache) return this.weatherCache.data;
      throw e;
    }
  }

  async getIntelligence(): Promise<{
    farm_id: string;
    health_score: number;
    weather: WeatherData;
    satellite: SatelliteIntelligence;
    soil: SoilIntelligence;
    farm_context: any;
  }> {
    if (this.intelCache) {
      return this.intelCache;
    }
    const res = await fetch('/api/intelligence');
    if (!res.ok) throw new Error('Failed to load farm intelligence');
    const data = await res.json();
    this.intelCache = data;
    return data;
  }

  async getAdvisories(): Promise<Advisory[]> {
    try {
      const res = await fetch('/api/advisories');
      if (!res.ok) throw new Error('Failed to load advisories');
      const data = await res.json();
      return data.advisories || [];
    } catch (e) {
      return [];
    }
  }

  async saveAdvisory(advisory: Partial<Advisory>): Promise<Advisory> {
    const res = await fetch('/api/advisories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(advisory),
    });
    if (!res.ok) throw new Error('Failed to save advisory');
    const data = await res.json();
    return data.advisory;
  }

  async updateAdvisory(id: string, updates: Partial<Advisory>): Promise<Advisory> {
    const res = await fetch(`/api/advisories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update advisory');
    const data = await res.json();
    return data.advisory;
  }

  async deleteAdvisory(id: string): Promise<void> {
    await fetch(`/api/advisories/${id}`, { method: 'DELETE' });
  }

  async getScans(): Promise<DiseaseScan[]> {
    try {
      const res = await fetch('/api/scans');
      if (!res.ok) throw new Error('Failed to fetch scans');
      const data = await res.json();
      return data.scans || [];
    } catch (e) {
      return [];
    }
  }

  async saveScan(scan: Partial<DiseaseScan>): Promise<DiseaseScan> {
    const res = await fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scan),
    });
    if (!res.ok) throw new Error('Failed to record scan');
    const data = await res.json();
    return data.scan;
  }

  async askAiSaathi(query: string, farmContext: any): Promise<any> {
    const res = await fetch('/api/ai/advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, farmContext }),
    });
    if (!res.ok) throw new Error('AI Saathi failed to answer');
    return await res.json();
  }

  async scanCropDisease(imageBase64: string, mimeType: string, cropName: string): Promise<any> {
    const res = await fetch('/api/ai/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType, cropName }),
    });
    if (!res.ok) throw new Error('Crop disease scanner failed');
    return await res.json();
  }

  // Voice Assistant: Speech-to-Text
  async transcribeVoice(audioBase64: string, mimeType = 'audio/webm', languageHint = 'hi-IN'): Promise<{ text: string; language: string; provider: string }> {
    const res = await fetch('/api/ai/voice/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType, languageHint }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to transcribe audio');
    }
    return await res.json();
  }

  // Voice Assistant: Text-to-Speech
  async speakVoice(text: string, language = 'hi-IN'): Promise<{ audioBase64: string | null; mimeType?: string; provider: string }> {
    const res = await fetch('/api/ai/voice/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });
    if (!res.ok) {
      throw new Error('Text to speech synthesis request failed');
    }
    return await res.json();
  }

  // Conversational Multi-turn Chat
  async sendChatMessage(payload: {
    conversationId?: string;
    message: string;
    imageBase64?: string;
    mimeType?: string;
    language: string;
    farmContext?: any;
  }): Promise<{
    conversationId: string;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    structuredAdvisory?: any;
    audioUrl?: string | null;
  }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'AI Saathi conversation failed');
    }
    return await res.json();
  }

  // Conversation history management
  async getConversations(): Promise<Conversation[]> {
    try {
      const res = await fetch('/api/ai/conversations');
      if (!res.ok) return [];
      const data = await res.json();
      return data.conversations || [];
    } catch {
      return [];
    }
  }

  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`/api/ai/conversations/${conversationId}/messages`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || [];
    } catch {
      return [];
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await fetch(`/api/ai/conversations/${conversationId}`, { method: 'DELETE' });
  }

  async clearAllConversations(): Promise<void> {
    await fetch('/api/ai/conversations', { method: 'DELETE' });
  }
}

export const api = new ApiService();
