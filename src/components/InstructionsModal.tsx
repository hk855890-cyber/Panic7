import React from 'react';
import { X, Flame, Wind, Gauge, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/sound';

interface InstructionsModalProps {
  onClose: () => void;
  onStartGame?: () => void;
  showStartButton?: boolean;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  onClose,
  onStartGame,
  showStartButton = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-lg w-full bg-[#1e1511] border-4 border-[#b38728] rounded-2xl p-5 sm:p-6 shadow-2xl text-[#f3ece2]">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClank();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 bg-[#2c1e17] hover:bg-[#3d2a20] border border-[#7a591e] rounded-lg text-[#d4af37] transition-colors"
          aria-label="Close manual"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-[#5a4218] pb-3 mb-4 text-center">
          <span className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase block">
            Official Operating Instructions
          </span>
          <h2 className="font-serif font-bold text-2xl text-[#ffd700] uppercase tracking-wide">
            Field Manual Mk. IV
          </h2>
        </div>

        {/* Instructions Body */}
        <div className="space-y-3 text-xs sm:text-sm text-[#cebeab] max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex items-start gap-3 bg-[#140e0b] p-2.5 rounded-lg border border-[#4a3614]">
            <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#ffd700] block mb-0.5">1. Stoke the Furnace (Delayed Lever I)</strong>
              Shovel coal chunks into the firebox. When you pull Lever I (Air Bellows), expect a <strong>1.2-second groaning gear delay</strong> before draft kicks in!
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#140e0b] p-2.5 rounded-lg border border-[#4a3614]">
            <Wind className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#ffd700] block mb-0.5">2. Reversed Valve (Lever II)</strong>
              Lever II is plumbed backwards: <strong>Pulling it seals steam shut</strong>, while <strong>releasing it vents steam</strong>. Keep pressure between 42 and 78 PSI!
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#140e0b] p-2.5 rounded-lg border border-[#4a3614]">
            <Gauge className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#ffd700] block mb-0.5">3. The Lying Gauge</strong>
              The dial needle occasionally displays values <em>"unapproved by science"</em> or gets stuck. Click the dial glass to tap it and verify true boiler pressure.
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#140e0b] p-2.5 rounded-lg border border-[#4a3614]">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#ffd700] block mb-0.5">4. Plunge for Tea & Beware Gear Chaos</strong>
              Once water reaches 100°C and true PSI is 42–78, pull Lever III. Beware: drive gears may spontaneously cross-wire settings! (And remember: the EMERGENCY FIX button is 100% placebo).
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-5 pt-3 border-t border-[#5a4218] flex items-center justify-end gap-3">
          <button
            onClick={() => {
              sound.playClank();
              onClose();
            }}
            className="px-4 py-2 bg-[#2d1f18] hover:bg-[#3d2a20] border border-[#7a591e] rounded-lg text-xs font-serif uppercase tracking-wider text-[#e6d8c8] transition-colors"
          >
            Understood
          </button>
          {showStartButton && onStartGame && (
            <button
              onClick={() => {
                sound.playClank();
                onClose();
                onStartGame();
              }}
              className="px-5 py-2 bg-gradient-to-b from-[#d4af37] to-[#8a682a] text-black font-serif font-black rounded-lg text-xs uppercase tracking-wider shadow border border-[#ffe066]"
            >
              Enter Workshop
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
