'use client';

import { useVoice } from '../../hooks/useVoice';
import { useRouter } from 'next/navigation';

export default function VoicePage() {
  const {
    isConnected,
    isRecording,
    isProcessing,
    error,
    messages,
    sessionActive,
    toggleRecording,
    endSession,
  } = useVoice();

  const router = useRouter();

  const handleEndSession = async () => {
    await endSession();
    router.push('/dashboard');
  };

  const getButtonLabel = () => {
    if (isProcessing) return 'Processing...';
    if (isRecording) return 'Tap to stop & send';
    return 'Tap to speak';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">

      {/* Header row */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        {sessionActive && (
          <button
            onClick={handleEndSession}
            className="rounded-lg bg-gray-800 px-4 py-1.5 text-sm text-gray-300 hover:bg-gray-700 transition"
          >
            End session
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 w-full max-w-xl text-sm text-red-400 bg-red-900/30 px-4 py-2 rounded-lg text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Messages */}
      <div className="w-full max-w-xl bg-gray-900 rounded-2xl p-6 mb-8 h-96 overflow-y-auto flex flex-col gap-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-auto mb-auto">
            Tap the mic to start speaking...
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs text-sm ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Mic Button */}
      <button
        onClick={toggleRecording}
        disabled={isProcessing}
        className={`w-20 h-20 rounded-full text-3xl transition-all duration-200 select-none ${
          isProcessing
            ? 'bg-yellow-500 opacity-70 cursor-not-allowed'
            : isRecording
            ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/50 animate-pulse'
            : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
        }`}
      >
        {isProcessing ? '⏳' : '🎤'}
      </button>
      <p className="mt-4 text-sm text-gray-400">{getButtonLabel()}</p>
    </div>
  );
}
