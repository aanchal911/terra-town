# 🌍 TerraTown - Carbon Footprint Awareness Platform

An interactive 3D web experience that transforms carbon footprint tracking into a living, breathing floating archipelago. Every eco-friendly action you log physically grows, heals, and expands your personal sky islands.

## 🎬 Demo

![TerraTown Screenshot](./Screenshot%202026-06-21%20181734.png)

**📹 [Watch Full Video Demo](./Screen%20Recording%202026-06-09%20233332.mp4)**

> Watch the floating islands come alive as you track your carbon footprint!

---

## 🎯 Features

### ✨ Interactive 3D Ecosystem
- **5 Floating Islands** representing core carbon categories:
  - 🌱 **Food & Diet** - Track plant-based choices
  - ⚡ **Energy & Utilities** - Monitor renewable energy usage
  - 🚄 **Transportation** - Log low-carbon commutes
  - 💧 **Water Preservation** - Record conservation efforts
  - 🌎 **Overall Impact** - Visualize total carbon sink growth

### 📊 Real-Time Carbon Tracking
- Live annual footprint display (baseline: 16.0 t CO2e → current tracked value)
- Cumulative offset counter in kg CO2e saved
- Dynamic growth levels for each category (0-100%)
- Emissions audit panel with reduction progress visualization

### 🎨 Visual Feedback System
- **Trees sprout** when you log food/diet actions
- **Energy crystals pulse** when renewable power is applied
- **Islands rise and flourish** as categories improve
- **Waterfalls flow** representing water systems
- **Low-poly Ghibli-inspired aesthetic**

### 🎵 Immersive Audio
- **Procedural Ambient Music** - Generative pentatonic synth creating calming atmospheric soundscapes
- **AI Voice Narrator** - Gemini 2.5 Flash TTS-powered "Sky Oracle" that reads your progress aloud

### 🌅 Atmospheric Lighting
- **Sunset Glow** - Warm orange/purple tones
- **Starry Night** - Cool indigo ambiance
- **Morning Dawn** - Soft amber awakening

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge recommended)
- Internet connection (for Three.js CDN and Gemini API)

### Installation

1. **Clone or download** this repository
2. **Open `terratown_the_floating_isles (1).tsx`** in your editor
3. **Add Gemini API Key** (optional, for voice narrator):
   ```typescript
   const apiKey = "YOUR_GEMINI_API_KEY_HERE"; // Line ~350
   ```
4. **Serve the file** using any local server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
5. **Open in browser** at `http://localhost:8000`

---

## 🎮 How to Use

### Navigation
- **Drag mouse** to orbit camera around islands
- **Scroll wheel** to zoom in/out
- **Click island buttons** (left sidebar) to focus on specific categories

### Logging Actions
1. Open **"Log Action"** tab in bottom-right panel
2. Click an action button:
   - 🚄 Low-Carbon Commute (-35 kg)
   - ⚡ Power Grid Efficiency (-42 kg)
   - 🌱 Plant-Based Alternatives (-8.5 kg)
   - 💧 Aquatic Resource Savings (-12 kg)
3. Watch corresponding island grow and receive instant feedback

### Viewing Progress
1. Switch to **"Emissions Audit"** tab
2. Review:
   - Baseline vs Current footprint
   - Reduction progress bar
   - Major emission threat warning
   - Cumulative offset saved

### Audio Controls
- **Music Icon** (top-right) - Toggle procedural ambient music
- **Oracle Narrator** (top-right) - Generate AI voice summary of your progress

---

## 📐 Technical Architecture

### Tech Stack
- **React** - Component framework
- **Three.js** (r128) - 3D WebGL rendering
- **Web Audio API** - Procedural music synthesis
- **Gemini 2.5 Flash** - Text-to-speech narration
- **Lucide React** - Icon system
- **Tailwind CSS** - Styling

### Key Components

| Component | Purpose |
|-----------|---------|
| `App` | Main orchestrator, Three.js scene initialization |
| `SkyHeader` | Carbon metrics display + audio controls |
| `CelestialDial` | Day/night cycle switcher |
| `IslandNavigator` | Category selector with growth levels |
| `CarbonMonitorPanel` | Action logger + emissions audit |
| `TutorialScroll` | First-time user guide |

### 3D Elements
- **Low-poly islands** with procedural rock formations
- **Procedural trees** that grow when actions are logged
- **Animated turbines** on Energy island
- **Glowing crystals** that pulse with energy events
- **Particle waterfalls** on Water island
- **Fluffy cloud banks** drifting in background
- **Flying birds** on circular flight paths
- **Ambient dust particles** floating upward

---

## 🔧 Customization

### Adjust Carbon Values
Edit action impacts in `logCarbonAction` calls:
```typescript
onClick={() => logCarbonAction('future', 35.0)} // Change 35.0 to your value
```

### Add New Actions
1. Add button in `CarbonMonitorPanel` "actions" tab
2. Call `logCarbonAction(category, kgSaved)`
3. Category options: `'seed'`, `'energy'`, `'water'`, `'future'`, `'forest'`

### Modify Island Positions
In `initThreeWorld()`:
```typescript
const seedIsle = createIslandGroup('seed', { x: 0, y: 1.5, z: 0 }, ...);
// Change x, y, z coordinates
```

---

## 🐛 Known Issues & Fixes

✅ **Fixed in latest version:**
- Camera lookAt bug causing jittery movement
- Islands not respecting original Y positions during float animation
- Water action ID mismatch in state updates
- Tutorial markdown not rendering bold text correctly

🔄 **Future Enhancements:**
- LocalStorage persistence for actions
- Dynamic `biggestSource` calculation based on category weights
- Mobile touch event handlers
- Export progress report as PDF

---

## 📊 Carbon Math Reference

### Example Action Impacts
- **1 week of plant-based meals**: ~8.5 kg CO2e saved
- **1 day renewable energy**: ~42 kg CO2e avoided
- **1 week public transit commute**: ~35 kg CO2e reduced
- **Low-flow fixtures + cold water washing**: ~12 kg CO2e offset

### Average US Carbon Footprint
- **Baseline**: ~16.0 metric tons CO2e/year
- **Target**: <10 tons (moderate lifestyle changes)
- **Global Average**: ~4.8 tons
- **Sustainable Target**: <2 tons by 2050

---

## 🌟 Credits

- **Inspiration**: Studio Ghibli's floating islands aesthetic
- **Three.js**: 3D rendering engine
- **Gemini AI**: Voice synthesis technology
- **Carbon Data**: EPA, Carbon Footprint Ltd. estimates

---

## 📄 License

MIT License - Feel free to fork, modify, and use for educational or personal projects.

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Add more carbon categories (waste, consumption, etc.)
- Implement data export/import
- Create mobile-responsive controls
- Add multiplayer comparison mode
- Integrate real smart home APIs

---

**Built with 💚 for a sustainable future**
