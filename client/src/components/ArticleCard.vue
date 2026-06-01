<script setup lang="ts">
import { useSettingsStore } from '../stores/settings';
import { Volume2, Square } from 'lucide-vue-next';

const props = defineProps<{
  article: {
    id: number;
    title: string;
    content: string;
    category: string;
  }
}>();

const store = useSettingsStore();

const toggleSpeech = () => {
  if (store.isSpeaking) {
    store.stopSpeaking();
  } else {
    store.speak(`${props.article.title}. ${props.article.content}`);
  }
};
</script>

<template>
  <div class="card fade-in">
    <div class="card-header">
      <span class="category">{{ article.category }}</span>
      <button @click="toggleSpeech" class="tts-button" :class="{ speaking: store.isSpeaking }">
        <Volume2 v-if="!store.isSpeaking" :size="20" />
        <Square v-else :size="20" />
        {{ store.isSpeaking ? 'Stop Reading' : 'Read Aloud' }}
      </button>
    </div>
    <h2>{{ article.title }}</h2>
    <p class="content">{{ article.content }}</p>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.category {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tts-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.tts-button:hover {
  background: var(--primary-color);
  color: white;
}

.tts-button.speaking {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.content {
  font-size: 1.2rem;
  line-height: 1.8;
  opacity: 0.9;
}
</style>
