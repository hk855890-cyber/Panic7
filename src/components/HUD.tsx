import React from 'react';
import { Volume2, VolumeX, BookOpen, AlertTriangle, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/sound';

interface HUDProps {
  timeLeft: number;
  pressure: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenManual: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  timeLeft,
  pressure,
  isMuted,
  onToggleMute,
  onOpenManual,
}) => {
  const isEmergency = pressure > 85;
  const isTimeRunningLow = timeLeft <= 20;

  // Pocket watch second hand rotation angle (0 to 360 deg based on fractional seconds)
  const watchAngle = (timeLeft % 60) * 6;

  return (
    <header className="w-full bg-gradient-to-b from-[#241711] via-[#1a110c] to-[#120b08] border-2 border-[#b38728] rounded-xl shadow-2xl p-2.5 sm:p-3 relative overflow-hidden">
      {/* Brass corner rivets */}
      <div className="absolute top-1.5 left-1.5 rivet" />
      <div className="absolute top-1.5 right-1.5 rivet" />
      <div className="absolute bottom-1.5 left-1.5 rivet" />
      <div className="absolute bottom-1.5 right-1.5 rivet" />

      {/* Main Top Bar Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Zone 1: Wordmark & Victorian Workshop Plate */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#785412] flex items-center justify-center border border-[#ffd700] shadow-md">
            <span className="font-serif font-black text-sm text-black">⚙</span>
          </div>
          <div>
            <h1 className="font-serif font-black text-base sm:text-lg tracking-wider text-[#ffd700] uppercase drop-shadow leading-tight">
              Steam Panic
            </h1>
            <span className="text-[10px] font-mono tracking-widest text-[#a89279] uppercase block leading-none">
              Apparatus Mk. IV • London 1889
            </span>
          </div>
        </div>

        {/* Zone 2: VICTORIAN POCKET WATCH COUNTDOWN CLOCK */}
        <div className="flex items-center gap-2 sm:gap-3 bg-[#130b08] px-3 py-1.5 rounded-xl border border-[#7a591e] shadow-inner">
          {/* Authentic round pocket watch casing with crown loop */}
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full pocket-watch flex items-center justify-center shrink-0">
            {/* Winding crown at top */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-[#d4af37] rounded-sm border border-[#5a3e14]" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-2 rounded-t-full border border-[#d4af37] border-b-0" />

            {/* Vintage Roman hour tick marks */}
            <span className="absolute top-0.5 text-[7px] font-serif font-bold text-[#451a03]">XII</span>
            <span className="absolute bottom-0.5 text-[7px] font-serif font-bold text-[#451a03]">VI</span>
            <span className="absolute right-0.5 text-[7px] font-serif font-bold text-[#451a03]">III</span>
            <span className="absolute left-0.5 text-[7px] font-serif font-bold text-[#451a03]">IX</span>

            {/* Moving second hand */}
            <div
              className="absolute w-0.5 bg-red-700 origin-bottom transition-transform duration-100 rounded-full"
              style={{
                height: '14px',
                top: '7px',
                transform: `rotate(${watchAngle}deg)`,
              }}
            />
            {/* Center brass arbor */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#3e2723] z-10" />
          </div>

          <div>
            <span className="text-[9px] font-mono uppercase text-[#a89279] block leading-none">
              Chronometer:
            </span>
            <span
              className={`font-mono font-black text-lg sm:text-xl tabular-nums tracking-wider ${
                isTimeRunningLow ? 'text-red-400 animate-pulse' : 'text-[#ffd700]'
              }`}
            >
              {timeLeft.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Zone 3: Vacuum Tube Status Light & Controls */}
        <div className="flex items-center gap-2">
          {/* Vacuum Tube Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
              isEmergency
                ? 'bg-red-950/90 border-red-500 text-red-200 animate-pulse shadow-[0_0_12px_#ef4444]'
                : pressure >= 42 && pressure <= 78
                ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                : 'bg-[#221610] border-[#6b4e1a] text-[#c59b27]'
            }`}
          >
            {isEmergency ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-spin" />
                <span className="font-bold">PRESSURE CRITICAL!</span>
              </>
            ) : pressure >= 42 && pressure <= 78 ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">STABLE STEAM</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="hidden sm:inline">BUILDING HEAD</span>
              </>
            )}
          </div>

          <button
            onClick={() => {
              sound.playClank();
              onOpenManual();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-b from-[#3a281e] to-[#241711] hover:from-[#4d3629] text-[#faeccf] border border-[#8a682a] rounded-lg text-xs font-serif tracking-wide transition-all shadow active:translate-y-0.5"
            title="Open Inventor's Manual"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">Field Manual</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 bg-gradient-to-b from-[#3a281e] to-[#241711] hover:from-[#4d3629] text-[#faeccf] border border-[#8a682a] rounded-lg text-xs transition-all shadow active:translate-y-0.5"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#ffd700]" />
            )}
          </button>
        </div>
      </div>

      {/* Prominent High-Visibility Mission Objective Strip */}
      <div className="mt-2 pt-1.5 border-t border-[#442c16] flex items-center justify-between text-[11px] font-mono text-[#dcd1c0] bg-[#140b07] px-2.5 py-1 rounded">
        <span className="font-bold text-[#ffd700] uppercase tracking-wide">
          Mission:
        </span>
        <span className="text-[#cebeab]">
          1. Stoke coals to reach <strong>100°C</strong> • 2. Maintain <strong>42–78 PSI</strong> (Lever II reversed!) • 3. Pull Lever III to infuse tea
        </span>
      </div>
    </header>
  );
};
