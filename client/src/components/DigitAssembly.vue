<template>
  <div class="digit-assembly-page">
    <h2 class="title">Digit Assembly (Place‑Value Builder)</h2>
    <p class="subtitle">Drag or click digits into the correct columns.</p>
    <div class="columns">
      <div class="column hundreds">
        <span class="label">Hundreds</span>
        <div class="slot" @click="assign('hundreds', $event)">{{ slots.hundreds ?? '_' }}</div>
      </div>
      <div class="column tens">
        <span class="label">Tens</span>
        <div class="slot" @click="assign('tens', $event)">{{ slots.tens ?? '_' }}</div>
      </div>
      <div class="column ones">
        <span class="label">Ones</span>
        <div class="slot" @click="assign('ones', $event)">{{ slots.ones ?? '_' }}</div>
      </div>
    </div>
    <div class="digit-palette">
      <button
        v-for="d in digits"
        :key="d"
        class="digit-btn"
        @click="pick(d)"
      >{{ d }}</button>
    </div>
    <div class="result" v-if="assembledNumber !== null">
      <strong>Number you built:</strong> {{ assembledNumber }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const digits = Array.from({ length: 10 }, (_, i) => i);
const selected = ref<number | null>(null);

const slots = ref<{ hundreds?: number; tens?: number; ones?: number }>({});

function pick(d: number) {
  selected.value = d;
}

function assign(place: 'hundreds' | 'tens' | 'ones', _event: MouseEvent) {
  if (selected.value !== null) {
    slots.value[place] = selected.value;
    selected.value = null;
  }
}

const assembledNumber = computed(() => {
  const { hundreds, tens, ones } = slots.value;
  if (hundreds !== undefined && tens !== undefined && ones !== undefined) {
    return hundreds * 100 + tens * 10 + ones;
  }
  return null;
});
</script>

<style scoped>
.digit-assembly-page {
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
.subtitle { margin-bottom: 1.5rem; opacity: 0.85; }
.columns { display: flex; justify-content: center; gap: 1rem; margin-bottom: 1.5rem; }
.column { flex: 1; min-width: 80px; }
.label { display: block; font-weight: 600; margin-bottom: 0.3rem; }
.slot {
  height: 60px;
  line-height: 60px;
  border: 2px dashed var(--primary-color);
  border-radius: 12px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.slot:hover { background: rgba(0,0,0,0.05); transform: scale(1.02); }
.digit-palette { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
.digit-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
}
.digit-btn:hover { background: var(--primary-color-dark); }
.result { margin-top: 1.5rem; font-size: 1.2rem; }
</style>
