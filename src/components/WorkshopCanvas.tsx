import React, { useEffect, useRef } from 'react';

interface WorkshopCanvasProps {
  pressure: number; // 0 to 100
  temperature: number; // 20 to 110
  coalCount: number;
  ventOpen: boolean;
  brewProgress: number; // 0 to 100
  exploded: boolean;
  emergencyFlashing?: boolean;
  gearChaosActive?: boolean;
  onGearClick?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  maxLife: number;
  life: number;
}

interface Debris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  type: 'gear' | 'pipe' | 'coal' | 'cup' | 'kettle';
  size: number;
}

export const WorkshopCanvas: React.FC<WorkshopCanvasProps> = ({
  pressure,
  temperature,
  coalCount,
  ventOpen,
  brewProgress,
  exploded,
  emergencyFlashing = false,
  gearChaosActive = false,
  onGearClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const gearAngleRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const debrisRef = useRef<Debris[]>([]);
  const flameTimeRef = useRef<number>(0);
  const prevExplodedRef = useRef<boolean>(false);

  // Initialize debris if exploded
  useEffect(() => {
    if (exploded && !prevExplodedRef.current) {
      const newDebris: Debris[] = [];
      const types: Array<'gear' | 'pipe' | 'coal' | 'cup' | 'kettle'> = ['gear', 'pipe', 'coal', 'cup', 'kettle'];
      for (let i = 0; i < 28; i++) {
        newDebris.push({
          x: 380 + (Math.random() - 0.5) * 120,
          y: 200 + (Math.random() - 0.5) * 80,
          vx: (Math.random() - 0.5) * 18,
          vy: -Math.random() * 14 - 4,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.4,
          type: types[Math.floor(Math.random() * types.length)],
          size: Math.random() * 20 + 12,
        });
      }
      debrisRef.current = newDebris;

      // Heavy explosion smoke cloud & fireball
      for (let i = 0; i < 90; i++) {
        particlesRef.current.push({
          x: 360 + (Math.random() - 0.5) * 140,
          y: 200 + (Math.random() - 0.5) * 90,
          vx: (Math.random() - 0.5) * 9,
          vy: -Math.random() * 8 - 2,
          size: Math.random() * 40 + 20,
          alpha: 0.95,
          color: Math.random() > 0.35 ? 'rgba(25,20,16,' : 'rgba(235,110,25,',
          maxLife: 95,
          life: 0,
        });
      }
    }
    prevExplodedRef.current = exploded;
  }, [exploded]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Dark Victorian brick & weathered mahogany workshop background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#110c0a');
      bgGrad.addColorStop(0.6, '#18110e');
      bgGrad.addColorStop(1, '#0c0806');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      flameTimeRef.current += 0.05;
      const flameTime = flameTimeRef.current;

      // 2. Gas Lantern Glow (Flickering light on left and center)
      const lanternFlicker = Math.sin(flameTime * 5) * 0.04 + Math.cos(flameTime * 11) * 0.02;
      const lanternGlow = ctx.createRadialGradient(80, 80, 10, 80, 80, 260);
      lanternGlow.addColorStop(0, `rgba(245, 175, 65, ${0.32 + lanternFlicker})`);
      lanternGlow.addColorStop(0.5, `rgba(180, 95, 20, ${0.12 + lanternFlicker})`);
      lanternGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lanternGlow;
      ctx.fillRect(0, 0, w, h);

      // Gas wall lamp fixture (x: 80, y: 70)
      ctx.fillStyle = '#6b4e1d';
      ctx.fillRect(50, 75, 30, 4); // bracket
      ctx.beginPath();
      ctx.arc(80, 80, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd54f';
      ctx.fill();
      ctx.strokeStyle = '#b38728';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Atmospheric brick seams & timber framing
      ctx.strokeStyle = 'rgba(65, 45, 35, 0.4)';
      ctx.lineWidth = 1;
      for (let y = 35; y < 270; y += 20) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(w - 30, y);
        ctx.stroke();
      }

      // 3. Gear Train Animation Speed
      const speed = exploded ? 0 : 0.02 + (pressure / 100) * 0.09 + (gearChaosActive ? 0.08 : 0);
      gearAngleRef.current += speed;
      const gearAngle = gearAngleRef.current;

      // Master Spoked Brass Gear Drawer
      const drawOrnateGear = (
        gx: number,
        gy: number,
        radius: number,
        teeth: number,
        angle: number,
        bodyColor: string,
        spokeCount = 4
      ) => {
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(angle);

        // Gear Teeth & Outer Ring
        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = '#3e2a0f';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        for (let i = 0; i < teeth; i++) {
          const toothAngle = (i * 2 * Math.PI) / teeth;
          const halfTooth = Math.PI / teeth;
          const rInner = radius * 0.82;
          const rOuter = radius * 1.14;

          const a1 = toothAngle - halfTooth * 0.45;
          const a2 = toothAngle - halfTooth * 0.25;
          const a3 = toothAngle + halfTooth * 0.25;
          const a4 = toothAngle + halfTooth * 0.45;

          if (i === 0) {
            ctx.moveTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
          } else {
            ctx.lineTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
          }
          ctx.lineTo(Math.cos(a2) * rOuter, Math.sin(a2) * rOuter);
          ctx.lineTo(Math.cos(a3) * rOuter, Math.sin(a3) * rOuter);
          ctx.lineTo(Math.cos(a4) * rInner, Math.sin(a4) * rInner);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner rim hollow cutout
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.76, 0, Math.PI * 2);
        ctx.fillStyle = '#17110e';
        ctx.fill();
        ctx.stroke();

        // Decorative Spokes
        for (let s = 0; s < spokeCount; s++) {
          const sAngle = (s * Math.PI * 2) / spokeCount;
          ctx.save();
          ctx.rotate(sAngle);
          ctx.fillStyle = bodyColor;
          ctx.fillRect(-2.5, -radius * 0.72, 5, radius * 0.72);
          ctx.restore();
        }

        // Central hub & hex nut
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#5c4114';
        ctx.fill();
        ctx.strokeStyle = '#2b1c09';
        ctx.stroke();

        // Center brass bolt
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.16, 0, Math.PI * 2);
        ctx.fillStyle = '#f5c542';
        ctx.fill();

        ctx.restore();
      };

      if (!exploded) {
        // --- 1. FIREBOX & COAL FURNACE (Left: x: 130 to 320, y: 240 to 350) ---
        ctx.fillStyle = '#261b16';
        ctx.fillRect(140, 240, 190, 110);
        ctx.strokeStyle = '#543b2e';
        ctx.lineWidth = 3;
        ctx.strokeRect(140, 240, 190, 110);

        // Heavy cast iron furnace arch
        ctx.fillStyle = '#0f0a08';
        ctx.beginPath();
        ctx.arc(235, 270, 48, Math.PI, 0);
        ctx.lineTo(283, 345);
        ctx.lineTo(187, 345);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#85612f';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Burning Firebox Coals & Animated Flames
        if (coalCount > 0 || temperature > 28) {
          const flameIntensity = Math.min(1, (coalCount * 0.22 + (temperature - 20) / 80));
          const fGrad = ctx.createRadialGradient(235, 335, 6, 235, 310, 65 * flameIntensity);
          fGrad.addColorStop(0, '#ffffff');
          fGrad.addColorStop(0.2, '#fde047');
          fGrad.addColorStop(0.6, '#ea580c');
          fGrad.addColorStop(1, 'rgba(153, 27, 27, 0)');
          ctx.fillStyle = fGrad;

          ctx.beginPath();
          ctx.moveTo(192, 340);
          for (let fx = 192; fx <= 278; fx += 7) {
            const wave = Math.sin(fx * 0.2 + flameTime * 4) * 13 * flameIntensity;
            ctx.lineTo(fx, 320 - wave);
          }
          ctx.lineTo(278, 340);
          ctx.closePath();
          ctx.fill();

          // Glowing anthracite embers
          for (let i = 0; i < Math.min(coalCount, 5); i++) {
            const cx = 205 + i * 14;
            const cy = 338 - (i % 2) * 5;
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fill();
            // Core white-hot spot
            ctx.fillStyle = '#fffbeb';
            ctx.beginPath();
            ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // --- 2. MULTI-TIERED BRASS BOILER (x: 155 to 315, y: 70 to 240) ---
        const boilerGrad = ctx.createLinearGradient(155, 0, 315, 0);
        boilerGrad.addColorStop(0, '#4d3711');
        boilerGrad.addColorStop(0.2, '#dfb54b');
        boilerGrad.addColorStop(0.65, '#b38728');
        boilerGrad.addColorStop(0.9, '#3a290c');
        ctx.fillStyle = boilerGrad;

        // Boiler dome & cylinder
        ctx.beginPath();
        ctx.arc(235, 100, 75, Math.PI, 0);
        ctx.lineTo(310, 240);
        ctx.lineTo(160, 240);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2d1e08';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Copper joint bands with golden rivets
        const bandPositions = [118, 160, 204];
        bandPositions.forEach((by) => {
          ctx.fillStyle = '#b85d19';
          ctx.fillRect(158, by, 154, 11);
          ctx.strokeStyle = '#431904';
          ctx.lineWidth = 1;
          ctx.strokeRect(158, by, 154, 11);

          for (let rx = 166; rx < 310; rx += 13) {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(rx, by + 5.5, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Sight Glass Water Column
        ctx.fillStyle = 'rgba(15, 24, 38, 0.85)';
        ctx.fillRect(172, 130, 14, 75);
        ctx.strokeStyle = '#c59b27';
        ctx.lineWidth = 2;
        ctx.strokeRect(172, 130, 14, 75);

        // Water level inside sight tube
        const waterHeight = Math.max(12, 65 - (temperature > 90 ? (pressure * 0.18) : 0));
        const waterGrad = ctx.createLinearGradient(0, 205 - waterHeight, 0, 205);
        waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
        waterGrad.addColorStop(1, 'rgba(14, 116, 144, 0.95)');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(174, 205 - waterHeight, 10, waterHeight);

        // Boiling bubbles in water tube
        if (temperature > 65) {
          for (let b = 0; b < 4; b++) {
            const bx = 176 + ((b * 3.5 + Math.sin(flameTime * 5 + b) * 2) % 6);
            const by = 202 - ((flameTime * 28 + b * 16) % waterHeight);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // --- 3. SPOKED CLOCKWORK GEAR TRAIN (Top center) ---
        // Gear 1: Primary Brass Drive Gear
        drawOrnateGear(340, 110, 32, 12, gearAngle, '#c59b27', 4);
        // Gear 2: Secondary Copper Intermediate Gear
        drawOrnateGear(396, 110, 26, 10, -gearAngle * 1.2 + 0.25, '#a6541f', 3);
        // Gear 3: Tiny Gold Escapement Gear
        drawOrnateGear(396, 62, 17, 8, gearAngle * 1.75, '#e0b838', 3);

        // Sparks fly from gear mesh point if Gear Chaos is triggered!
        if (gearChaosActive && Math.random() < 0.6) {
          for (let s = 0; s < 3; s++) {
            particlesRef.current.push({
              x: 368,
              y: 110,
              vx: (Math.random() - 0.5) * 4,
              vy: -Math.random() * 4 - 1,
              size: 2 + Math.random() * 2,
              alpha: 1,
              color: 'rgba(255, 215, 0,',
              maxLife: 20,
              life: 0,
            });
          }
        }

        // --- 4. COPPER PIPES & RELIEF VALVE ---
        ctx.fillStyle = '#b85d19';
        ctx.strokeStyle = '#431904';
        ctx.lineWidth = 3;

        // Pipe connecting Boiler Dome -> Tea Kettle & Infuser
        ctx.beginPath();
        ctx.moveTo(235, 70);
        ctx.lineTo(235, 25);
        ctx.arc(250, 25, 15, Math.PI, -Math.PI / 2, false);
        ctx.lineTo(470, 10);
        ctx.arc(470, 25, 15, -Math.PI / 2, 0, false);
        ctx.lineTo(485, 95);
        ctx.stroke();

        // Safety Relief Valve Pipe & Nozzle
        ctx.beginPath();
        ctx.moveTo(290, 75);
        ctx.lineTo(290, 42);
        ctx.lineTo(315, 42);
        ctx.stroke();
        ctx.fillStyle = '#855d23';
        ctx.fillRect(313, 37, 8, 10);

        // --- 5. THE COPPER TEA KETTLE & INFUSION CHAMBER (Right: x: 440 to 590) ---
        // Victorian Copper Tea Kettle
        const kettleX = 485;
        const kettleY = 120;
        const kettleWobble = (temperature > 90 ? Math.sin(flameTime * 20) * 1.5 : 0) + (brewProgress > 0 ? 1 : 0);

        ctx.save();
        ctx.translate(kettleX, kettleY + kettleWobble);

        // Kettle Body (Bulbous copper teapot)
        const kettleGrad = ctx.createRadialGradient(-5, -5, 4, 0, 0, 28);
        kettleGrad.addColorStop(0, '#f28c46');
        kettleGrad.addColorStop(0.7, '#b85d19');
        kettleGrad.addColorStop(1, '#5a2205');
        ctx.fillStyle = kettleGrad;

        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3d1604';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Kettle Brass Lid & Top Finial Knob
        ctx.fillStyle = '#d4af37';
        ctx.beginPath();
        ctx.ellipse(0, -18, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5a4110';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -23, 3, 0, Math.PI * 2);
        ctx.fill();

        // Kettle Curved Handle
        ctx.beginPath();
        ctx.arc(0, -16, 22, -Math.PI * 0.85, -Math.PI * 0.15);
        ctx.strokeStyle = '#3e2415';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Kettle Spout (pours downward into teacup)
        ctx.beginPath();
        ctx.moveTo(-18, -4);
        ctx.quadraticCurveTo(-34, -2, -32, 16);
        ctx.lineTo(-27, 16);
        ctx.quadraticCurveTo(-28, 2, -14, 4);
        ctx.closePath();
        ctx.fillStyle = '#b85d19';
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Steam Whistle Puffs from Kettle Spout/Lid when heated!
        if (temperature > 85 && Math.random() < 0.35) {
          particlesRef.current.push({
            x: kettleX - 30,
            y: kettleY + 12,
            vx: -1.5 - Math.random() * 1.5,
            vy: -1.2 - Math.random() * 1.5,
            size: 4 + Math.random() * 5,
            alpha: 0.75,
            color: 'rgba(240, 248, 255,',
            maxLife: 40,
            life: 0,
          });
        }

        // Animated Golden Tea Stream when brewing is engaged
        if (brewProgress > 3 && brewProgress < 100) {
          ctx.fillStyle = '#d97706';
          ctx.fillRect(kettleX - 31, kettleY + 16, 3.5, 96);
          // Highlight shimmer
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(kettleX - 30, kettleY + 16, 1.2, 96);
        }

        // --- 6. VELVET TRAY & DELICATE PORCELAIN TEACUP (x: 454, y: 246) ---
        const cupX = kettleX - 30;
        const cupY = 246;

        // Brass Filigree Stand & Burgundy Velvet Pad
        ctx.fillStyle = '#b38728';
        ctx.fillRect(cupX - 36, 275, 72, 10);
        ctx.fillStyle = '#831843'; // Royal velvet
        ctx.fillRect(cupX - 32, 272, 64, 4);

        // China Saucer
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cupX, cupY + 24, 26, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b38728';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // China Cup Body with gold trim
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cupX - 16, cupY + 4);
        ctx.quadraticCurveTo(cupX - 14, cupY + 22, cupX - 8, cupY + 22);
        ctx.lineTo(cupX + 8, cupY + 22);
        ctx.quadraticCurveTo(cupX + 14, cupY + 22, cupX + 16, cupY + 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#c59b27';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Gold floral rim
        ctx.strokeStyle = '#b38728';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cupX, cupY + 4, 16, 4, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Cup Handle
        ctx.beginPath();
        ctx.arc(cupX + 18, cupY + 12, 6, -Math.PI / 2, Math.PI / 2);
        ctx.strokeStyle = '#b38728';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Liquid filling cup as brew progresses
        if (brewProgress > 0) {
          const cupLiquidH = Math.min(16, (brewProgress / 100) * 16);
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.ellipse(cupX, cupY + 20 - cupLiquidH, 12, 3, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fragrant White Steam Clouds rising from finished/brewing teacup
        if (brewProgress > 25 && Math.random() < 0.45) {
          particlesRef.current.push({
            x: cupX + (Math.random() - 0.5) * 12,
            y: cupY,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.9 - Math.random() * 0.6,
            size: 3 + Math.random() * 4,
            alpha: 0.75,
            color: 'rgba(245, 250, 255,',
            maxLife: 45,
            life: 0,
          });
        }

        // --- 7. SAFETY RELIEF VALVE STEAM JETS ---
        if (ventOpen || pressure > 75) {
          const count = ventOpen ? 4 : 2;
          for (let p = 0; p < count; p++) {
            particlesRef.current.push({
              x: 321,
              y: 42,
              vx: 2.8 + Math.random() * 3,
              vy: (Math.random() - 0.5) * 1.8,
              size: 5 + Math.random() * 7,
              alpha: 0.85,
              color: 'rgba(240, 246, 255,',
              maxLife: 42,
              life: 0,
            });
          }
        }
      } else {
        // --- EXPLOSION CRATER & FLYING SHRAPNEL ---
        ctx.fillStyle = '#1c1512';
        ctx.beginPath();
        ctx.ellipse(320, 280, 160, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        debrisRef.current.forEach((deb) => {
          deb.x += deb.vx;
          deb.y += deb.vy;
          deb.vy += 0.35;
          deb.rotation += deb.vRot;

          ctx.save();
          ctx.translate(deb.x, deb.y);
          ctx.rotate(deb.rotation);

          if (deb.type === 'gear') {
            drawOrnateGear(0, 0, deb.size, 8, 0, '#c59b27', 3);
          } else if (deb.type === 'kettle') {
            ctx.fillStyle = '#b85d19';
            ctx.beginPath();
            ctx.ellipse(0, 0, deb.size, deb.size * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (deb.type === 'pipe') {
            ctx.fillStyle = '#b85d19';
            ctx.fillRect(-deb.size / 2, -4, deb.size, 8);
          } else if (deb.type === 'cup') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, deb.size * 0.5, 0, Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#c59b27';
            ctx.stroke();
          } else {
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(-deb.size / 3, -deb.size / 3, deb.size * 0.7, deb.size * 0.7);
          }
          ctx.restore();
        });
      }

      // Update & render all particles
      const remainingParticles: Particle[] = [];
      particlesRef.current.forEach((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life += 1;
        pt.size += 0.38;
        const progress = pt.life / pt.maxLife;
        const currentAlpha = Math.max(0, pt.alpha * (1 - progress));

        if (pt.life < pt.maxLife) {
          ctx.fillStyle = `${pt.color} ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
          remainingParticles.push(pt);
        }
      });
      particlesRef.current = remainingParticles;

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [pressure, temperature, coalCount, ventOpen, brewProgress, exploded, emergencyFlashing, gearChaosActive]);

  return (
    <div
      onClick={onGearClick}
      className={`relative w-full overflow-hidden rounded-xl bg-[#140e0c] border-2 shadow-2xl transition-all duration-200 cursor-pointer ${
        emergencyFlashing
          ? 'border-red-500 ring-4 ring-red-500/80 animate-pulse'
          : gearChaosActive
          ? 'border-amber-400 ring-2 ring-amber-400/50'
          : 'border-[#b38728]/50'
      }`}
      title="Click workshop machinery to interact with gear train"
    >
      <canvas
        ref={canvasRef}
        width={680}
        height={360}
        className="w-full h-auto block max-h-[360px] object-contain mx-auto"
      />

      {/* Victorian brass plaque subtitle */}
      <div className="absolute top-2 left-3 text-[11px] font-mono text-[#c59b27] uppercase tracking-widest pointer-events-none drop-shadow flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span>Apparatus Mk. IV • Steam Boiler & Kettle Stand</span>
      </div>

      {/* Emergency flashing overlay banner */}
      {emergencyFlashing && (
        <div className="absolute inset-0 bg-red-950/30 flex items-center justify-center pointer-events-none backdrop-blur-[1px]">
          <div className="bg-red-900/90 border-2 border-red-400 text-white font-serif font-black px-4 py-2 rounded-lg text-sm uppercase tracking-widest animate-bounce shadow-2xl text-center">
            EMERGENCY FIX ENGAGED • STANDBY FOR NOTHING
          </div>
        </div>
      )}

      {/* Gear Chaos Banner */}
      {gearChaosActive && !emergencyFlashing && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded bg-amber-900/90 text-amber-200 text-xs font-mono font-bold animate-pulse tracking-wide border border-amber-400 shadow">
          ⚙ GEAR CHAOS: CROSS-WIRING DETECTED!
        </div>
      )}

      {pressure > 85 && !exploded && !emergencyFlashing && (
        <div className="absolute top-2 right-3 px-2 py-0.5 rounded bg-red-900/90 text-red-200 text-xs font-mono font-bold animate-pulse tracking-wide border border-red-500">
          DANGER: BOILER STRAIN
        </div>
      )}
    </div>
  );
};
