import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Wind, 
  Sun, 
  Droplets, 
  Navigation, 
  Compass, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  ChevronRight,
  Zap,
  CheckCircle2,
  Moon,
  Clock,
  HelpCircle,
  X,
  TrendingDown,
  Activity,
  AlertTriangle,
  Flame,
  Globe,
  Utensils,
  Mic,
  Music,
  Play,
  Square
} from 'lucide-react';

// Helper to convert base64 to ArrayBuffer for the audio processor
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper to convert raw PCM16 signed audio to a standard WAV container
function pcmToWav(pcm16, sampleRate) {
  const buffer = new ArrayBuffer(44 + pcm16.length * 2);
  const view = new DataView(buffer);

  // Write RIFF identifier
  writeString(view, 0, 'RIFF');
  // Write overall file size
  view.setUint32(4, 36 + pcm16.length * 2, true);
  // Write format descriptor
  writeString(view, 8, 'WAVE');
  // Write format chunk header
  writeString(view, 12, 'fmt ');
  // Size of format chunk
  view.setUint32(16, 16, true);
  // Audio format: 1 (uncompressed PCM)
  view.setUint16(20, 1, true);
  // Number of channels: 1 (mono)
  view.setUint16(22, 1, true);
  // Sample rate
  view.setUint32(24, sampleRate, true);
  // Byte rate (sampleRate * blockAlign)
  view.setUint32(28, sampleRate * 2, true);
  // Block align (channels * bytes per sample)
  view.setUint16(32, 2, true);
  // Bits per sample (PCM16)
  view.setUint16(34, 16, true);
  // Write data chunk header
  writeString(view, 36, 'data');
  // Data chunk size
  view.setUint32(40, pcm16.length * 2, true);

  // Write actual PCM16 frames
  for (let i = 0; i < pcm16.length; i++) {
    view.setInt16(44 + i * 2, pcm16[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

class ProceduralAmbientMusic {
  constructor() {
    this.ctx = null;
    this.playing = false;
    this.compressor = null;
    this.notes = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00]; // Pentatonic scale (C3 to A4)
    this.scheduler = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.connect(this.ctx.destination);
    }
  }

  start() {
    this.init();
    if (this.playing) return;
    this.playing = true;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Schedule ambient wind drones and pentatonic chimes
    const scheduleLoop = () => {
      if (!this.playing) return;
      this.playSoftPad();
      this.playChimeNote();
      
      // Schedule next event
      this.scheduler = setTimeout(scheduleLoop, 1500 + Math.random() * 2000);
    };

    scheduleLoop();
  }

  playSoftPad() {
    const now = this.ctx.currentTime;
    const baseFreq = this.notes[Math.floor(Math.random() * 3)]; // Low base note
    
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.linearRampToValueAtTime(800, now + 3);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 1.5);
    gain.gain.linearRampToValueAtTime(0, now + 4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor);

    osc.start(now);
    osc.stop(now + 4);
  }

  playChimeNote() {
    const now = this.ctx.currentTime;
    const chimeFreq = this.notes[4 + Math.floor(Math.random() * 6)]; // Higher melodic note
    
    const osc = this.ctx.createOscillator();
    const delay = this.ctx.createDelay();
    const delayFeedback = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(chimeFreq, now);

    delay.delayTime.value = 0.4;
    delayFeedback.gain.value = 0.3;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    // Wire up delay feedback loop
    osc.connect(gain);
    gain.connect(this.compressor);
    gain.connect(delay);
    delay.connect(delayFeedback);
    delayFeedback.connect(this.compressor);
    delayFeedback.connect(delay);

    osc.start(now);
    osc.stop(now + 2.5);
  }

  stop() {
    this.playing = false;
    if (this.scheduler) {
      clearTimeout(this.scheduler);
    }
  }
}

const ambientSynth = new ProceduralAmbientMusic();

export default function App() {
  const [selectedIsland, setSelectedIsland] = useState('all');
  const [dayTime, setDayTime] = useState('sunset'); // sunset, night, dawn
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('actions'); // actions, footprint
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [showTutorial, setShowTutorial] = useState(true);

  // Carbon Emission Metrics (Real-world based defaults)
  const [carbonFootprint, setCarbonFootprint] = useState(14.8); // Tons of CO2e per year (baseline ~16.0)
  const [totalSavedKg, setTotalSavedKg] = useState(245.5); // Total Kilograms of CO2e offset
  const [biggestSource, setBiggestSource] = useState('Energy & Utilities'); // dynamically calculated
  const [targetReductionPercent, setTargetReductionPercent] = useState(28); // reduction target

  // Dynamic Island status mapped to Carbon Category metrics
  const [growthState, setGrowthState] = useState({
    seed: { level: 22, name: "Food & Diet", icon: "🌱", color: "text-lime-400", weight: 2.1 },
    forest: { level: 38, name: "Overall Impact", icon: "🌎", color: "text-emerald-400", weight: 4.8 },
    energy: { level: 45, name: "Energy & Utilities", icon: "⚡", color: "text-amber-400", weight: 3.5 },
    water: { level: 19, name: "Water Preservation", icon: "💧", color: "text-cyan-400", weight: 1.2 },
    future: { level: 30, name: "Transportation", icon: "🚄", color: "text-purple-400", weight: 3.2 }
  });

  const [completedActions, setCompletedActions] = useState([
    { id: 'plant_based', title: 'Plant-Based Diet Plan', carbonSaved: 8.5, category: 'seed', checked: true },
    { id: 'renewable_elec', title: 'Renewable Power Shift', carbonSaved: 42.0, category: 'energy', checked: false },
    { id: 'commute_green', title: 'Carbon-Neutral Commuting', carbonSaved: 35.0, category: 'future', checked: false },
    { id: 'water_save', title: 'Water Conservation', carbonSaved: 12.0, category: 'water', checked: false },
  ]);

  // Narrator Speech Status state
  const [narratorStatus, setNarratorStatus] = useState('idle'); // idle, generating, playing
  const audioContextRef = useRef(null);
  const currentSpeechAudioSource = useRef(null);

  const canvasRef = useRef(null);
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    islands: {},
    clouds: [],
    waterfalls: [],
    birds: [],
    turbines: [],
    crystals: [],
    ambientDust: null,
    ambientLight: null,
    dirLight: null,
    controls: { target: { x: 0, y: 0, z: 0 }, distance: 26, theta: 0.6, phi: 1.1 }
  });

  const mouseRef = useRef({ isDown: false, prevX: 0, prevY: 0 });

  const triggerNotification = (text, type = 'success') => {
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 4000);
  };

  const handleToggleMusic = () => {
    if (musicPlaying) {
      ambientSynth.stop();
      setMusicPlaying(false);
      triggerNotification("🔇 Ambient Background Music Muted", "music");
    } else {
      ambientSynth.start();
      setMusicPlaying(true);
      triggerNotification("🎵 Soft Ghibli Ambient Music Playing", "music");
    }
  };

  const triggerVoiceNarration = async () => {
    if (narratorStatus === 'generating' || narratorStatus === 'playing') {
      if (currentSpeechAudioSource.current) {
        currentSpeechAudioSource.current.stop();
      }
      setNarratorStatus('idle');
      return;
    }

    setNarratorStatus('generating');
    triggerNotification("🔮 Summoning Oracle's voice guidance...", "voice");

    try {
      const systemPrompt = "You are the wise, ancient protector of TerraTown. You speak with warm, slow, and comforting guidance. Use a gentle and welcoming tone.";
      const userTextPrompt = `Narrate cheerfully and thoughtfully: Greetings, guardian of the skies. I am your Sky Oracle. Your current annual carbon footprint stands at ${carbonFootprint} metric tons. Together, we have successfully saved ${totalSavedKg} kilograms of carbon dioxide. The ${biggestSource} continues to be your largest emissions driver, but your consistent progress in reducing impact is allowing the floating islands to bloom beautifully. Keep nurturing the biosphere.`;

      const payload = {
        contents: [{ parts: [{ text: userTextPrompt }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Sulafat" } // Warm, comforting tone
            }
          }
        },
        model: "gemini-2.5-flash-preview-tts"
      };

      const apiKey = ""; // Canvas handles dynamic API token insertion in runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to reach voice synth services.");
      }

      const result = await response.json();
      const part = result?.candidates?.[0]?.content?.parts?.[0];
      const audioData = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType;

      if (audioData && mimeType && mimeType.startsWith("audio/")) {
        // Extract sample rate from mimeType (e.g. "audio/L16;rate=24000")
        const match = mimeType.match(/rate=(\d+)/);
        const sampleRate = match ? parseInt(match[1], 10) : 24000;

        const pcmBuffer = base64ToArrayBuffer(audioData);
        const pcm16 = new Int16Array(pcmBuffer);
        const wavBlob = pcmToWav(pcm16, sampleRate);
        const audioUrl = URL.createObjectURL(wavBlob);

        // Play the generated sound
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        const audio = new Audio(audioUrl);
        const source = audioContextRef.current.createMediaElementSource(audio);
        source.connect(audioContextRef.current.destination);
        currentSpeechAudioSource.current = audio;

        setNarratorStatus('playing');
        audio.play();

        audio.onended = () => {
          setNarratorStatus('idle');
          currentSpeechAudioSource.current = null;
        };
      } else {
        throw new Error("Unexpected voice return format.");
      }

    } catch (err) {
      console.error(err);
      triggerNotification("⚠️ Voice translation service busy. Try again soon!", "error");
      setNarratorStatus('idle');
    }
  };

  useEffect(() => {
    const { dirLight, ambientLight, scene } = threeRef.current;
    if (!dirLight || !ambientLight || !scene) return;

    if (dayTime === 'sunset') {
      ambientLight.color.setHex(0xffaa66);
      ambientLight.intensity = 1.0;
      dirLight.color.setHex(0xff6633);
      dirLight.position.set(16, 6, 12);
      dirLight.intensity = 1.9;
      scene.fog.color.setHex(0x75225b);
      document.body.style.background = 'linear-gradient(to bottom, #200b3b, #59164c, #943a4e)';
    } else if (dayTime === 'night') {
      ambientLight.color.setHex(0x223366);
      ambientLight.intensity = 0.5;
      dirLight.color.setHex(0x4477ff);
      dirLight.position.set(-15, 12, -10);
      dirLight.intensity = 0.7;
      scene.fog.color.setHex(0x0a0c1f);
      document.body.style.background = 'linear-gradient(to bottom, #03030d, #0d112b, #151d3d)';
    } else if (dayTime === 'dawn') {
      ambientLight.color.setHex(0x88bbff);
      ambientLight.intensity = 0.9;
      dirLight.color.setHex(0xffcc88);
      dirLight.position.set(18, 9, -6);
      dirLight.intensity = 1.5;
      scene.fog.color.setHex(0x342d50);
      document.body.style.background = 'linear-gradient(to bottom, #0d172e, #292345, #754f5c)';
    }
  }, [dayTime]);

  const logCarbonAction = (actionKey, carbonSavedVal) => {
    // Save metric calculations
    const savedTons = carbonSavedVal / 1000; // convert to Metric Tons
    setCarbonFootprint(prev => Math.max(8.2, parseFloat((prev - savedTons).toFixed(2))));
    setTotalSavedKg(prev => parseFloat((prev + carbonSavedVal).toFixed(1)));

    // Process growth mechanics per category
    if (actionKey === 'seed') {
      setGrowthState(prev => {
        const nextLevel = Math.min(prev.seed.level + 8, 100);
        triggerNotification(`🌱 Sustainable Food choices logged: +${carbonSavedVal}kg CO2e Offset!`, 'food');
        spawnTreeProcedural('seed', 1);
        return { ...prev, seed: { ...prev.seed, level: nextLevel } };
      });
    } 
    else if (actionKey === 'energy') {
      setGrowthState(prev => {
        const nextLevel = Math.min(prev.energy.level + 12, 100);
        triggerNotification(`⚡ Renewable utilities applied: +${carbonSavedVal}kg CO2e Offset!`, 'energy');
        if (threeRef.current.crystals) {
          threeRef.current.crystals.forEach(c => {
            if (c.material) {
              c.material.emissiveIntensity = 2.8;
              setTimeout(() => c.material.emissiveIntensity = 1.2, 3000);
            }
          });
        }
        return { ...prev, energy: { ...prev.energy, level: nextLevel } };
      });
      setCompletedActions(prev => prev.map(a => a.id === 'renewable_elec' ? { ...a, checked: true } : a));
    } 
    else if (actionKey === 'water') {
      setGrowthState(prev => {
        const nextLevel = Math.min(prev.water.level + 10, 100);
        triggerNotification(`💧 Water system optimized: +${carbonSavedVal}kg CO2e Offset!`, 'water');
        return { ...prev, water: { ...prev.water, level: nextLevel } };
      });
      setCompletedActions(prev => prev.map(a => a.id === 'water_save' ? { ...a, checked: true } : a));
    } 
    else if (actionKey === 'future') {
      setGrowthState(prev => {
        const nextLevel = Math.min(prev.future.level + 15, 100);
        triggerNotification(`🚄 Commute logged (Public Transit): +${carbonSavedVal}kg CO2e Offset!`, 'transit');
        return { ...prev, future: { ...prev.future, level: nextLevel } };
      });
      setCompletedActions(prev => prev.map(a => a.id === 'commute_green' ? { ...a, checked: true } : a));
    }
    else if (actionKey === 'forest') {
      setGrowthState(prev => {
        const nextLevel = Math.min(prev.forest.level + 11, 100);
        triggerNotification(`🌎 Overall Carbon Sink expanded: +${carbonSavedVal}kg CO2e!`, 'overall');
        spawnTreeProcedural('forest', 2);
        return { ...prev, forest: { ...prev.forest, level: nextLevel } };
      });
    }
  };

  const spawnTreeProcedural = (islandKey, count = 1) => {
    const { scene, islands } = threeRef.current;
    if (!scene || !islands[islandKey]) return;

    const group = islands[islandKey];
    for (let i = 0; i < count; i++) {
      const tree = createProceduralTree();
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 2.2;
      tree.position.set(Math.cos(angle) * radius, 0.4, Math.sin(angle) * radius);
      tree.scale.set(0.1, 0.1, 0.1);
      group.add(tree);

      let scaleVal = 0.1;
      const growInterval = setInterval(() => {
        scaleVal += 0.08;
        if (scaleVal >= 1.0) {
          tree.scale.set(1.1, 1.1, 1.1);
          clearInterval(growInterval);
        } else {
          tree.scale.set(scaleVal, scaleVal, scaleVal);
        }
      }, 40);
    }
  };

  const createProceduralTree = () => {
    const THREE = window.THREE;
    const treeGroup = new THREE.Group();
    
    const trunkGeo = new THREE.CylinderGeometry(0.1, 0.16, 0.75, 5);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4d3319, flatShading: true });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.35;
    treeGroup.add(trunk);

    const leavesGeo = new THREE.ConeGeometry(0.5, 1.1, 5);
    const leavesMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a6b35, 
      roughness: 0.85, 
      flatShading: true 
    });
    const leaves = new THREE.Mesh(leavesGeo, leavesMat);
    leaves.position.y = 1.0;
    treeGroup.add(leaves);

    return treeGroup;
  };

  const focusOnIsland = (key) => {
    const controls = threeRef.current.controls;
    setSelectedIsland(key);

    if (key === 'all') {
      controls.target = { x: 0, y: 0, z: 0 };
      controls.distance = 26;
      controls.phi = 1.1;
    } else if (key === 'seed') {
      controls.target = { x: 0, y: 1.5, z: 0 };
      controls.distance = 9;
      controls.phi = 1.2;
    } else if (key === 'forest') {
      controls.target = { x: 10, y: 2, z: -8 };
      controls.distance = 11;
      controls.phi = 1.05;
    } else if (key === 'energy') {
      controls.target = { x: -10, y: 3, z: -10 };
      controls.distance = 11;
      controls.phi = 0.95;
    } else if (key === 'water') {
      controls.target = { x: -8, y: 1.5, z: 10 };
      controls.distance = 10;
      controls.phi = 1.15;
    } else if (key === 'future') {
      controls.target = { x: 9, y: 3.5, z: 9 };
      controls.distance = 11;
      controls.phi = 0.85;
    }
  };

  useEffect(() => {
    if (!window.THREE) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.onload = initThreeWorld;
      document.head.appendChild(script);
    } else {
      initThreeWorld();
    }

    function initThreeWorld() {
      const THREE = window.THREE;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x75225b, 0.012);
      threeRef.current.scene = scene;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 14, 28);
      threeRef.current.camera = camera;

      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current, 
        antialias: true, 
        alpha: true 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      threeRef.current.renderer = renderer;

      const ambientLight = new THREE.AmbientLight(0xffaa66, 1.0);
      scene.add(ambientLight);
      threeRef.current.ambientLight = ambientLight;

      const dirLight = new THREE.DirectionalLight(0xff6633, 1.9);
      dirLight.position.set(16, 6, 12);
      dirLight.castShadow = true;
      scene.add(dirLight);
      threeRef.current.dirLight = dirLight;

      const hemiLight = new THREE.HemisphereLight(0xffaa66, 0x442266, 0.7);
      scene.add(hemiLight);

      // Low-poly fantasy island generator
      const createIslandGroup = (name, position, size = { r: 4, h: 3 }, color = 0x228b22) => {
        const group = new THREE.Group();
        group.position.set(position.x, position.y, position.z);
        group.userData = { id: name, phase: Math.random() * Math.PI * 2, baseY: position.y };

        const topGeo = new THREE.CylinderGeometry(size.r, size.r - 0.25, 0.6, 9, 1);
        const topMat = new THREE.MeshStandardMaterial({ 
          color: color, 
          roughness: 0.9, 
          flatShading: true 
        });
        const grassTop = new THREE.Mesh(topGeo, topMat);
        grassTop.position.y = 0.3;
        grassTop.receiveShadow = true;
        group.add(grassTop);

        const baseGeo = new THREE.ConeGeometry(size.r - 0.15, size.h, 8);
        const posAttr = baseGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          if (posAttr.getY(i) < 0) {
            const vx = posAttr.getX(i) + (Math.random() - 0.5) * 0.45;
            const vz = posAttr.getZ(i) + (Math.random() - 0.5) * 0.45;
            posAttr.setX(i, vx);
            posAttr.setZ(i, vz);
          }
        }
        baseGeo.computeVertexNormals();

        const baseMat = new THREE.MeshStandardMaterial({ 
          color: 0x42352f, 
          roughness: 0.95, 
          flatShading: true 
        });
        const rockBase = new THREE.Mesh(baseGeo, baseMat);
        rockBase.position.y = -size.h / 2;
        rockBase.rotation.x = Math.PI; 
        group.add(rockBase);

        scene.add(group);
        threeRef.current.islands[name] = group;
        return group;
      };

      // 1. Food & Diet Isle (was Seed)
      const seedIsle = createIslandGroup('seed', { x: 0, y: 1.5, z: 0 }, { r: 3.2, h: 2.5 }, 0x93cf32);
      const hut = new THREE.Group();
      hut.position.set(0, 0.6, 0);
      const wall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), new THREE.MeshStandardMaterial({ color: 0xdfcd9d, flatShading: true }));
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1, 0.8, 5), new THREE.MeshStandardMaterial({ color: 0xb5351d, flatShading: true }));
      roof.position.y = 0.85;
      roof.rotation.y = Math.PI / 5;
      hut.add(wall, roof);
      seedIsle.add(hut);

      // 2. Overall Impact Forest Isle (was Forest)
      const forestIsle = createIslandGroup('forest', { x: 10, y: 2, z: -8 }, { r: 4.4, h: 4 }, 0x187a3b);
      for (let i = 0; i < 6; i++) {
        const tree = createProceduralTree();
        const angle = (i / 6) * Math.PI * 2;
        tree.position.set(Math.cos(angle) * 2.3, 0.4, Math.sin(angle) * 2.3);
        forestIsle.add(tree);
      }

      // 3. Energy & Utilities Isle
      const energyIsle = createIslandGroup('energy', { x: -10, y: 3, z: -10 }, { r: 3.8, h: 3 }, 0xd1a910);
      const turbineGroup = new THREE.Group();
      turbineGroup.position.set(-1.4, 0.6, -1.4);
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.8), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
      mast.position.y = 1.4;
      turbineGroup.add(mast);

      const head = new THREE.Group();
      head.position.y = 2.8;
      const bladeGeo = new THREE.BoxGeometry(1.4, 0.08, 0.05);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      for (let b = 0; b < 3; b++) {
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.x = 0.7;
        blade.rotation.z = (b * Math.PI * 2) / 3;
        head.add(blade);
      }
      turbineGroup.add(head);
      energyIsle.add(turbineGroup);
      threeRef.current.turbines.push(head);

      const crystalGeo = new THREE.OctahedronGeometry(0.8, 0);
      const crystalMat = new THREE.MeshStandardMaterial({ 
        color: 0x00f7ff, 
        emissive: 0x00a2ff, 
        emissiveIntensity: 1.2, 
        roughness: 0.1 
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(1.4, 1.7, 1.4);
      energyIsle.add(crystal);
      threeRef.current.crystals.push(crystal);

      // 4. Water Preservation Isle (was Water)
      const waterIsle = createIslandGroup('water', { x: -8, y: 1.5, z: 10 }, { r: 3.6, h: 3.2 }, 0x1a719c);
      const poolGeo = new THREE.CylinderGeometry(2, 2, 0.1, 9);
      const poolMat = new THREE.MeshStandardMaterial({ color: 0x4dd5ff, roughness: 0.15, transparent: true, opacity: 0.85 });
      const pool = new THREE.Mesh(poolGeo, poolMat);
      pool.position.set(0, 0.51, 0);
      waterIsle.add(pool);

      const wfParticleGeo = new THREE.BufferGeometry();
      const wfCount = 150;
      const wfPositions = [];
      for (let w = 0; w < wfCount; w++) {
        wfPositions.push(
          -2.2 + (Math.random() - 0.5) * 1.4, 
          0.4 - Math.random() * 7, 
          2.2 + (Math.random() - 0.5) * 1.4
        );
      }
      wfParticleGeo.setAttribute('position', new THREE.Float32BufferAttribute(wfPositions, 3));
      const wfMat = new THREE.PointsMaterial({ color: 0x76ecff, size: 0.22, transparent: true, opacity: 0.95 });
      const waterfallPoints = new THREE.Points(wfParticleGeo, wfMat);
      waterIsle.add(waterfallPoints);
      threeRef.current.waterfalls.push({ points: waterfallPoints, count: wfCount, initialY: 0.4 });

      // 5. Transportation Isle (was Future)
      const futureIsle = createIslandGroup('future', { x: 9, y: 3.5, z: 9 }, { r: 4.0, h: 4.2 }, 0x9b6bcf);
      const domeGeo = new THREE.SphereGeometry(1.4, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshStandardMaterial({ 
        color: 0xadff2f, 
        transparent: true, 
        opacity: 0.4, 
        wireframe: true 
      });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.set(0, 0.6, 0);
      futureIsle.add(dome);

      const spireGeo = new THREE.ConeGeometry(0.25, 2.2, 5);
      const spireMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2 });
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.set(0, 1.8, 0);
      futureIsle.add(spire);

      // Low-poly Fluffy Cloud Bank
      const cloudGroup = new THREE.Group();
      const cloudGeo = new THREE.SphereGeometry(1.8, 5, 5);
      const cloudMat = new THREE.MeshStandardMaterial({ 
        color: 0xfff0f5, 
        roughness: 0.9, 
        flatShading: true,
        transparent: true,
        opacity: 0.8
      });

      for (let c = 0; c < 24; c++) {
        const cloudCluster = new THREE.Group();
        const numSpheres = 3 + Math.floor(Math.random() * 3);
        for (let s = 0; s < numSpheres; s++) {
          const sphere = new THREE.Mesh(cloudGeo, cloudMat);
          sphere.scale.set(1 + Math.random() * 0.7, 0.8 + Math.random() * 0.5, 1 + Math.random() * 0.7);
          sphere.position.set(
            (Math.random() - 0.5) * 2.5,
            (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 2.5
          );
          cloudCluster.add(sphere);
        }
        cloudCluster.position.set(
          (Math.random() - 0.5) * 55,
          -6 - Math.random() * 3,
          (Math.random() - 0.5) * 55
        );
        cloudGroup.add(cloudCluster);
        threeRef.current.clouds.push(cloudCluster);
      }
      scene.add(cloudGroup);

      // Ambient magical dust particles floating around the archipelago
      const dustGeo = new THREE.BufferGeometry();
      const dustCount = 80;
      const dustPositions = [];
      for (let d = 0; d < dustCount; d++) {
        dustPositions.push(
          (Math.random() - 0.5) * 35,
          -2 + Math.random() * 12,
          (Math.random() - 0.5) * 35
        );
      }
      dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
      const dustMat = new THREE.PointsMaterial({ 
        color: 0xffdd88, 
        size: 0.28, 
        transparent: true, 
        opacity: 0.85 
      });
      const dustPoints = new THREE.Points(dustGeo, dustMat);
      scene.add(dustPoints);
      threeRef.current.ambientDust = dustPoints;

      // Flying low-poly birds
      const birdsList = [];
      const birdGeo = new THREE.ConeGeometry(0.12, 0.7, 4);
      birdGeo.rotateX(Math.PI / 2);
      const birdMat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true });
      
      for (let b = 0; b < 7; b++) {
        const bird = new THREE.Mesh(birdGeo, birdMat);
        bird.position.set(
          (Math.random() - 0.5) * 35,
          3 + Math.random() * 7,
          (Math.random() - 0.5) * 35
        );
        scene.add(bird);
        birdsList.push({
          mesh: bird,
          speed: 0.04 + Math.random() * 0.04,
          angle: Math.random() * Math.PI * 2,
          radius: 11 + Math.random() * 14,
          verticalOffset: Math.random() * Math.PI
        });
      }
      threeRef.current.birds = birdsList;

      const clock = new THREE.Clock();

      const animate = () => {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        // Island Floating Sway
        Object.keys(threeRef.current.islands).forEach((key) => {
          const island = threeRef.current.islands[key];
          const phase = island.userData.phase;
          const baseY = island.userData.baseY;
          island.position.y = baseY + Math.sin(elapsed + phase) * 0.12;
        });

        // Turbine Rotation
        threeRef.current.turbines.forEach((t) => {
          t.rotation.x += 0.022;
        });

        // Power Crystal Floating & Spinning
        threeRef.current.crystals.forEach((c) => {
          c.rotation.y += 0.008;
          c.rotation.x += 0.004;
          c.position.y = 1.7 + Math.sin(elapsed * 2.2) * 0.08;
        });

        // Cascading Waterfalls
        threeRef.current.waterfalls.forEach((wf) => {
          const positions = wf.points.geometry.attributes.position.array;
          for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.10;
            if (positions[i] < -7) {
              positions[i] = wf.initialY + (Math.random() - 0.5) * 0.08;
            }
          }
          wf.points.geometry.attributes.position.needsUpdate = true;
        });

        // Floating Dust particles drift upwards gently
        if (threeRef.current.ambientDust) {
          const pos = threeRef.current.ambientDust.geometry.attributes.position.array;
          for (let i = 1; i < pos.length; i += 3) {
            pos[i] += 0.015; // float up
            if (pos[i] > 14) {
              pos[i] = -2; // cycle bottom
            }
          }
          threeRef.current.ambientDust.geometry.attributes.position.needsUpdate = true;
        }

        // Drifting Clouds
        threeRef.current.clouds.forEach((c) => {
          c.position.x += 0.012;
          if (c.position.x > 30) c.position.x = -30;
        });

        // Ghibli Birds Flight paths
        threeRef.current.birds.forEach((bird) => {
          bird.angle += bird.speed * 0.22;
          bird.mesh.position.x = Math.cos(bird.angle) * bird.radius;
          bird.mesh.position.z = Math.sin(bird.angle) * bird.radius;
          bird.mesh.position.y = 4.5 + Math.sin(elapsed + bird.verticalOffset) * 1.8;
          bird.mesh.rotation.y = -bird.angle + Math.PI / 2;
        });

        // Smooth Camera Navigation Track
        const ctr = threeRef.current.controls;
        camera.position.x += (ctr.target.x + ctr.distance * Math.sin(ctr.theta) * Math.cos(ctr.phi) - camera.position.x) * 0.05;
        camera.position.y += (ctr.target.y + ctr.distance * Math.sin(ctr.phi) - camera.position.y) * 0.05;
        camera.position.z += (ctr.target.z + ctr.distance * Math.cos(ctr.theta) * Math.cos(ctr.phi) - camera.position.z) * 0.05;
        
        camera.lookAt(ctr.target.x, ctr.target.y, ctr.target.z);

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!canvasRef.current) return;
        const w = canvasRef.current.clientWidth;
        const h = canvasRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const handleMouseDown = (e) => {
    mouseRef.current.isDown = true;
    mouseRef.current.prevX = e.clientX;
    mouseRef.current.prevY = e.clientY;
  };

  const handleMouseMove = (e) => {
    if (!mouseRef.current.isDown) return;
    const deltaX = e.clientX - mouseRef.current.prevX;
    const deltaY = e.clientY - mouseRef.current.prevY;
    
    const ctr = threeRef.current.controls;
    ctr.theta -= deltaX * 0.005;
    ctr.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, ctr.phi - deltaY * 0.005));
    
    mouseRef.current.prevX = e.clientX;
    mouseRef.current.prevY = e.clientY;
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
  };

  const handleWheel = (e) => {
    const ctr = threeRef.current.controls;
    ctr.distance = Math.max(6, Math.min(50, ctr.distance + e.deltaY * 0.03));
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden text-amber-50 font-serif select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* 3D WebGL Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Floating Active Alerts Overlay */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
        {floatingTexts.map(item => (
          <div 
            key={item.id} 
            className="animate-pulse bg-gradient-to-r from-stone-900/90 to-emerald-950/90 border border-emerald-400/50 text-emerald-100 px-6 py-3 rounded-full text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.45)] font-sans font-semibold tracking-wide"
          >
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* 1. SKY BINDER METRIC HEADER */}
      <SkyHeader 
        carbonFootprint={carbonFootprint}
        totalSavedKg={totalSavedKg}
        musicPlaying={musicPlaying} 
        onToggleMusic={handleToggleMusic} 
        narratorStatus={narratorStatus}
        onTriggerVoice={triggerVoiceNarration}
      />

      {/* 2. ATMOSPHERIC CYCLE SELECTOR */}
      <CelestialDial 
        dayTime={dayTime} 
        setDayTime={setDayTime} 
      />

      {/* 3. CATEGORY ISLAND SELECTOR */}
      <IslandNavigator 
        growthState={growthState} 
        selectedIsland={selectedIsland} 
        focusOnIsland={focusOnIsland} 
      />

      {/* 4. DATA-DRIVEN LOGGING PANEL */}
      <CarbonMonitorPanel 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        growthState={growthState}
        completedActions={completedActions} 
        logCarbonAction={logCarbonAction}
        carbonFootprint={carbonFootprint}
        totalSavedKg={totalSavedKg}
        biggestSource={biggestSource}
        targetReductionPercent={targetReductionPercent}
      />

      {/* 5. USER GUIDE OVERLAY */}
      {showTutorial && (
        <TutorialScroll onClose={() => setShowTutorial(false)} />
      )}

      {/* Sub-footer detail */}
      <footer className="absolute bottom-6 left-6 pointer-events-none text-[10px] text-amber-400/50 uppercase tracking-widest font-sans hidden md:block">
        🌍 Drag to pivot perspective • Action data physically shapes ecosystem growth rates
      </footer>
    </div>
  );
}

function SkyHeader({ carbonFootprint, totalSavedKg, musicPlaying, onToggleMusic, narratorStatus, onTriggerVoice }) {
  return (
    <header className="absolute top-0 left-0 w-full flex justify-between items-center p-6 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-30">
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="relative w-12 h-12 bg-emerald-500/10 border-2 border-emerald-400/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.2)] group hover:border-emerald-300 transition">
          <Globe className="w-6 h-6 text-emerald-300 animate-spin" style={{ animationDuration: '40s' }} />
          <div className="absolute -inset-1 border border-dashed border-emerald-500/20 rounded-full animate-spin" style={{ animationDuration: '15s' }} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-wider text-emerald-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] uppercase">
            TerraTown
          </h1>
          <p className="text-[10px] text-emerald-400/70 tracking-[0.25em] uppercase font-sans font-bold">
            Interactive Emissions World
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 pointer-events-auto">
        {/* Sky Oracle Narrator Control */}
        <button 
          onClick={onTriggerVoice}
          className={`px-4 py-2.5 rounded-xl border flex items-center gap-2.5 transition-all duration-300 text-xs font-sans font-bold shadow-md hover:scale-105 active:scale-95 ${
            narratorStatus === 'playing' 
              ? 'bg-red-500/20 border-red-400 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
              : narratorStatus === 'generating'
              ? 'bg-amber-500/20 border-amber-400 text-amber-200 animate-bounce'
              : 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
          }`}
          title="Trigger Smart Speech Narration"
        >
          {narratorStatus === 'playing' ? (
            <>
              <Square className="w-4 h-4 fill-red-200 text-red-200" />
              <span>Stop Oracle</span>
            </>
          ) : narratorStatus === 'generating' ? (
            <>
              <div className="w-4 h-4 border-2 border-t-transparent border-amber-300 rounded-full animate-spin" />
              <span>Chanting voice...</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-emerald-300" />
              <span>Oracle Narrator</span>
            </>
          )}
        </button>

        {/* Real Carbon Footprint metric container */}
        <div className="relative bg-gradient-to-r from-stone-900/90 to-stone-950/90 border-2 border-emerald-500/40 px-5 py-2.5 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-2xl">
          <div className="absolute -inset-0.5 bg-emerald-400/10 rounded-2xl blur opacity-75" />
          <TrendingDown className="w-5 h-5 text-emerald-400 relative z-10" />
          <div className="text-right relative z-10">
            <div className="text-[9px] text-emerald-400/80 uppercase tracking-widest font-sans font-bold">
              Current Footprint
            </div>
            <div className="text-lg font-black text-emerald-100 tracking-wide font-serif">
              {carbonFootprint} t CO2e/yr
            </div>
          </div>
        </div>

        {/* Procedural Ambient Music Toggle */}
        <button 
          onClick={onToggleMusic}
          className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-center text-amber-200 hover:scale-105 active:scale-95 shadow-md ${
            !musicPlaying 
              ? 'bg-amber-950/40 border-amber-500/20 hover:bg-amber-900/60' 
              : 'bg-emerald-500/20 border-emerald-300 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
          }`}
          title="Toggle Environmental Ambient Music"
        >
          {musicPlaying ? <Music className="w-5 h-5 text-emerald-300 animate-bounce" /> : <VolumeX className="w-5 h-5 text-amber-400/70" />}
        </button>
      </div>
    </header>
  );
}

function CelestialDial({ dayTime, setDayTime }) {
  const modes = [
    { id: 'sunset', label: 'Sunset Glow', dot: 'bg-orange-400' },
    { id: 'night', label: 'Starry Night', dot: 'bg-indigo-400' },
    { id: 'dawn', label: 'Morning Dawn', dot: 'bg-amber-200' }
  ];

  return (
    <div className="absolute right-6 top-28 flex flex-col gap-2.5 bg-stone-950/80 border-2 border-stone-800 p-3 rounded-2xl backdrop-blur-lg shadow-2xl z-30">
      <div className="flex items-center gap-1.5 justify-center border-b border-stone-800 pb-1.5 mb-1">
        <Clock className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[10px] text-center text-stone-400/90 tracking-widest font-sans uppercase font-bold">
          Emissions Clock
        </span>
      </div>
      {modes.map(mode => (
        <button 
          key={mode.id}
          onClick={() => { setDayTime(mode.id); }} 
          className={`px-3 py-2 rounded-xl text-xs font-sans font-bold tracking-wide transition flex items-center justify-between gap-4 ${
            dayTime === mode.id 
              ? 'bg-emerald-500/25 text-emerald-100 border border-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.2)]' 
              : 'hover:bg-stone-900 text-stone-400 border border-transparent'
          }`}
        >
          <span>{mode.label}</span>
          <span className={`w-2.5 h-2.5 rounded-full ${mode.dot} shadow-sm`} />
        </button>
      ))}
    </div>
  );
}

function IslandNavigator({ growthState, selectedIsland, focusOnIsland }) {
  return (
    <div className="absolute left-6 top-28 flex flex-col gap-2.5 z-30 max-w-xs font-sans">
      <div className="text-[10px] text-emerald-400/90 tracking-widest uppercase font-bold mb-1 border-l-2 border-emerald-400 pl-2">
        Archipelago Categories
      </div>

      <button 
        onClick={() => focusOnIsland('all')} 
        className={`group flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 text-sm ${
          selectedIsland === 'all' 
            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.3)] font-bold' 
            : 'bg-stone-950/80 border-stone-800 text-stone-300 hover:bg-stone-900'
        }`}
      >
        <Compass className={`w-4 h-4 text-emerald-400 group-hover:rotate-45 transition`} />
        <span>Entire Biosphere</span>
      </button>

      {Object.keys(growthState).map(key => (
        <button 
          key={key}
          onClick={() => focusOnIsland(key)}
          className={`flex items-center justify-between gap-4 px-4 py-3 rounded-2xl border transition-all duration-300 text-sm ${
            selectedIsland === key 
              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.3)] font-bold' 
              : 'bg-stone-950/80 border-stone-800 text-stone-300 hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg filter drop-shadow">
              {growthState[key].icon}
            </span>
            <span className="text-stone-200 group-hover:text-emerald-100">{growthState[key].name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-mono font-bold ${growthState[key].color}`}>
              {growthState[key].level}% Stabilized
            </span>
            {selectedIsland === key && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

function CarbonMonitorPanel({ 
  activeTab, 
  setActiveTab, 
  growthState, 
  completedActions, 
  logCarbonAction,
  carbonFootprint,
  totalSavedKg,
  biggestSource,
  targetReductionPercent
}) {
  return (
    <div className="absolute bottom-6 left-6 right-6 md:left-auto md:w-[480px] md:right-6 bg-stone-950/95 border-2 border-stone-800 rounded-[28px] backdrop-blur-xl shadow-[0_20px_45px_rgba(0,0,0,0.85)] z-30 overflow-hidden">
      
      {/* Dynamic Status Tabs */}
      <div className="flex border-b border-stone-800 bg-stone-900/50">
        <button 
          onClick={() => { setActiveTab('actions'); }}
          className={`flex-1 py-4 text-center text-xs tracking-[0.15em] font-sans font-bold uppercase transition-all duration-200 ${
            activeTab === 'actions' 
              ? 'border-b-2 border-emerald-400 text-emerald-200 bg-emerald-500/5' 
              : 'text-stone-400/80 hover:text-stone-200'
          }`}
        >
          📝 Log Action
        </button>
        <button 
          onClick={() => { setActiveTab('footprint'); }}
          className={`flex-1 py-4 text-center text-xs tracking-[0.15em] font-sans font-bold uppercase transition-all duration-200 ${
            activeTab === 'footprint' 
              ? 'border-b-2 border-emerald-400 text-emerald-200 bg-emerald-500/5' 
              : 'text-stone-400/80 hover:text-stone-200'
          }`}
        >
          📊 Emissions Audit
        </button>
      </div>

      {/* Panel Contents */}
      <div className="p-6 max-h-[310px] overflow-y-auto">
        {activeTab === 'actions' ? (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-stone-300 leading-relaxed font-sans border-b border-stone-800 pb-2.5">
              Log real-world sustainability choices below. Doing so directly grows, cleans, and expands your floating carbon sinks.
            </p>

            {/* Action 1: Transportation */}
            <button 
              onClick={() => logCarbonAction('future', 35.0)}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-purple-950/25 hover:bg-purple-950/40 border border-purple-500/20 hover:border-purple-400/60 transition duration-300 text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-300 group-hover:scale-110 transition duration-300">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-purple-200 tracking-wide font-sans">Low-Carbon Commute</h4>
                  <p className="text-[11px] text-purple-400/80 font-sans mt-0.5">Used train, bike, or EV instead of combustion vehicle</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-extrabold bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-lg shrink-0">
                  -35.0 kg
                </span>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* Action 2: Energy */}
            <button 
              onClick={() => logCarbonAction('energy', 42.0)}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-amber-950/20 hover:bg-amber-950/35 border border-amber-500/20 hover:border-amber-400/60 transition duration-300 text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-300 group-hover:scale-110 transition duration-300">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-200 tracking-wide font-sans">Power Grid Efficiency</h4>
                  <p className="text-[11px] text-amber-400/80 font-sans mt-0.5">Optimized household heating or powered down active items</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-extrabold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg shrink-0">
                  -42.0 kg
                </span>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* Action 3: Food & Agriculture */}
            <button 
              onClick={() => logCarbonAction('seed', 8.5)}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-lime-950/20 hover:bg-lime-950/35 border border-lime-500/20 hover:border-lime-400/60 transition duration-300 text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-lime-500/10 rounded-xl flex items-center justify-center text-lime-300 group-hover:scale-110 transition duration-300">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-lime-200 tracking-wide font-sans">Plant-Based Alternatives</h4>
                  <p className="text-[11px] text-lime-400/80 font-sans mt-0.5">Skipped high-impact dairy & beef products today</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-extrabold bg-lime-500/20 text-lime-300 px-2.5 py-1 rounded-lg shrink-0">
                  -8.5 kg
                </span>
                <ChevronRight className="w-4 h-4 text-lime-400 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* Action 4: Water */}
            <button 
              onClick={() => logCarbonAction('water', 12.0)}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-cyan-950/25 hover:bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400/60 transition duration-300 text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-300 group-hover:scale-115 transition duration-300">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-cyan-200 tracking-wide font-sans">Aquatic Resource Savings</h4>
                  <p className="text-[11px] text-cyan-400/80 font-sans mt-0.5">Reduced water heating consumption & overall waste volume</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-extrabold bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-lg shrink-0">
                  -12.0 kg
                </span>
                <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition" />
              </div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 font-sans">
            <h3 className="text-base font-serif font-black text-emerald-400 tracking-wide">
              Annual Emissions Footprint Analysis
            </h3>
            
            {/* Direct Carbon Metrics List */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase font-sans tracking-wider font-bold">
                  Baseline Footprint
                </div>
                <div className="text-xl font-bold font-serif text-stone-100 mt-1">
                  16.0 t CO2e
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800">
                <div className="text-[10px] text-stone-400 uppercase font-sans tracking-wider font-bold">
                  Current Footprint
                </div>
                <div className="text-xl font-bold font-serif text-emerald-400 mt-1">
                  {carbonFootprint} t CO2e
                </div>
              </div>
            </div>

            {/* Estimated Reduction Progression */}
            <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-300 font-bold">Estimated Reduction progress:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {(((16.0 - carbonFootprint) / 16.0) * 100).toFixed(1)}% Completed
                </span>
              </div>
              <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
                  style={{ width: `${Math.min(100, Math.max(0, ((16.0 - carbonFootprint) / 16.0) * 100))}%` }}
                />
              </div>
            </div>

            {/* Biggest Emission Source alert box */}
            <div className="flex items-center gap-3.5 p-3.5 bg-red-950/20 border border-red-500/25 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <div className="text-[10px] text-red-400 uppercase tracking-widest font-bold">
                  Major Emission Threat
                </div>
                <div className="text-xs text-stone-200 mt-0.5 leading-relaxed">
                  Your primary carbon driver is estimated to be <strong>{biggestSource}</strong> (3.5 t/yr).
                </div>
              </div>
            </div>

            {/* Total Cumulative Saved offset statistic */}
            <div className="p-3.5 bg-emerald-950/10 border border-emerald-500/15 rounded-2xl flex justify-between items-center text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Cumulative Offset:</span>
              </div>
              <span className="font-mono font-bold text-emerald-300">
                {totalSavedKg} kg CO2e Saved
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TutorialScroll({ onClose }) {
  return (
    <div className="absolute top-28 left-6 right-6 md:right-auto md:w-[320px] bg-stone-950/90 border-2 border-stone-800 rounded-2xl p-5 text-sm z-30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold font-serif text-base tracking-wide">
          <BookOpen className="w-5 h-5" />
          <span>Interactive Footprint</span>
        </div>
        <button 
          onClick={onClose}
          className="text-stone-400 hover:text-stone-200 hover:scale-110 transition"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      <p className="text-[11.5px] text-stone-100/90 leading-relaxed font-sans mt-2">
        Welcome to <strong>TerraTown</strong>. This sky archipelago is a visual carbon ecosystem.
        Each unique floating land mass corresponds directly to critical carbon categories: <strong>Transportation, Energy, Food, Water, and Overall Impact</strong>.
      </p>

      <p className="text-[11.5px] text-stone-300/90 leading-relaxed font-sans mt-2">
        Use the <strong>Emissions Ledger</strong> on the right to record real-world environment-saving actions. As your footprint decreases, watch trees sprout, water systems clarify, and the natural health of the corresponding islands flourish.
      </p>

      <p className="text-[11.5px] text-emerald-300 leading-relaxed font-sans mt-2 font-semibold">
        🎵 Tap the <strong>Audio / Speaker</strong> icons at the top to activate the procedural ambient music or query the Ghibli-inspired <strong>Oracle Speech Narrator</strong>!
      </p>

      <div className="flex gap-2 items-center mt-3 pt-2.5 border-t border-stone-800 text-[10.5px] text-stone-400 font-sans">
        <HelpCircle className="w-4 h-4 text-emerald-400" />
        <span>Drag your mouse to pivot the camera perspective.</span>
      </div>
    </div>
  );
}