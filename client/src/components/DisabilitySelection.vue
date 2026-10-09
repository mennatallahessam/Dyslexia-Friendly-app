<template>
  <div class="disability-selection">
    <h2 class="title">Choose Your Profile</h2>
    <div class="cards">
      <button class="card" @click="choose('dyslexia')">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        <span>Dyslexia</span>
      </button>
      <button class="card" @click="choose('dyscalculia')">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 10h8"/><path d="M12 14v4"/><path d="M10 16h4"/></svg>
        <span>Dyscalculia</span>
      </button>
      <button class="card" @click="choose('dysgraphia')">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        <span>Dysgraphia</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';

const router = useRouter();
const store = useSettingsStore();

function choose(dis: 'dyslexia' | 'dyscalculia' | 'dysgraphia') {
  store.setDisability(dis);
  if (dis === 'dyslexia') {
    store.setActiveTab('reader');
    router.push('/reader');
  } else if (dis === 'dyscalculia') {
    router.push('/dyscalculia');
  } else if (dis === 'dysgraphia') {
    store.setActiveTab('writing');
    router.push('/dysgraphia');
  }
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
