<script setup lang="ts">

import { useSettingsStore } from '@/stores/settings';
import {
  Calculator,
  Mic,
  Layers,
  BarChart2,
  Grid,
  TrendingUp,
  Activity
} from 'lucide-vue-next';

const store = useSettingsStore();

const categories = [
  {
    name: 'Number Basics & Input',
    description: 'Practice reading and entering numbers with alternative interfaces.',
    tools: [
      {
        name: 'Number Pad',
        description: 'Touch-friendly large numeric keypad for entering numbers easily.',
        route: '/dyscalculia/number-pad',
        icon: Calculator,
        color: 'indigo'
      },
      {
        name: 'Voice Number Input',
        description: 'Speak numbers aloud and see them instantly captured.',
        route: '/dyscalculia/voice-number-input',
        icon: Mic,
        color: 'pink'
      }
    ]
  },
  {
    name: 'Place Value & Visuals',
    description: 'Develop a strong visual understanding of tens, hundreds, and place values.',
    tools: [
      {
        name: 'Base-10 Blocks',
        description: 'Visualize numbers using flats, rods, and units. Explode or group blocks.',
        route: '/dyscalculia/base-ten-blocks',
        icon: Grid,
        color: 'purple'
      },
      {
        name: 'Place-Value Columns',
        description: 'Slide values to see how they breakdown into hundreds, tens, and ones.',
        route: '/dyscalculia/place-value-columns',
        icon: BarChart2,
        color: 'emerald'
      },
      {
        name: 'Digit Assembly',
        description: 'Drag and drop single digits into place-value positions to build numbers.',
        route: '/dyscalculia/digit-assembly',
        icon: Layers,
        color: 'sky'
      }
    ]
  },
  {
    name: 'Calculations & Graphing',
    description: 'Learn arithmetic and functions with visual animations.',
    tools: [
      {
        name: 'Jump Number Line',
        description: 'Perform addition and subtraction with animated jumps on a number line.',
        route: '/dyscalculia/number-line',
        icon: TrendingUp,
        color: 'orange'
      },
      {
        name: 'Math & Graphing Tools',
        description: 'Format formulas with LaTeX and plot functions dynamically with live preview.',
        route: '/math-tools',
        icon: Activity,
        color: 'rose'
      }
    ]
  }
];
</script>

<template>
  <div class="dyscalculia-dashboard container" :class="`font-${store.fontFamily}`">
    <div class="welcome-banner fade-in">
      <h2>Dyscalculia Toolkit</h2>
      <p>Select a specialized visual tool below to build your math and number skills.</p>
    </div>

    <div v-for="category in categories" :key="category.name" class="category-section">
      <div class="category-header">
        <h3>{{ category.name }}</h3>
        <p class="category-desc">{{ category.description }}</p>
      </div>

      <div class="tools-grid">
        <router-link 
          v-for="tool in category.tools" 
          :key="tool.name" 
          :to="tool.route" 
          class="tool-card"
          :class="tool.color"
        >
          <div class="card-icon-wrapper">
            <component :is="tool.icon" :size="32" class="tool-icon" />
          </div>
          <div class="card-details">
            <h4>{{ tool.name }}</h4>
            <p>{{ tool.description }}</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dyscalculia-dashboard {
  padding-bottom: 8rem;
}

.welcome-banner {
  text-align: center;
  margin: 2rem 0 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(236, 72, 153, 0.08));
  border-radius: 24px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.welcome-banner h2 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-banner p {
  opacity: 0.8;
  font-size: 1.1rem;
}

.category-section {
  margin-bottom: 3rem;
}

.category-header {
  margin-bottom: 1.5rem;
}

.category-header h3 {
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
  color: var(--text-color);
}

.category-desc {
  font-size: 0.95rem;
  opacity: 0.6;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.tool-card {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 20px;
  text-decoration: none;
  color: var(--text-color);
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  align-items: center;
}

.theme-dark .tool-card {
  border-color: rgba(255,255,255,0.04);
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  border-color: var(--primary-color);
}

.card-icon-wrapper {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.tool-card:hover .card-icon-wrapper {
  transform: scale(1.1);
}

.tool-icon {
  color: white;
}

.card-details h4 {
  font-size: 1.15rem;
  margin: 0 0 0.35rem 0;
  font-weight: 700;
}

.card-details p {
  font-size: 0.85rem;
  opacity: 0.7;
  margin: 0;
  line-height: 1.35;
}

/* Color Presets for Cards */
.indigo .card-icon-wrapper { background: linear-gradient(135deg, #818cf8, #4f46e5); }
.pink .card-icon-wrapper { background: linear-gradient(135deg, #f472b6, #db2777); }
.purple .card-icon-wrapper { background: linear-gradient(135deg, #c084fc, #9333ea); }
.emerald .card-icon-wrapper { background: linear-gradient(135deg, #34d399, #059669); }
.sky .card-icon-wrapper { background: linear-gradient(135deg, #38bdf8, #0284c7); }
.orange .card-icon-wrapper { background: linear-gradient(135deg, #fb923c, #ea580c); }
.rose .card-icon-wrapper { background: linear-gradient(135deg, #fb7185, #e11d48); }
</style>
