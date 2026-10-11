# Steam Panic: The World's Worst Invention

<div align="center">
  <p><strong>Game Jam Theme:</strong> Steampunk • <strong>Event:</strong> The Worst Game Wins</p>
  <p><em>"Brew a single, delicate cup of Earl Grey tea before the boiler detonates!"</em></p>
</div>

---

## ☕ Concept & Overview

You are an eccentric Victorian inventor in 1889 who has constructed the **Omnificent Hydro-Pneumatic Infusion Apparatus Mk. IV**. It weighs three tons, consumes anthracite coal at an alarming rate, and every single control is intentionally inconvenient, comically unreliable, and reversed.

You have exactly **90 seconds** to stoke the coals, boil the water to 100°C, balance steam pressure within the safe green zone (42–78 PSI), and engage the tea plunger. If the pressure exceeds 95 PSI, the boiler explodes into orbit!

---

## ⚙ The Five Deliberately Terrible Mechanics

1. **Reversed Controls (Lever II)**:  
   Due to faulty Victorian plumbing, pulling Lever II down *seals* the emergency bypass shut (building steam), while releasing it opens the vent.
2. **Delayed Lever (Lever I: Air Bellows)**:  
   Pulling the bellows lever seizes for a 1.2-second groaning gear delay before slamming down with heavy draft into the coals.
3. **Lying Pressure Gauge**:  
   The brass dial needle periodically displays erratic readings *"unapproved by science"*. Tapping the dial glass frees the needle and restores true pressure. Actual pressure is strictly tracked in isolated physical state.
4. **Useless Emergency Button**:  
   A prominent button labeled `EMERGENCY FIX (DO NOT PRESS)`. Pressing it triggers dramatic red warning strobes, klaxon alarms, and comedic denial quotes—while leaving the machine completely untouched.
5. **Gear Chaos**:  
   The interconnected clockwork drive gears occasionally slip teeth, unexpectedly altering a second setting (such as tripping the coal hopper or jostling the relief valve).

---

## 🎮 How to Play & Controls

| Action | Control | Mechanical Effect |
|---|---|---|
| **Stoke Furnace** | Click *Shovel Coal Chunk (+)* | Adds fuel to firebox, accelerating water temperature toward 100°C. |
| **Air Bellows** | Pull *Lever I* | Triggers a 1.2s delayed draft that supercharges heating. |
| **Vent / Seal Steam** | Pull/Release *Lever II* | **Reversed**: Release to vent steam; pull down to seal shut. |
| **Verify Pressure** | Click *Pressure Dial Glass* | Taps sticky needle to reveal true boiler PSI. |
| **Infuse Tea** | Pull *Lever III (Tea Plunger)* | Engages brewing when water is 100°C and PSI is 42–78. |
| **Fix Malfunctions** | Click *Repair Banner* | Quickly resolves vibrating screws, chimney soot, or wobbling lids. |
| **Emergency Fix** | Click *EMERGENCY FIX* | Triggers dramatic placebo animation (0% repair, 100% comedy). |
| **Provoke Chaos** | Click *Canvas Gears* | Intentionally jostles the gear linkage. |

- **Win Condition**: Hold optimal conditions until the tea meter reaches 100%. Receive the Royal Society commendation!
- **Lose Conditions**: Boiler pressure reaching 95.0 PSI (Detonation) or 90.0-second countdown reaching 0 (Cold sludge).

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4 + Custom Victorian Steampunk styles
- **Graphics**: HTML5 Canvas 2D Engine (rotating spoked clockwork gears, firebox embers, steam particle emitters, porcelain teacup fill animation)
- **Audio**: Browser-native Web Audio API synthesizer (procedural metallic clanks, gear ratchets, steam hiss, kettle whistles, explosion booms, and royal brass fanfares—zero external audio files).
- **Zero External Runtime Dependencies**: Fully self-contained, no external CDN assets, no databases, and no API keys required.

---

## 🚀 Local Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/hk855890-cyber/Panic7.git
cd Panic7

# 2. Install dependencies
npm install

# 3. Start development server (Port 3000)
npm run dev
```

Visit `http://localhost:3000` to play.

---

## 📦 Production Build & Deployment

```bash
# Run production build
npm run build

# Run TypeScript linter
npm run lint

# Preview production build locally
npm run preview
```

### Deploy to Vercel
The repository includes a pre-configured `vercel.json` with SPA routing:
1. Connect your repository (`hk855890-cyber/Panic7`) in the [Vercel Dashboard](https://vercel.com).
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Deploy!
