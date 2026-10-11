import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { Flame, Wind, Gauge, Sparkles, Wrench, AlertOctagon, HelpCircle, AlertTriangle } from 'lucide-react';

interface ControlConsoleProps {
  realPressure: number;
  displayedPressure: number;
  temperature: number;
  coalCount: number;
  bellowsActive: boolean;
  bellowsDelaying: boolean;
  ventOpen: boolean;
  brewProgress: number;
  isBrewing: boolean;
  gaugeStuck: boolean;
  gaugeLying: boolean;
  emergencyActive: boolean;
  activeMalfunction: {
    id: string;
    title: string;
    description: string;
    actionLabel: string;
  } | null;
  onShovelCoal: () => void;
  onPumpBellows: () => void;
  onToggleVent: () => void;
  onTapGauge: () => void;
  onPullBrewLever: () => void;
  onEmergencyFix: () => void;
  onTriggerGearChaos: () => void;
  onResolveMalfunction: () => void;
}

export const ControlConsole: React.FC<ControlConsoleProps> = ({
  realPressure,
  displayedPressure,
  temperature,
  coalCount,
  bellowsActive,
  bellowsDelaying,
  ventOpen,
  brewProgress,
  isBrewing,
  gaugeStuck,
  gaugeLying,
  emergencyActive,
  activeMalfunction,
  onShovelCoal,
  onPumpBellows,
  onToggleVent,
  onTapGauge,
  onPullBrewLever,
  onEmergencyFix,
  onTriggerGearChaos,
  onResolveMalfunction,
}) => {
  const [shovelCooldown, setShovelCooldown] = useState(false);

  // Pressure gauge angle calculation (0 PSI = -120deg, 100 PSI = +120deg)
  const needleAngle = -120 + (Math.min(100, Math.max(0, displayedPressure)) / 100) * 240;

  const handleShovel = () => {
    if (shovelCooldown) return;
    setShovelCooldown(true);
    sound.playShovel();
    onShovelCoal();
    setTimeout(() => setShovelCooldown(false), 550);
  };

  const handleBellows = () => {
    onPumpBellows();
  };

  const handleVent = () => {
    onToggleVent();
  };

  const handleTap = () => {
    sound.playGlassTap();
    onTapGauge();
  };

  const handleBrew = () => {
    sound.playLeverPull();
    onPullBrewLever();
  };

  const isTempReady = temperature >= 98;
  const isPressureSafe = realPressure >= 42 && realPressure <= 78;

  return (
    <div
      className={`w-full bg-gradient-to-b from-[#241711] via-[#1a110c] to-[#120b08] border-2 border-[#b38728] rounded-xl p-3 sm:p-5 shadow-2xl text-[#f3ece2] relative transition-colors duration-200 ${
        emergencyActive ? 'ring-4 ring-red-500 bg-[#2b1210]' : ''
      }`}
    >
      {/* Brass corner decorative rivets */}
      <div className="absolute top-2 left-2 rivet" />
      <div className="absolute top-2 right-2 rivet" />
      <div className="absolute bottom-2 left-2 rivet" />
      <div className="absolute bottom-2 right-2 rivet" />

      {/* Active Malfunction Alert Banner if one occurs */}
      {activeMalfunction && (
        <div className="mb-4 p-3 bg-gradient-to-r from-amber-950 via-red-950 to-amber-950 border-2 border-amber-400 rounded-lg flex flex-wrap items-center justify-between gap-3 animate-bounce shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/20 rounded-full border border-amber-400/50">
              <Wrench className="w-5 h-5 text-amber-300 shrink-0 animate-spin" />
            </div>
            <div>
              <p className="text-xs font-serif font-black text-amber-200 tracking-wider uppercase">
                {activeMalfunction.title}
              </p>
              <p className="text-xs text-amber-100/90">{activeMalfunction.description}</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClank();
              onResolveMalfunction();
            }}
            className="px-3.5 py-1.5 bg-gradient-to-b from-amber-500 to-amber-700 hover:from-amber-400 text-black font-serif font-bold text-xs rounded border border-amber-200 transition-all shadow active:scale-95"
          >
            {activeMalfunction.actionLabel}
          </button>
        </div>
      )}

      {/* Main 4-Quadrant Tactile Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 items-stretch">
        {/* PANEL 1: FURNACE & COAL STOKING */}
        <div className="bg-[#1b120d] border border-[#7a591e] rounded-xl p-3 flex flex-col justify-between shadow-inner relative overflow-hidden">
          <div className="absolute top-1 right-2 text-[9px] font-mono text-[#a89279]/50 uppercase">Sec. I</div>
          <div>
            <div className="flex items-center gap-1.5 border-b border-[#5c4217] pb-1.5 mb-2.5">
              <Flame className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="text-xs font-serif font-bold tracking-wider text-[#ffd700] uppercase">
                Furnace & Heat
              </span>
            </div>

            {/* Mercury Column Thermometer */}
            <div className="mb-3 bg-[#110a08] p-2 rounded-lg border border-[#442f13]">
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-[#a89279]">Boiler Temp:</span>
                <span className={`font-black tabular-nums ${isTempReady ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {Math.round(temperature)}°C {isTempReady ? '✓ BOILING' : '(Need 100°)'}
                </span>
              </div>
              <div className="w-full bg-[#0a0504] h-3.5 rounded-full border border-[#6b4c16] overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(6, ((temperature - 20) / 90) * 100))}%`,
                    background:
                      temperature >= 98
                        ? 'linear-gradient(90deg, #f59e0b, #10b981)'
                        : 'linear-gradient(90deg, #dc2626, #ea580c, #f59e0b)',
                  }}
                />
              </div>
            </div>

            {/* Firebox Coal Chunk Indicators */}
            <div className="flex items-center justify-between text-xs font-mono text-[#a89279] mb-2 px-1">
              <span>Firebox Coals:</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded border transition-all ${
                      idx <= coalCount
                        ? 'bg-gradient-to-br from-amber-400 to-orange-600 border-amber-300 shadow-[0_0_8px_#f97316]'
                        : 'bg-[#0f0907] border-[#3f2b15]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Shovel Action Button */}
          <button
            onClick={handleShovel}
            disabled={shovelCooldown}
            className={`w-full py-2.5 px-3 rounded-lg font-serif font-black text-xs uppercase tracking-wider transition-all duration-150 border shadow-md active:translate-y-0.5 ${
              shovelCooldown
                ? 'bg-[#150f0c] text-[#6b5542] border-[#3f2f1e] cursor-not-allowed'
                : 'bg-gradient-to-b from-[#8c4f1c] to-[#4a260a] hover:from-[#a65d21] text-[#faeccf] border-[#d97706]'
            }`}
          >
            {shovelCooldown ? 'Shoveling...' : 'Shovel Coal Chunk (+)'}
          </button>
        </div>

        {/* PANEL 2: LEVER 1 - DELAYED AIR BELLOWS */}
        <div className="bg-[#1b120d] border border-[#7a591e] rounded-xl p-3 flex flex-col justify-between shadow-inner relative overflow-hidden">
          <div className="absolute top-1 right-2 text-[9px] font-mono text-[#a89279]/50 uppercase">Sec. II</div>
          <div>
            <div className="flex items-center gap-1.5 border-b border-[#5c4217] pb-1.5 mb-2.5">
              <Wind className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-xs font-serif font-bold tracking-wider text-[#ffd700] uppercase">
                Lever I: Air Bellows
              </span>
            </div>

            <p className="text-[11px] text-[#bdaaa0] leading-relaxed mb-2">
              Forced-draft bellows. Accelerates furnace combustion to boil water.
            </p>

            {/* Visual Slotted Lever Housing */}
            <div className="bg-[#100906] border border-[#442f13] rounded-lg p-2 flex items-center justify-around h-16 relative overflow-hidden shadow-inner">
              {bellowsDelaying && (
                <div className="absolute inset-0 bg-amber-950/95 border border-amber-400 flex flex-col items-center justify-center p-1 z-10 animate-pulse">
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-tight flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    LEVER SEIZED!
                  </span>
                  <span className="text-[9px] font-mono text-amber-200">Ratcheting gears... (1.2s delay)</span>
                  <div className="w-3/4 h-1 bg-black/60 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-amber-400 animate-[pulse_0.4s_infinite]" style={{ width: '85%' }} />
                  </div>
                </div>
              )}

              <div className="text-center">
                <span className="text-[9px] uppercase font-mono text-[#786450] block leading-none">Draft State</span>
                <span
                  className={`text-xs font-mono font-black ${
                    bellowsActive ? 'text-sky-400 animate-pulse' : 'text-[#a89279]'
                  }`}
                >
                  {bellowsActive ? 'DRAFT ROARING' : 'IDLE (READY)'}
                </span>
              </div>

              {/* Slotted mechanical lever track */}
              <div className="w-8 h-12 bg-[#20140f] rounded-full border-2 border-[#543b17] relative overflow-hidden flex items-center justify-center shadow-inner">
                {/* Brass shaft with turned wood knob */}
                <div
                  className={`w-4 h-7 bg-gradient-to-b from-[#d4af37] via-[#b38728] to-[#593e11] rounded-full transition-transform duration-300 border border-[#ffd700] shadow-md ${
                    bellowsActive ? 'translate-y-2.5' : bellowsDelaying ? 'translate-y-0 animate-bounce' : '-translate-y-2.5'
                  }`}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleBellows}
            disabled={bellowsDelaying || bellowsActive}
            className={`w-full mt-3 py-2.5 px-3 rounded-lg font-serif font-black text-xs uppercase tracking-wider border shadow-md active:translate-y-0.5 transition-all ${
              bellowsDelaying
                ? 'bg-amber-950 text-amber-200 border-amber-500 cursor-wait'
                : bellowsActive
                ? 'bg-sky-950 text-sky-200 border-sky-500'
                : 'bg-gradient-to-b from-[#b38728] via-[#8c6519] to-[#5c400c] hover:from-[#c99a32] text-[#faeccf] border-[#ffd700]'
            }`}
          >
            {bellowsDelaying ? 'Ratcheting Gear...' : bellowsActive ? 'Draft Roaring' : 'Pull Bellows Lever'}
          </button>
        </div>

        {/* PANEL 3: PRESSURE GAUGE & LEVER 2 (REVERSED VALVE) */}
        <div className="bg-[#1b120d] border border-[#7a591e] rounded-xl p-3 flex flex-col justify-between shadow-inner relative overflow-hidden">
          <div className="absolute top-1 right-2 text-[9px] font-mono text-[#a89279]/50 uppercase">Sec. III</div>
          <div>
            <div className="flex items-center gap-1.5 border-b border-[#5c4217] pb-1.5 mb-2">
              <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-serif font-bold tracking-wider text-[#ffd700] uppercase">
                Lever II & Gauge
              </span>
            </div>

            {/* OLD-FASHIONED PARCHMENT PRESSURE GAUGE */}
            <div
              onClick={handleTap}
              className={`relative w-28 h-28 mx-auto my-1 rounded-full bg-[#fdfbf7] border-4 border-[#b38728] shadow-[0_4px_12px_rgba(0,0,0,0.8)] cursor-pointer select-none group transition-transform ${
                gaugeLying ? 'ring-2 ring-red-500 scale-105' : ''
              }`}
              title="Click dial to tap sticky glass and reveal true pressure!"
            >
              {/* Dial Face Texture & Color Arcs */}
              <div className="absolute inset-1 rounded-full border border-[#8a7258] overflow-hidden bg-[radial-gradient(circle_at_center,#fff_45%,#ede3d2_100%)]">
                {/* Safe brewing arc marker */}
                <div className="absolute top-1.5 left-6 right-6 text-[8px] font-serif font-bold text-emerald-800 text-center uppercase tracking-tight">
                  Safe Zone (42–78)
                </div>
                {/* Danger threshold indicator */}
                <div className="absolute right-1 top-8 text-[7px] font-mono font-bold text-red-700">
                  95 PSI !
                </div>

                {/* Subtle cracked glass texture when lying or stuck */}
                {(gaugeStuck || gaugeLying) && (
                  <div className="absolute inset-0 bg-amber-950/20 pointer-events-none" />
                )}
              </div>

              {/* Moving Pressure Needle with Brass Hub */}
              <div
                className="absolute w-1 bg-red-700 origin-bottom rounded-full transition-transform duration-200 shadow"
                style={{
                  height: '42px',
                  top: '12px',
                  left: '52px',
                  transform: `rotate(${needleAngle}deg)`,
                }}
              />
              <div className="absolute top-12 left-12 w-4 h-4 rounded-full bg-gradient-to-br from-[#d4af37] to-[#593e11] border border-black shadow" />

              {/* Sticky / Lying banner overlay */}
              {(gaugeStuck || gaugeLying) && (
                <div className="absolute inset-0 bg-black/65 rounded-full flex flex-col items-center justify-center p-1 backdrop-blur-[1px] animate-pulse">
                  <span className="text-[8px] font-serif font-black text-amber-300 uppercase tracking-tighter text-center leading-none">
                    {gaugeLying ? 'UNAPPROVED PSI!' : 'Needle Stuck!'}
                  </span>
                  <span className="text-[8px] font-mono text-white underline mt-0.5">Tap Glass!</span>
                </div>
              )}
            </div>

            <div className="text-center font-mono text-xs mt-1">
              <span className="text-[#968270]">Reading: </span>
              <span
                className={`font-black tabular-nums ${
                  displayedPressure > 80
                    ? 'text-red-400'
                    : displayedPressure >= 42 && displayedPressure <= 78
                    ? 'text-emerald-400'
                    : 'text-amber-300'
                }`}
              >
                {Math.round(displayedPressure)} PSI
              </span>
              {gaugeLying && (
                <span className="block text-[9px] text-red-400 font-sans italic">
                  (Unapproved by science)
                </span>
              )}
            </div>
          </div>

          {/* LEVER II: REVERSED CONTROLS */}
          <div className="mt-2">
            <div className="text-[9px] font-mono text-amber-300 text-center mb-1 flex items-center justify-center gap-1">
              <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Reversed Valve: PULL seals, RELEASE vents!</span>
            </div>
            <button
              onClick={handleVent}
              className={`w-full py-2 px-3 rounded-lg font-serif font-bold text-xs uppercase tracking-wider border transition-all active:translate-y-0.5 shadow-md ${
                ventOpen
                  ? 'bg-gradient-to-b from-emerald-800 to-emerald-950 text-emerald-100 border-emerald-400 shadow-[0_0_8px_#10b981]'
                  : 'bg-gradient-to-b from-red-800 to-red-950 text-red-100 border-red-500 shadow-[0_0_8px_#ef4444]'
              }`}
            >
              {ventOpen
                ? 'Lever II: [VENTING OPEN (HISSING)]'
                : 'Lever II: [PULLED DOWN - SEALS SHUT!]'}
            </button>
          </div>
        </div>

        {/* PANEL 4: LEVER 3 - TEA INFUSION PLUNGER */}
        <div className="bg-[#1b120d] border-2 border-[#c59b27] rounded-xl p-3 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-1 right-2 text-[9px] font-mono text-[#a89279]/50 uppercase">Sec. IV</div>
          <div>
            <div className="flex items-center gap-1.5 border-b border-[#5c4217] pb-1.5 mb-2.5">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="text-xs font-serif font-bold tracking-wider text-[#ffd700] uppercase">
                Lever III: Tea Plunger
              </span>
            </div>

            {/* Readiness Checklist */}
            <div className="bg-[#100906] border border-[#442f13] rounded-lg p-2 text-xs space-y-1.5 mb-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[#a89279]">1. Heat 100°C:</span>
                <span className={isTempReady ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                  {isTempReady ? 'READY' : 'UNBOILED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a89279]">2. PSI (42–78):</span>
                <span className={isPressureSafe ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {isPressureSafe ? 'OPTIMAL' : 'OUT OF RANGE'}
                </span>
              </div>
            </div>

            {/* Brewing Infusion Meter */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-[#ffd700]">Infusion Fill:</span>
                <span className="font-black tabular-nums text-emerald-400">{Math.round(brewProgress)}%</span>
              </div>
              <div className="w-full bg-[#0a0504] h-4 rounded-full border border-[#b38728] overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 transition-all duration-200"
                  style={{ width: `${brewProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Master Plunger Button */}
          <button
            onClick={handleBrew}
            className={`w-full py-3 px-3 rounded-lg font-serif font-black text-xs uppercase tracking-widest transition-all duration-150 border-2 shadow-xl active:scale-95 ${
              isBrewing
                ? 'bg-emerald-600 text-white border-emerald-300 animate-pulse shadow-[0_0_15px_#10b981]'
                : isTempReady && isPressureSafe
                ? 'bg-gradient-to-b from-[#ffd700] via-[#c59b27] to-[#785412] hover:from-[#ffe066] text-black border-[#fff3b0] shadow-[0_0_12px_#ffd700]'
                : 'bg-gradient-to-b from-[#4a3219] to-[#2b1b0d] hover:from-[#5c3e1e] text-[#c9b79f] border-[#7a591e]'
            }`}
          >
            {isBrewing ? 'INFUSING TEA LEAVES...' : 'ENGAGE TEA PLUNGER'}
          </button>
        </div>
      </div>

      {/* Bottom Emergency Fix & Gear Linkage Actions */}
      <div className="mt-4 pt-3 border-t border-[#442c16] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onEmergencyFix}
            className={`px-4 py-2.5 rounded-lg font-serif font-black text-xs uppercase tracking-wider flex items-center gap-2 border-2 transition-all shadow-xl active:scale-95 ${
              emergencyActive
                ? 'bg-red-600 text-white border-red-300 animate-pulse shadow-[0_0_18px_#ef4444]'
                : 'bg-gradient-to-r from-red-800 via-red-900 to-red-800 hover:from-red-700 text-red-100 border-red-500 shadow-md'
            }`}
          >
            <AlertOctagon className="w-4 h-4 text-red-300 animate-spin" />
            <span>EMERGENCY FIX (DO NOT PRESS)</span>
          </button>
          <span className="text-[10px] text-[#9c8472] hidden sm:inline font-mono">
            *Certified placebo protocol
          </span>
        </div>

        <button
          onClick={onTriggerGearChaos}
          className="px-3.5 py-2 bg-gradient-to-b from-[#2e1d15] to-[#1c110c] hover:from-[#3e271c] border border-[#8a682a] rounded-lg text-xs font-mono text-[#ffd700] flex items-center gap-1.5 transition-all shadow active:translate-y-0.5"
          title="Manually provoke interconnected gear linkage"
        >
          <span>⚙ Provoke Gear Linkage (Chaos)</span>
        </button>
      </div>
    </div>
  );
};
