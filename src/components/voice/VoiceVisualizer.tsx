import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Square, RotateCcw, Sparkles } from 'lucide-react';
import { VoiceState } from '../../types';

interface VoiceVisualizerProps {
  state: VoiceState;
  onStartListening: () => void;
  onStopListening: () => void;
  onCancelListening: () => void;
  onReplayVoice: () => void;
  onStopSpeaking: () => void;
  hasAudio: boolean;
  voiceAutoPlay: boolean;
  onToggleVoiceAutoPlay: () => void;
  languageName?: string;
  labels: {
    tapToSpeak: string;
    listening: string;
    understanding: string;
    speaking: string;
    replay: string;
    stop: string;
    cancel: string;
    autoPlay: string;
  };
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  state,
  onStartListening,
  onStopListening,
  onCancelListening,
  onReplayVoice,
  onStopSpeaking,
  hasAudio,
  voiceAutoPlay,
  onToggleVoiceAutoPlay,
  languageName = 'Hindi / English',
  labels,
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-5 md:p-6 shadow-md border border-emerald-700/50 relative overflow-hidden transition-all">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
        
        {/* Left / Center Status & Animated Indicator */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Main Interactive Button / Pulse */}
          <div className="relative shrink-0">
            {state === 'listening' && (
              <>
                <span className="absolute -inset-2 rounded-full bg-red-500/30 animate-ping" />
                <span className="absolute -inset-1 rounded-full bg-red-500/40 animate-pulse" />
              </>
            )}

            {state === 'speaking' && (
              <span className="absolute -inset-2 rounded-full bg-emerald-400/30 animate-pulse" />
            )}

            {state === 'idle' && (
              <button
                type="button"
                id="btn-voice-mic-idle"
                onClick={onStartListening}
                aria-label={labels.tapToSpeak}
                className="w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 transition-all transform hover:scale-105 active:scale-95"
              >
                <Mic className="w-7 h-7" />
              </button>
            )}

            {state === 'listening' && (
              <button
                type="button"
                id="btn-voice-mic-listening"
                onClick={onStopListening}
                aria-label={labels.stop}
                className="w-14 h-14 rounded-2xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-950/40 transition-all transform active:scale-95"
              >
                <Square className="w-6 h-6 fill-current" />
              </button>
            )}

            {(state === 'transcribing' || state === 'thinking') && (
              <div className="w-14 h-14 rounded-2xl bg-amber-500/90 text-white flex items-center justify-center shadow-lg shadow-amber-950/40">
                <Sparkles className="w-6 h-6 animate-spin text-amber-100" />
              </div>
            )}

            {state === 'speaking' && (
              <button
                type="button"
                id="btn-voice-stop-speaking"
                onClick={onStopSpeaking}
                aria-label={labels.stop}
                className="w-14 h-14 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white flex items-center justify-center shadow-lg shadow-teal-950/40 transition-all transform active:scale-95"
              >
                <Square className="w-6 h-6 fill-current" />
              </button>
            )}
          </div>

          {/* Text status & animated waveform */}
          <div className="space-y-1 min-w-[170px]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                AI Voice Saathi
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 border border-emerald-600/50">
                {languageName}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {state === 'idle' && (
                <span className="text-sm font-bold text-white tracking-wide">
                  {labels.tapToSpeak}
                </span>
              )}

              {state === 'listening' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-200 animate-pulse">
                    {labels.listening}
                  </span>
                  {/* Dynamic waveform bars for listening */}
                  <div className="flex items-end gap-1 h-4">
                    <span className="w-1 bg-red-400 rounded-full animate-bounce h-3" />
                    <span className="w-1 bg-red-400 rounded-full animate-bounce h-4 delay-100" />
                    <span className="w-1 bg-red-400 rounded-full animate-bounce h-2 delay-200" />
                    <span className="w-1 bg-red-400 rounded-full animate-bounce h-3.5 delay-150" />
                  </div>
                </div>
              )}

              {(state === 'transcribing' || state === 'thinking') && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-200">
                    {labels.understanding}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-300" />
                  </div>
                </div>
              )}

              {state === 'speaking' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-teal-200">
                    {labels.speaking}
                  </span>
                  {/* Audio Equalizer bars */}
                  <div className="flex items-end gap-1 h-4">
                    <span className="w-1 bg-teal-300 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-4" />
                    <span className="w-1 bg-teal-300 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-2.5" />
                    <span className="w-1 bg-teal-300 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-4.5" />
                    <span className="w-1 bg-teal-300 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-3" />
                    <span className="w-1 bg-teal-300 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-4" />
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-emerald-200/80">
              {state === 'listening' ? 'Speak in Hindi, English, or Hinglish' : 'Ask anything about crops, pests, and soil'}
            </p>
          </div>
        </div>

        {/* Right Controls: Stop, Cancel, Replay, Voice Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-emerald-700/40">
          
          {/* Cancel button if listening */}
          {state === 'listening' && (
            <button
              type="button"
              id="btn-voice-cancel"
              onClick={onCancelListening}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1.5"
            >
              <MicOff className="w-3.5 h-3.5 text-red-300" />
              <span>{labels.cancel}</span>
            </button>
          )}

          {/* Replay voice button if audio is available and not currently speaking */}
          {hasAudio && state !== 'speaking' && state !== 'listening' && (
            <button
              type="button"
              id="btn-voice-replay"
              onClick={onReplayVoice}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/25 transition-all flex items-center gap-1.5 shadow-sm"
              title={labels.replay}
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-300" />
              <span className="hidden sm:inline">{labels.replay}</span>
            </button>
          )}

          {/* Stop Speaking button */}
          {state === 'speaking' && (
            <button
              type="button"
              id="btn-voice-stop"
              onClick={onStopSpeaking}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-600/80 hover:bg-red-600 text-white border border-red-400/40 transition-all flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{labels.stop}</span>
            </button>
          )}

          {/* Voice Auto-Play Mute/Unmute Toggle */}
          <button
            type="button"
            id="btn-voice-autoplay-toggle"
            onClick={onToggleVoiceAutoPlay}
            aria-label={labels.autoPlay}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              voiceAutoPlay
                ? 'bg-emerald-600 text-white border-emerald-400/40 shadow-sm'
                : 'bg-white/10 text-emerald-200 border-white/15 hover:bg-white/20'
            }`}
            title="Auto-play voice responses"
          >
            {voiceAutoPlay ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-200" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {voiceAutoPlay ? 'Voice On' : 'Voice Off'}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};
