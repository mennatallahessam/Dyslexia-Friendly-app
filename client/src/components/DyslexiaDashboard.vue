<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import {
  BookOpen,
  Volume2,
  Stethoscope
} from 'lucide-vue-next';

const store = useSettingsStore();

const categories = [
  {
    name: 'Reading & Phonics Tools',
    description: 'Tools to assist with reading comprehension and phonetic spelling.',
    tools: [
      {
        name: 'Immersive Reader',
        description: 'Read text with specialized fonts, spacing, and text-to-speech support.',
        route: '/reader',
        icon: BookOpen,
        color: 'sky'
      },
      {
        name: 'Phonics Game',
        description: 'Interactive games to improve phonetic awareness and spelling.',
        route: '/phonics',
        icon: Volume2,
        color: 'purple'
      }
    ]
  },
  {
    name: 'Diagnostics & Assessments',
    description: 'Evaluate reading, pronunciation, and spelling to assess dyslexia indicators.',
    tools: [
      {
        name: 'Dyslexia Assessment',
        description: 'Pronunciation, dictation, and spelling diagnostics.',
        route: '/dyslexia/assessment',
        icon: Stethoscope,
        color: 'emerald'
      }
    ]
  }
];
</script>

<template>
  <div class="dyslexia-dashboard container" :class="`font-${store.fontFamily}`">
    <div class="welcome-banner fade-in">
      <h2>Dyslexia Assistive Toolkit</h2>
      <p>Specialized tools to support reading, phonics, and early diagnostics.</p>
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
.dyslexia-dashboard {
  padding-bottom: 8rem;
}

.welcome-banner {
  text-align: center;
  margin: 2rem 0 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(168, 85, 247, 0.08));
  border-radius: 24px;
  border: 1px solid rgba(56, 189, 248, 0.15);
}

.welcome-banner h2 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #0284c7, #9333ea);
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
  border-color: #38bdf8;
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

/* Color Presets */
.emerald .card-icon-wrapper { background: linear-gradient(135deg, #34d399, #059669); }
.purple .card-icon-wrapper { background: linear-gradient(135deg, #c084fc, #9333ea); }
.sky .card-icon-wrapper { background: linear-gradient(135deg, #38bdf8, #0284c7); }
</style>
