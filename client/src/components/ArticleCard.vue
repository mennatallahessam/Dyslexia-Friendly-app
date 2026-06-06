<script setup lang="ts">
import { computed } from 'vue';
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

// Word segment parser to separate words from spaces/punctuation
interface TextToken {
  text: string;
  raw: string;
  isWord: boolean;
}

const parsedWords = computed<TextToken[]>(() => {
  const text = props.article.content;
  if (!text) return [];
  
  // Split on boundaries: words, punctuation, spaces
  const tokens = text.split(/([a-zA-Z0-9']+|[^a-zA-Z0-9'\s]+|\s+)/);
  return tokens.filter(t => t).map(t => {
    // Simple alpha-numeric check to determine if it is inspectable
    const isWord = /^[a-zA-Z0-9']+$/.test(t);
    return {
      text: t,
      raw: t,
      isWord
    };
  });
});

// Format words for Bionic Reading
const bionicFormat = (word: string) => {
  if (word.length <= 3) {
    return `<strong class="bionic-prefix">${word.substring(0, 1)}</strong>${word.substring(1)}`;
  } else if (word.length <= 6) {
    return `<strong class="bionic-prefix">${word.substring(0, 2)}</strong>${word.substring(2)}`;
  } else if (word.length <= 9) {
    return `<strong class="bionic-prefix">${word.substring(0, 3)}</strong>${word.substring(3)}`;
  } else {
    const mid = Math.ceil(word.length * 0.45);
    return `<strong class="bionic-prefix">${word.substring(0, mid)}</strong>${word.substring(mid)}`;
  }
};
</script>

<template>
  <div class="card fade-in" :class="`font-${store.fontFamily}`">
    <div class="card-header">
      <span class="category">{{ article.category }}</span>
      <button @click="toggleSpeech" class="tts-button" :class="{ speaking: store.isSpeaking }">
        <Volume2 v-if="!store.isSpeaking" :size="20" />
        <Square v-else :size="20" />
        {{ store.isSpeaking ? 'Stop Reading' : 'Read Aloud' }}
      </button>
    </div>
    <h2>{{ article.title }}</h2>
    
    <p class="content">
      <template v-for="(token, index) in parsedWords" :key="index">
        <span 
          v-if="token.isWord" 
          class="word-interactive" 
          @click="store.openWordInspector(token.raw)"
        >
          <span v-if="store.bionicReading" v-html="bionicFormat(token.text)"></span>
          <span v-else>{{ token.text }}</span>
        </span>
        <template v-else>
          {{ token.text }}
        </template>
      </template>
    </p>
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
  font-size: inherit; /* inherit from body (adjustable by settings store) */
  line-height: inherit; /* inherit from body */
}
</style>
