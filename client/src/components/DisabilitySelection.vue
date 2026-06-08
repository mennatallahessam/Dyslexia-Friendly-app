<template>
  <div class="disability-selection">
    <h2 class="title">Choose Your Disability</h2>
    <div class="cards">
      <button class="card" @click="choose('dyslexia')">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"/></svg>
        <span>Dyslexia</span>
      </button>
      <button class="card" @click="choose('dyscalculia')">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3v18h14V3H5zm12 16H7V5h10v14z"/></svg>
        <span>Dyscalculia</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
const store = useSettingsStore();
function choose(dis: 'dyslexia' | 'dyscalculia') {
  store.setDisability(dis);
  // after selection, default to the appropriate start tab
  store.setActiveTab('reader');
}
</script>

<style scoped>
.disability-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, var(--primary-color), #ff6b6b);
  color: #fff;
  text-align: center;
}
.title {
  font-size: 2rem;
  margin-bottom: 2rem;
  font-family: 'Inter', sans-serif;
}
.cards {
  display: flex;
  gap: 2rem;
}
.card {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 12px;
  padding: 2rem 3rem;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: transform 0.2s, background 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}
.card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.25);
}
.icon {
  width: 48px;
  height: 48px;
  margin-bottom: 0.5rem;
}
</style>
