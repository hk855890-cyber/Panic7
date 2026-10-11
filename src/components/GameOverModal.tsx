import React from 'react';
import { RotateCcw, Skull, Clock, Coffee, Award, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface GameOverModalProps {
  status: 'VICTORY' | 'DEFEAT';
  failureReason: 'EXPLOSION' | 'TIMEOUT' | null;
  timeSpent: number;
  coalShoveledTotal: number;
  maxPressureReached: number;
  teaQualityScore: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  failureReason,
  timeSpent,
  coalShoveledTotal,
  maxPressureReached,
  teaQualityScore,
  onRestart,
}) => {
  const isVictory = status === 'VICTORY';
  const isExplosion = failureReason === 'EXPLOSION';

  const getRank = () => {
    if (!isVictory) return 'Disgraced Tinkerer';
    if (timeSpent < 45) return 'Grand High Alchemist of Hot Water';
    if (timeSpent < 70) return 'Certified Royal Boilermaker';
    return 'Lucky Survivor of Steam';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div
        className={`relative max-w-lg w-full bg-gradient-to-b from-[#221611] via-[#1a110c] to-[#120b08] border-4 rounded-2xl p-6 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.95)] text-center text-[#f3ece2] overflow-hidden ${
          isVictory ? 'border-[#ffd700]' : 'border-red-600'
        }`}
      >
        {/* Brass corner rivets */}
        <div className="absolute top-2.5 left-2.5 rivet" />
        <div className="absolute top-2.5 right-2.5 rivet" />
        <div className="absolute bottom-2.5 left-2.5 rivet" />
        <div className="absolute bottom-2.5 right-2.5 rivet" />

        {/* Top Heraldic Icon Badge */}
        <div
          className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3.5 border-2 shadow-xl ${
            isVictory
              ? 'bg-gradient-to-br from-[#ffd700] to-[#8a682a] border-[#ffe066] text-black shadow-[0_0_20px_#ffd700]'
              : isExplosion
              ? 'bg-gradient-to-br from-red-600 to-red-950 border-red-400 text-white shadow-[0_0_20px_#ef4444]'
              : 'bg-gradient-to-br from-amber-700 to-amber-950 border-amber-400 text-amber-200 shadow-[0_0_15px_#f59e0b]'
          }`}
        >
          {isVictory ? (
            <Coffee className="w-8 h-8 text-black" />
          ) : isExplosion ? (
            <Skull className="w-8 h-8 text-white animate-bounce" />
          ) : (
            <Clock className="w-8 h-8 text-amber-200" />
          )}
        </div>

        {/* Plaque Header Tag */}
        <div className="text-[10px] font-mono tracking-widest text-[#a89279] uppercase mb-1 flex items-center justify-center gap-1">
          {isVictory ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Royal Society Commendation</span>
            </>
          ) : (
            <span>Imperial Coroner's Incident Report</span>
          )}
        </div>

        {/* Title */}
        <h2 className="font-serif font-black text-2xl sm:text-3xl uppercase tracking-wider mb-2 leading-tight">
          {isVictory ? (
            <span className="text-[#ffd700] drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]">
              A Splendid Cup of Tea!
            </span>
          ) : isExplosion ? (
            <span className="text-red-500 drop-shadow-[0_2px_10px_rgba(239,68,68,0.6)]">
              Catastrophic Boiler Detonation!
            </span>
          ) : (
            <span className="text-amber-400">Tea Time Has Expired!</span>
          )}
        </h2>

        {/* Satirical Victorian Narrative */}
        <p className="text-xs sm:text-sm text-[#cebeab] leading-relaxed mb-5 font-serif italic px-2">
          {isVictory
            ? 'Against all physical laws and Victorian mechanical probability, the apparatus has dispensed a steaming cup of Earl Grey! Your monocle stayed on, the cup did not shatter, and the Queen is immensely pleased.'
            : isExplosion
            ? 'Excessive steam pressure exceeded the structural limits of copper rivets! The boiler detonated with a thunderous roar. The apparatus is in orbit, and your mustache is entirely soot.'
            : '90 seconds have elapsed. The tea water remained a lukewarm brown sludge. The guests departed in bitter disgust to drink rainwater.'}
        </p>

        {/* Telemetry Scorecard Box */}
        <div className="bg-[#120b08] border-2 border-[#543916] rounded-xl p-4 mb-5 text-left font-mono text-xs space-y-2 shadow-inner">
          <div className="text-[10px] uppercase tracking-widest text-[#a89279] border-b border-[#3b2a15] pb-1.5 mb-2 font-serif font-bold flex items-center justify-between">
            <span>Patent Trial Telemetry</span>
            <span>Ref: 1889-MK4</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#968270]">Time Consumed:</span>
            <span className="text-[#ffd700] font-bold tabular-nums">{timeSpent.toFixed(1)} seconds</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#968270]">Anthracite Coals Burned:</span>
            <span className="text-orange-400 font-bold tabular-nums">{coalShoveledTotal} chunks</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[#968270]">Peak Boiler Pressure:</span>
            <span className={`font-bold tabular-nums ${maxPressureReached > 85 ? 'text-red-400' : 'text-emerald-400'}`}>
              {Math.round(maxPressureReached)} PSI
            </span>
          </div>

          <div className="flex justify-between items-center pt-1.5 border-t border-[#302110]">
            <span className="text-[#968270] flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Inventor Rank:</span>
            </span>
            <span className="text-[#ffd700] font-serif font-black">{getRank()}</span>
          </div>
        </div>

        {/* Primary Restart CTA Button */}
        <button
          onClick={() => {
            sound.playClank();
            onRestart();
          }}
          className={`w-full py-3.5 px-6 rounded-xl font-serif font-black text-sm uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 border-2 shadow-xl active:scale-95 ${
            isVictory
              ? 'bg-gradient-to-b from-[#ffd700] via-[#c59b27] to-[#785412] hover:from-[#ffe066] text-black border-[#fff3b0] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
              : 'bg-gradient-to-b from-red-700 to-red-950 hover:from-red-600 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isVictory ? 'Brew Another Cup (Play Again)' : 'Rebuild Apparatus & Retry'}</span>
        </button>
      </div>
    </div>
  );
};
