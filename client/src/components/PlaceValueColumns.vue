<template>
  <div class="place-value-columns-page">
    <h2 class="title">Place‑Value Columns</h2>
    <p class="subtitle">Move the slider to see the value breakdown into hundreds, tens and ones.</p>
    <div class="slider-container">
      <input type="range" min="0" max="999" v-model.number="value" class="range-slider" />
    </div>
    <div class="columns">
      <div class="column">
        <span class="label">Hundreds</span>
        <span class="value">{{ hundreds }}</span>
      </div>
      <div class="column">
        <span class="label">Tens</span>
        <span class="value">{{ tens }}</span>
      </div>
      <div class="column">
        <span class="label">Ones</span>
        <span class="value">{{ ones }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const value = ref(0);

const hundreds = computed(() => Math.floor(value.value / 100));
const tens = computed(() => Math.floor((value.value % 100) / 10));
const ones = computed(() => value.value % 10);
</script>

<style scoped>
.place-value-columns-page {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--card-bg, rgba(255,255,255,0.12));
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: var(--shadow-elevation-medium);
  text-align: center;
  color: var(--text);
}
.title {
  font-family: 'Inter', sans-serif;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  color: transparent;
  animation: gradientSlide 4s infinite linear;
}
@keyframes gradientSlide {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
.subtitle { margin-bottom: 1rem; opacity: 0.85; }
.slider-container { margin: 1.5rem 0; }
.range-slider {
  width: 100%;
  accent-color: var(--primary-color);
}
.columns { display: flex; justify-content: center; gap: 2rem; margin-top: 1rem; }
.column { text-align: center; }
.label { display: block; font-weight: 600; margin-bottom: 0.3rem; }
.value { font-size: 1.5rem; font-weight: 700; }
</style>
