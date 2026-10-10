<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { Calculator, Mic, Layers, BarChart2, Grid, TrendingUp, Activity, ArrowRight } from 'lucide-vue-next';

const store = useSettingsStore();

const stats = [
  { label: 'Tools Available', value: '7' },
  { label: 'Visual Aids', value: '4' },
  { label: 'Input Methods', value: '2' },
];

const tools = [
  {
    name: 'Number Pad',
    description: 'Touch-friendly large numeric keypad for entering numbers easily.',
    route: '/dyscalculia/number-pad',
    icon: Calculator,
    gradient: 'linear-gradient(135deg, #818cf8, #4f46e5)',
    glow: 'rgba(129,140,248,0.3)',
    tag: 'Input',
  },
  {
    name: 'Voice Number Input',
    description: 'Speak numbers aloud and see them instantly captured.',
    route: '/dyscalculia/voice-number-input',
    icon: Mic,
    gradient: 'linear-gradient(135deg, #f472b6, #db2777)',
    glow: 'rgba(244,114,182,0.3)',
    tag: 'Voice',
  },
  {
    name: 'Base-10 Blocks',
    description: 'Visualize numbers using flats, rods, and units. Explode or group blocks.',
    route: '/dyscalculia/base-ten-blocks',
    icon: Grid,
    gradient: 'linear-gradient(135deg, #c084fc, #9333ea)',
    glow: 'rgba(192,132,252,0.3)',
    tag: 'Visual',
  },
  {
    name: 'Place-Value Columns',
    description: 'Slide values to see how they break down into hundreds, tens, and ones.',
    route: '/dyscalculia/place-value-columns',
    icon: BarChart2,
    gradient: 'linear-gradient(135deg, #34d399, #059669)',
    glow: 'rgba(52,211,153,0.3)',
    tag: 'Visual',
  },
  {
    name: 'Digit Assembly',
    description: 'Drag and drop single digits into place-value positions to build numbers.',
    route: '/dyscalculia/digit-assembly',
    icon: Layers,
    gradient: 'linear-gradient(135deg, #38bdf8, #0284c7)',
    glow: 'rgba(56,189,248,0.3)',
    tag: 'Interactive',
  },
  {
    name: 'Jump Number Line',
    description: 'Perform addition and subtraction with animated jumps on a number line.',
    route: '/dyscalculia/number-line',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #fb923c, #ea580c)',
    glow: 'rgba(251,146,60,0.3)',
    tag: 'Practice',
  },
  {
    name: 'Math & Graphing Tools',
    description: 'Format formulas with LaTeX and plot functions dynamically with live preview.',
    route: '/math-tools',
    icon: Activity,
    gradient: 'linear-gradient(135deg, #fb7185, #e11d48)',
    glow: 'rgba(251,113,133,0.3)',
    tag: 'Graphing',
  },
];
</script>

