import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { WorkshopCanvas } from './components/WorkshopCanvas';
import { ControlConsole } from './components/ControlConsole';
import { HUD } from './components/HUD';
import { InstructionsModal } from './components/InstructionsModal';
import { GameOverModal } from './components/GameOverModal';
import { sound } from './utils/sound';

type GameScreen = 'TITLE' | 'PLAYING' | 'VICTORY' | 'DEFEAT';

interface Malfunction {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
}

const MALFUNCTION_POOL: Malfunction[] = [
  {
    id: 'loose_screw',
    title: 'Steam Valve Screw Rattling Loose!',
    description: 'Vibrations are unscrewing the primary regulator bolt.',
    actionLabel: 'Tighten Screw with Spanner',
  },
  {
    id: 'soot_chimney',
    title: 'Soot Clog in Flue!',
    description: 'Exhaust chimney is choking on dense Victorian anthracite smoke.',
    actionLabel: 'Knock Flue Clean',
  },
  {
    id: 'lid_wobble',
    title: 'Kettle Lid Sputtering Madly!',
    description: 'Hot water vapor is dislodging the brass infuser seal.',
    actionLabel: 'Clamp Down Seal',
  },
];

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Core gameplay states
  const [timeLeft, setTimeLeft] = useState<number>(90.0);
  const [temperature, setTemperature] = useState<number>(20.0);
  const [realPressure, setRealPressure] = useState<number>(0.0);
  const [displayedPressure, setDisplayedPressure] = useState<number>(0.0);
  const [gaugeStuck, setGaugeStuck] = useState<boolean>(false);
  const [gaugeLying, setGaugeLying] = useState<boolean>(false);
  const [lyingValue, setLyingValue] = useState<number>(0);
  const [coalCount, setCoalCount] = useState<number>(0);
  const [bellowsActive, setBellowsActive] = useState<boolean>(false);
  const [bellowsDelaying, setBellowsDelaying] = useState<boolean>(false);
  const [ventOpen, setVentOpen] = useState<boolean>(false); // Starts closed so boiler accumulates pressure naturally!
  const [brewProgress, setBrewProgress] = useState<number>(0.0);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [activeMalfunction, setActiveMalfunction] = useState<Malfunction | null>(null);
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);
  const [gearChaosActive, setGearChaosActive] = useState<boolean>(false);

  // Telemetry for end screen
  const [coalShoveledTotal, setCoalShoveledTotal] = useState<number>(0);
  const [maxPressureReached, setMaxPressureReached] = useState<number>(0);
  const [failureReason, setFailureReason] = useState<'EXPLOSION' | 'TIMEOUT' | null>(null);

  // References to mirror mutable gameplay state inside intervals without restarting them every 100ms
  const realPressureRef = useRef<number>(0.0);
  const displayedPressureRef = useRef<number>(0.0);
  const temperatureRef = useRef<number>(22.0);
  const coalCountRef = useRef<number>(2);
  const bellowsActiveRef = useRef<boolean>(false);
  const ventOpenRef = useRef<boolean>(false);
  const gaugeStuckRef = useRef<boolean>(false);
  const gaugeLyingRef = useRef<boolean>(false);
  const lyingValueRef = useRef<number>(0);
  const isBrewingRef = useRef<boolean>(false);
  const brewProgressRef = useRef<number>(0.0);

  // Notification banners / comical toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bellowsDelayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bellowsActiveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const emergencyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gearChaosTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all pending timeouts on restart or end
  const clearAllActionTimers = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (bellowsDelayTimerRef.current) clearTimeout(bellowsDelayTimerRef.current);
    if (bellowsActiveTimerRef.current) clearTimeout(bellowsActiveTimerRef.current);
    if (emergencyTimerRef.current) clearTimeout(emergencyTimerRef.current);
    if (gearChaosTimerRef.current) clearTimeout(gearChaosTimerRef.current);
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // MECHANIC 5: GEAR CHAOS
  const triggerGearChaos = useCallback(() => {
    if (gearChaosTimerRef.current) clearTimeout(gearChaosTimerRef.current);
    setGearChaosActive(true);
    sound.playGearSlip();
    gearChaosTimerRef.current = setTimeout(() => setGearChaosActive(false), 1800);

    // Chaos effect: changes a second machine setting unexpectedly
    const effectRoll = Math.floor(Math.random() * 3);
    if (effectRoll === 0) {
      // Adds coal unexpectedly
      setCoalCount((prev) => {
        const next = Math.min(5, prev + 1);
        coalCountRef.current = next;
        return next;
      });
      showToast('Gear Chaos! Slipping drive gear jolted the coal feeder (+1 Coal)! Congratulations. You made it worse.');
    } else if (effectRoll === 1) {
      // Inverts relief valve
      setVentOpen((prev) => {
        const next = !prev;
        ventOpenRef.current = next;
        return next;
      });
      showToast('Gear Chaos! Drive gear backfire kicked the pressure valve! The engineer has denied responsibility.');
    } else {
      // Drops temperature slightly
      setTemperature((prev) => {
        const next = Math.max(20, prev - 6);
        temperatureRef.current = next;
        return next;
      });
      showToast('Gear Chaos! Teeth skipped and choked the furnace damper! Congratulations. You made it worse.');
    }
  }, [showToast]);

  // Audio mute handler
  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  }, [isMuted]);

  // Start / Reset Round (Thoroughly resets all state and clears orphan timers)
  const startGame = useCallback(() => {
    clearAllActionTimers();

    // Reset values in state
    setTimeLeft(90.0);
    setTemperature(22.0);
    setRealPressure(0.0);
    setDisplayedPressure(0.0);
    setGaugeStuck(false);
    setGaugeLying(false);
    setLyingValue(0);
    setCoalCount(2); // Start with 2 coals burning
    setBellowsActive(false);
    setBellowsDelaying(false);
    setVentOpen(false); // Vent starts closed so boiler accumulates pressure naturally!
    setBrewProgress(0.0);
    setIsBrewing(false);
    setActiveMalfunction(null);
    setEmergencyActive(false);
    setGearChaosActive(false);
    setCoalShoveledTotal(2);
    setMaxPressureReached(0.0);
    setFailureReason(null);
    setToastMessage(null);
    setScreen('PLAYING');

    // Reset mirror refs
    realPressureRef.current = 0.0;
    displayedPressureRef.current = 0.0;
    temperatureRef.current = 22.0;
    coalCountRef.current = 2;
    bellowsActiveRef.current = false;
    ventOpenRef.current = false;
    gaugeStuckRef.current = false;
    gaugeLyingRef.current = false;
    lyingValueRef.current = 0;
    isBrewingRef.current = false;
    brewProgressRef.current = 0.0;

    sound.stopAll();
    sound.updateBoilerAmbient(0, 0);
  }, [clearAllActionTimers]);

  // Malfunction trigger timer
  useEffect(() => {
    if (screen !== 'PLAYING') return;

    const malfunctionInterval = setInterval(() => {
      // Occasional harmless Victorian malfunction
      if (Math.random() < 0.65 && !activeMalfunction) {
        const randomMalf = MALFUNCTION_POOL[Math.floor(Math.random() * MALFUNCTION_POOL.length)];
        setActiveMalfunction(randomMalf);
        sound.playWhistle();
        showToast(`ALERT: ${randomMalf.title}`);
      }
    }, 16000);

    return () => clearInterval(malfunctionInterval);
  }, [screen, activeMalfunction, showToast]);

  // MECHANIC 3: LYING PRESSURE GAUGE TIMER
  useEffect(() => {
    if (screen !== 'PLAYING') return;

    const lyingInterval = setInterval(() => {
      const currentP = realPressureRef.current;
      const isLying = gaugeLyingRef.current;
      if (currentP > 20 && !isLying && Math.random() < 0.65) {
        setGaugeLying(true);
        gaugeLyingRef.current = true;
        // Invent an unapproved pseudo-scientific pressure reading!
        const fakeReading = Math.random() > 0.5
          ? Math.max(10, Math.round(currentP - 35))
          : Math.min(94, Math.round(currentP + 38));
        setLyingValue(fakeReading);
        lyingValueRef.current = fakeReading;
        sound.playGlassTap();
        showToast('This pressure reading has not been approved by science.');
      }
    }, 15000);

    return () => clearInterval(lyingInterval);
  }, [screen, showToast]);

  // Periodic random gear chaos timer
  useEffect(() => {
    if (screen !== 'PLAYING') return;

    const gearInterval = setInterval(() => {
      if (Math.random() < 0.5) {
        // Trigger spontaneous gear chaos!
        triggerGearChaos();
      }
    }, 22000);

    return () => clearInterval(gearInterval);
  }, [screen, triggerGearChaos]);

  // Main 100ms game physics loop
  useEffect(() => {
    if (screen !== 'PLAYING') return;

    const dt = 0.1; // 100ms step
    const interval = setInterval(() => {
      // 1. Time countdown
      setTimeLeft((prev) => {
        const nextTime = Math.max(0, prev - dt);
        if (nextTime <= 0) {
          sound.playSputter();
          sound.stopAll();
          clearAllActionTimers();
          setFailureReason('TIMEOUT');
          setScreen('DEFEAT');
        }
        return nextTime;
      });

      // 2. Temperature physics
      const currentCoal = coalCountRef.current;
      const isBellows = bellowsActiveRef.current;
      // Coals generate heat; bellows amplifies combustion
      const heatGen = currentCoal * 1.35 * (isBellows ? 2.2 : 1.0);
      const cooling = 0.35; // ambient heat loss
      let nextTemp = temperatureRef.current + (heatGen - cooling) * dt;
      nextTemp = Math.max(20, Math.min(115, nextTemp));
      temperatureRef.current = nextTemp;
      setTemperature(nextTemp);

      // Controlled coal consumption (burns slightly faster under bellows draft)
      if (Math.random() < (isBellows ? 0.022 : 0.008)) {
        setCoalCount((prev) => {
          const nextCoal = Math.max(0, prev - 1);
          coalCountRef.current = nextCoal;
          return nextCoal;
        });
      }

      // 3. Pressure physics
      let pressureDelta = 0;

      // Above 60°C, water converts into steam pressure
      if (nextTemp > 60) {
        const steamRate = ((nextTemp - 60) / 40) * (currentCoal > 0 ? 3.8 : 1.2);
        pressureDelta += steamRate;
      }

      // Vent open aggressively dumps pressure, closed allows accumulation
      const isVent = ventOpenRef.current;
      if (isVent) {
        pressureDelta -= 11.5;
      } else {
        // Natural slight leakage
        pressureDelta -= 0.25;
      }

      const nextPressure = Math.max(0, realPressureRef.current + pressureDelta * dt);
      realPressureRef.current = nextPressure;
      setRealPressure(nextPressure);

      // Track maximum pressure reached
      setMaxPressureReached((p) => Math.max(p, nextPressure));

      // Check BOILER EXPLOSION threshold!
      if (nextPressure >= 95.0) {
        sound.playExplosion();
        sound.stopAll();
        clearAllActionTimers();
        setFailureReason('EXPLOSION');
        setScreen('DEFEAT');
        return;
      }

      // 4. Displayed pressure needle smoothing (unless stuck or lying!)
      let nextDisp = displayedPressureRef.current;
      if (gaugeStuckRef.current) {
        // Frozen needle
      } else if (gaugeLyingRef.current) {
        nextDisp = lyingValueRef.current; // Inaccurate pseudo-scientific needle!
      } else {
        // Smoothly ease toward real pressure
        nextDisp = nextDisp + (nextPressure - nextDisp) * 0.35;
      }
      displayedPressureRef.current = nextDisp;
      setDisplayedPressure(nextDisp);

      // 5. Update ambient audio hissing with pressure
      sound.updateBoilerAmbient(nextPressure / 100, nextTemp / 100);

      // 6. Infusion progress if actively brewing under valid conditions
      if (isBrewingRef.current) {
        const isTempValid = nextTemp >= 96;
        const isPressureValid = nextPressure >= 40 && nextPressure <= 80;

        if (isTempValid && isPressureValid) {
          const nextBrew = brewProgressRef.current + 3.8; // Takes ~2.6s of continuous safe infusion
          brewProgressRef.current = Math.min(100, nextBrew);
          setBrewProgress(brewProgressRef.current);

          if (brewProgressRef.current >= 100) {
            sound.playVictory();
            sound.stopAll();
            clearAllActionTimers();
            setScreen('VICTORY');
            return;
          }
        } else {
          // Conditions fell out of range while plunger was held!
          isBrewingRef.current = false;
          setIsBrewing(false);
          sound.playSputter();
          if (!isTempValid) {
            showToast('Infusion halted: Water dropped below boiling point!');
          } else {
            showToast('Infusion halted: Steam pressure destabilized!');
          }
        }
      }
    }, 100);

    return () => {
      clearInterval(interval);
      sound.stopAll();
    };
  }, [screen, showToast, clearAllActionTimers]);

  // Actions
  const handleShovelCoal = useCallback(() => {
    if (coalCountRef.current >= 5) {
      showToast('Firebox is crammed to maximum capacity!');
      return;
    }
    setCoalCount((prev) => {
      const next = Math.min(5, prev + 1);
      coalCountRef.current = next;
      return next;
    });
    setCoalShoveledTotal((prev) => prev + 1);
    showToast('Coal chunk shoveled into firebox!');
  }, [showToast]);

  // MECHANIC 2: DELAYED LEVER
  const handlePumpBellows = useCallback(() => {
    if (bellowsDelaying || bellowsActiveRef.current) return;
    setBellowsDelaying(true);
    sound.playGearSlip();
    showToast('Lever I seized! Rusty gears slowly engaging... (1.2s delay)');

    bellowsDelayTimerRef.current = setTimeout(() => {
      setBellowsDelaying(false);
      setBellowsActive(true);
      bellowsActiveRef.current = true;
      sound.playLeverPull();
      showToast('Lever I finally slammed down! Heavy draft roaring into coals!');

      bellowsActiveTimerRef.current = setTimeout(() => {
        setBellowsActive(false);
        bellowsActiveRef.current = false;
      }, 3600);
    }, 1200);
  }, [bellowsDelaying, showToast]);

  // MECHANIC 1: REVERSED CONTROLS (LEVER II)
  const handleToggleVent = useCallback(() => {
    setVentOpen((prev) => {
      const next = !prev;
      ventOpenRef.current = next;
      if (!next) {
        // Pulled down: seals shut instead of venting!
        sound.playClank();
        showToast('Congratulations. You made it worse. (Lever II plumbed backwards: PULL seals, RELEASE vents!)');
      } else {
        // Released: actually vents!
        sound.playSteamVent();
        showToast('Lever II released: Emergency bypass open, steam escaping!');
      }
      return next;
    });
  }, [showToast]);

  // MECHANIC 3: TAP GAUGE (RESTORES LYING GAUGE)
  const handleTapGauge = useCallback(() => {
    setGaugeStuck(false);
    setGaugeLying(false);
    gaugeStuckRef.current = false;
    gaugeLyingRef.current = false;
    const realP = realPressureRef.current;
    setDisplayedPressure(realP);
    displayedPressureRef.current = realP;
    sound.playGlassTap();
    showToast('*Ting!* Dial glass tapped. Scientific accuracy temporarily restored!');
  }, [showToast]);

  // MECHANIC 4: USELESS EMERGENCY BUTTON
  const handleEmergencyFix = useCallback(() => {
    if (emergencyTimerRef.current) clearTimeout(emergencyTimerRef.current);
    setEmergencyActive(true);
    sound.playEmergencyFix();
    emergencyTimerRef.current = setTimeout(() => setEmergencyActive(false), 1400);

    const funnyEmergencyQuotes = [
      'Emergency Fix completed. Nothing has changed.',
      'The engineer has denied responsibility.',
      'Emergency protocol engaged: An internal bell rang in an empty room.',
      'Emergency Fix applied: A decorative screw was vigorously tightened.',
      'The emergency valve was painted bright red. Machine state unchanged.',
    ];
    const pickedQuote = funnyEmergencyQuotes[Math.floor(Math.random() * funnyEmergencyQuotes.length)];
    showToast(pickedQuote);
  }, [showToast]);

  const handlePullBrewLever = useCallback(() => {
    const currentTemp = temperatureRef.current;
    const currentRealP = realPressureRef.current;
    const isTempValid = currentTemp >= 98;
    const isPressureValid = currentRealP >= 42 && currentRealP <= 78;

    if (!isTempValid) {
      sound.playSputter();
      showToast('Cannot brew: Water is not boiling yet! Heat to 100°C.');
      return;
    }

    if (currentRealP < 42) {
      sound.playSputter();
      showToast('Insufficient steam: Needle must enter safe green zone (42-78 PSI).');
      return;
    }

    if (currentRealP > 78) {
      sound.playWhistle();
      showToast('Dangerous pressure! Vent steam before the plunger scalding lock clears!');
      return;
    }

    // Engage brewing plunger!
    isBrewingRef.current = true;
    setIsBrewing(true);
    showToast('Infusion plunger engaged! Hot water saturating tea leaves...');
  }, [showToast]);

  const handleResolveMalfunction = useCallback(() => {
    setActiveMalfunction(null);
    showToast('Apparatus malfunction rectified by swift Victorian engineering!');
  }, [showToast]);

  return (
    <div className="min-h-screen bg-[#0e0a09] text-[#e8ded1] flex flex-col items-center select-none font-sans">
      {/* 1. TITLE SCREEN */}
      {screen === 'TITLE' && (
        <TitleScreen
          onStartGame={startGame}
          onOpenManual={() => setShowManualModal(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 2. GAMEPLAY VIEW */}
      {(screen === 'PLAYING' || screen === 'VICTORY' || screen === 'DEFEAT') && (
        <div
          className={`w-full max-w-5xl flex flex-col items-center p-2 sm:p-4 pb-8 min-h-screen transition-transform ${
            (emergencyActive || activeMalfunction !== null || (realPressure > 88 && screen === 'PLAYING'))
              ? 'shake-active'
              : ''
          }`}
        >
          {/* Header Bar HUD */}
          <HUD
            timeLeft={timeLeft}
            pressure={realPressure}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onOpenManual={() => setShowManualModal(true)}
          />

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="w-full my-2 px-4 py-2 bg-[#2d1f18] border border-[#b38728] rounded-lg text-xs font-mono text-[#ffd700] text-center shadow animate-fade-in flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Canvas Engine: Machinery, Steam, Gears, Firebox, Teacup */}
          <div className="w-full my-2">
            <WorkshopCanvas
              pressure={realPressure}
              temperature={temperature}
              coalCount={coalCount}
              ventOpen={ventOpen}
              brewProgress={brewProgress}
              exploded={screen === 'DEFEAT' && failureReason === 'EXPLOSION'}
              emergencyFlashing={emergencyActive}
              gearChaosActive={gearChaosActive}
              onGearClick={triggerGearChaos}
            />
          </div>

          {/* Tactile Brass Console Controls */}
          <div className="w-full">
            <ControlConsole
              realPressure={realPressure}
              displayedPressure={displayedPressure}
              temperature={temperature}
              coalCount={coalCount}
              bellowsActive={bellowsActive}
              bellowsDelaying={bellowsDelaying}
              ventOpen={ventOpen}
              brewProgress={brewProgress}
              isBrewing={isBrewing}
              gaugeStuck={gaugeStuck}
              gaugeLying={gaugeLying}
              emergencyActive={emergencyActive}
              activeMalfunction={activeMalfunction}
              onShovelCoal={handleShovelCoal}
              onPumpBellows={handlePumpBellows}
              onToggleVent={handleToggleVent}
              onTapGauge={handleTapGauge}
              onPullBrewLever={handlePullBrewLever}
              onEmergencyFix={handleEmergencyFix}
              onTriggerGearChaos={triggerGearChaos}
              onResolveMalfunction={handleResolveMalfunction}
            />
          </div>

          {/* Quick instructions strip below console */}
          <div className="w-full mt-3 px-3 py-2 bg-[#18110e] border border-[#443118] rounded-lg text-[11px] font-mono text-[#a89279] flex flex-wrap items-center justify-between gap-2">
            <span>Goal: Boil water to 100°C • Maintain 42–78 PSI • Pull Lever III to infuse tea</span>
            <span className="text-amber-400">Remember: Lever II is reversed! Tap gauge if readings look suspicious!</span>
          </div>
        </div>
      )}

      {/* 3. FIELD MANUAL MODAL */}
      {showManualModal && (
        <InstructionsModal
          onClose={() => setShowManualModal(false)}
          onStartGame={() => {
            setShowManualModal(false);
            if (screen === 'TITLE') startGame();
          }}
          showStartButton={screen === 'TITLE'}
        />
      )}

      {/* 4. GAME OVER MODAL (VICTORY OR DEFEAT) */}
      {(screen === 'VICTORY' || screen === 'DEFEAT') && (
        <GameOverModal
          status={screen}
          failureReason={failureReason}
          timeSpent={90.0 - timeLeft}
          coalShoveledTotal={coalShoveledTotal}
          maxPressureReached={maxPressureReached}
          teaQualityScore={Math.round(brewProgress)}
          onRestart={startGame}
        />
      )}
    </div>
  );
}
