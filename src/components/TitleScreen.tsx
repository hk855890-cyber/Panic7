import React from 'react';
import { Play, BookOpen, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenManual: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenManual,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#0d0908] text-[#f4ede4] overflow-hidden">
      {/* Victorian gaslit workshop atmospheric lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#3d281a_0%,#1a110d_60%,#080504_100%)] pointer-events-none" />

      {/* Decorative filigree border box */}
      <div className="relative z-10 max-w-xl w-full bg-gradient-to-b from-[#221711]/95 via-[#1a110c]/95 to-[#120b08]/95 border-4 border-[#b38728] rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.95)] text-center relative overflow-hidden">
        {/* Brass corner rivets */}
        <div className="absolute top-2.5 left-2.5 rivet" />
        <div className="absolute top-2.5 right-2.5 rivet" />
        <div className="absolute bottom-2.5 left-2.5 rivet" />
        <div className="absolute bottom-2.5 right-2.5 rivet" />

        {/* Audio mute switch in top corner */}
        <div className="absolute top-4 right-4">
          <button
            onClick={onToggleMute}
            className="p-2 bg-[#2d1f18] hover:bg-[#3d2a20] border border-[#7a591e] rounded-lg text-xs transition-colors shadow active:translate-y-0.5"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#ffd700]" />}
          </button>
        </div>

        {/* Game Jam Plaque Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#150d09] border border-[#8a682a] rounded text-[11px] font-mono tracking-widest text-[#d4af37] uppercase mb-3 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>The Worst Game Wins • Steampunk Jam</span>
        </div>

        {/* Title */}
        <h1 className="font-serif font-black text-3xl sm:text-5xl text-[#ffd700] uppercase tracking-wider drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] mb-1 leading-tight">
          Steam Panic
        </h1>
        <p className="font-serif italic text-base sm:text-lg text-[#d8be98] mb-5 tracking-wide">
          The World's Worst Invention
        </p>

        {/* Steampunk Patent Apparatus Illustration Card */}
        <div className="bg-[#120b08] border-2 border-[#5a4218] rounded-xl p-4 mb-6 shadow-inner text-left">
          <div className="text-[10px] font-mono text-[#8a7258] uppercase tracking-wider mb-2 flex items-center justify-between border-b border-[#3d2c18] pb-1">
            <span>Patent No. 1889-TEA-CHAOS</span>
            <span>Hydro-Pneumatic Mk. IV</span>
          </div>
          <p className="text-xs sm:text-sm text-[#cebeab] leading-relaxed">
            You are an eccentric Victorian inventor attempting to brew a single delicate cup of Earl Grey.
            Your machine weighs three tons, its valves are plumbed in reverse, its pressure gauge lies, and you have
            exactly <strong className="text-amber-400">90 seconds</strong> before the copper boiler detonates!
          </p>

          <div className="mt-3 pt-2 border-t border-[#291b10] flex flex-wrap gap-2 text-[10px] font-mono text-[#a89279]">
            <span className="px-2 py-0.5 bg-[#1e130c] rounded border border-[#442c16]">⚙ 90s Countdown</span>
            <span className="px-2 py-0.5 bg-[#1e130c] rounded border border-[#442c16]">💨 Real Steam Physics</span>
            <span className="px-2 py-0.5 bg-[#1e130c] rounded border border-[#442c16]">☕ 1 Cup Win Condition</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => {
              sound.playClank();
              onStartGame();
            }}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-b from-[#ffd700] via-[#c59b27] to-[#785412] hover:from-[#ffe066] text-black font-serif font-black text-sm tracking-wider uppercase rounded-xl border-2 border-[#fff3b0] shadow-[0_0_25px_rgba(212,175,55,0.45)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Enter Workshop (Start)</span>
          </button>

          <button
            onClick={() => {
              sound.playClank();
              onOpenManual();
            }}
            className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-b from-[#2e1e17] to-[#1c120d] hover:from-[#3d281f] text-[#faeccf] font-serif font-bold text-sm tracking-wider uppercase rounded-xl border border-[#8a682a] transition-all shadow flex items-center justify-center gap-2 active:translate-y-0.5"
          >
            <BookOpen className="w-4 h-4 text-[#d4af37]" />
            <span>Field Manual (Guide)</span>
          </button>
        </div>

        <p className="mt-5 text-[11px] font-mono text-[#85705b]">
          Warning: The Royal Society of Engineers disclaims liability for shrapnel or ruined biscuits.
        </p>
      </div>
    </div>
  );
};