<template>
  <div class="dashboard container" :class="`font-${store.fontFamily}`">
    <!-- Hero Banner -->
    <div class="hero hero-pink">
      <div class="hero-inner">
        <div class="hero-label">Dyscalculia Profile</div>
        <h2>Your Math Toolkit</h2>
        <p>Visual tools to make numbers, arithmetic, and place value intuitive and accessible.</p>
        <div class="stat-row">
          <div v-for="stat in stats" :key="stat.label" class="stat-chip">
            <span class="stat-val">{{ stat.value }}</span>
            <span class="stat-lbl">{{ stat.label }}</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="orbit orbit-1"></div>
        <div class="orbit orbit-2"></div>
        <div class="hero-icon-center">
          <Calculator :size="42" />
        </div>
      </div>
    </div>

    <div class="section-header">
      <h3>All Tools</h3>
      <span class="section-line"></span>
    </div>

    <div class="tools-grid">
      <router-link
        v-for="tool in tools"
        :key="tool.name"
        :to="tool.route"
        class="tool-card"
        :style="{ '--glow': tool.glow }"
      >
        <div class="card-top">
          <div class="tool-icon-wrap" :style="{ background: tool.gradient }">
            <component :is="tool.icon" :size="28" />
          </div>
          <span class="tool-tag">{{ tool.tag }}</span>
        </div>
        <h4>{{ tool.name }}</h4>
        <p>{{ tool.description }}</p>
        <div class="card-cta">
          Open tool <ArrowRight :size="16" />
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.dashboard { padding: 0 0 8rem; }

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  background: linear-gradient(135deg, #2d1b4e 0%, #5b21b6 50%, #1e1b4b 100%);
  border-radius: 28px;
  padding: 3rem;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-inner { position: relative; z-index: 2; flex: 1; color: white; }

.hero-label {
  display: inline-block;
  background: rgba(167,139,250,0.3);
  border: 1px solid rgba(196,181,253,0.3);
  color: #ddd6fe;
  font-size: 0.75rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 0.3rem 0.9rem; border-radius: 50px; margin-bottom: 1rem;
}

.hero-inner h2 { font-size: 2.4rem; font-weight: 800; margin: 0 0 0.75rem; line-height: 1.2; }
.hero-inner p { color: rgba(255,255,255,0.65); font-size: 1rem; line-height: 1.6; max-width: 420px; margin: 0 0 2rem; }

.stat-row { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.stat-chip {
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; padding: 0.6rem 1.2rem;
  display: flex; flex-direction: column; align-items: center;
}
.stat-val { font-size: 1.4rem; font-weight: 800; color: white; }
.stat-lbl { font-size: 0.72rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.05em; }

.hero-visual { position: relative; width: 180px; height: 180px; flex-shrink: 0; }
.hero-icon-center {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 72px; height: 72px;
  background: rgba(255,255,255,0.15); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.25); border-radius: 20px;
  display: flex; align-items: center; justify-content: center; color: white; z-index: 2;
}
.orbit {
  position: absolute; top: 50%; left: 50%;
  border: 1px solid rgba(255,255,255,0.15); border-radius: 50%;
  animation: spin 10s linear infinite;
}
.orbit-1 { width: 130px; height: 130px; margin: -65px 0 0 -65px; }
.orbit-2 { width: 180px; height: 180px; margin: -90px 0 0 -90px; animation-duration: 16s; animation-direction: reverse; border-style: dashed; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.section-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.section-header h3 { font-size: 1.1rem; font-weight: 700; white-space: nowrap; color: var(--text-color); opacity: 0.6; text-transform: uppercase; letter-spacing: 0.08em; }
.section-line { flex: 1; height: 1px; background: linear-gradient(to right, rgba(0,0,0,0.1), transparent); }
.theme-dark .section-line { background: linear-gradient(to right, rgba(255,255,255,0.08), transparent); }

.tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }

.tool-card {
  background: var(--card-bg); border: 1px solid rgba(0,0,0,0.05);
  border-radius: 20px; padding: 1.75rem; text-decoration: none;
  color: var(--text-color); display: flex; flex-direction: column; gap: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative; overflow: hidden;
}
.theme-dark .tool-card { border-color: rgba(255,255,255,0.05); }
.tool-card::before {
  content: ''; position: absolute; top: -60%; left: -60%; width: 200%; height: 200%;
  background: radial-gradient(circle at 30% 30%, var(--glow, rgba(129,140,248,0.12)), transparent 60%);
  opacity: 0; transition: opacity 0.4s ease;
}
.tool-card:hover::before { opacity: 1; }
.tool-card:hover { transform: translateY(-6px); border-color: rgba(167,139,250,0.3); box-shadow: 0 20px 50px rgba(0,0,0,0.08), 0 0 0 1px rgba(167,139,250,0.15); }

.card-top { display: flex; align-items: flex-start; justify-content: space-between; }
.tool-icon-wrap {
  width: 54px; height: 54px; border-radius: 16px; display: flex;
  align-items: center; justify-content: center; color: white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: transform 0.3s ease;
}
.tool-card:hover .tool-icon-wrap { transform: scale(1.1) rotate(-5deg); }

.tool-tag {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: #a78bfa; background: rgba(167,139,250,0.1); padding: 0.3rem 0.75rem; border-radius: 50px;
}
.tool-card h4 { font-size: 1.2rem; font-weight: 700; margin: 0; }
.tool-card p { font-size: 0.88rem; opacity: 0.6; line-height: 1.5; margin: 0; flex: 1; }
.card-cta { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; font-weight: 700; color: #a78bfa; margin-top: 0.5rem; transition: gap 0.2s; }
.tool-card:hover .card-cta { gap: 0.7rem; }
</style>
