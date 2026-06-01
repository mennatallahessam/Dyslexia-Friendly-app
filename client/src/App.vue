<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import AccessibilityToolbar from './components/AccessibilityToolbar.vue';
import ReadingRuler from './components/ReadingRuler.vue';
import ArticleCard from './components/ArticleCard.vue';
import { Sparkles, Mic, MicOff, Trash2 } from 'lucide-vue-next';

const articles = ref([]);
const loading = ref(true);
const voiceNote = ref('');
const isListening = ref(false);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/articles');
    articles.value = response.data;
  } catch (error) {
    console.error('Error fetching articles:', error);
  } finally {
    loading.value = false;
  }
});

const startListening = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Speech recognition is not supported in this browser.');
    return;
  }

  const recognition = new (window as any).webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isListening.value = true;
  };

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
      voiceNote.value += (voiceNote.value ? ' ' : '') + finalTranscript;
    }
  };

  recognition.onend = () => {
    isListening.value = false;
  };

  recognition.start();
  (window as any).recognition = recognition;
};

const stopListening = () => {
  if ((window as any).recognition) {
    (window as any).recognition.stop();
  }
};

const clearNote = () => {
  voiceNote.value = '';
};
</script>

<template>
  <div class="app-container">
    <header class="hero">
      <div class="container">
        <div class="logo">
          <Sparkles :size="32" class="icon" />
          <h1>Dyslexia<span>Helper</span></h1>
        </div>
        <p class="subtitle">Making the web accessible, one word at a time.</p>
      </div>
    </header>

    <main class="container">
      <!-- Voice Notes Section -->
      <section class="card voice-notes fade-in">
        <div class="card-header">
          <span class="category">Tools</span>
          <h3>Voice Notepad</h3>
        </div>
        <textarea 
          v-model="voiceNote" 
          placeholder="Start speaking to take notes..."
          rows="4"
        ></textarea>
        <div class="note-actions">
          <button 
            @click="isListening ? stopListening() : startListening()" 
            class="action-btn mic-btn"
            :class="{ listening: isListening }"
          >
            <Mic v-if="!isListening" :size="20" />
            <MicOff v-else :size="20" />
            {{ isListening ? 'Stop Listening' : 'Start Voice Typing' }}
          </button>
          <button @click="clearNote" class="action-btn clear-btn" v-if="voiceNote">
            <Trash2 :size="18" />
            Clear
          </button>
        </div>
      </section>

      <div v-if="loading" class="loading">Loading content...</div>
      <div v-else class="articles-grid">
        <ArticleCard 
          v-for="article in articles" 
          :key="article.id" 
          :article="article" 
        />
      </div>
    </main>

    <ReadingRuler />
    <AccessibilityToolbar />
  </div>
</template>

<style>
.hero {
  padding: 4rem 0 2rem;
  text-align: center;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo h1 {
  font-size: 3rem;
  margin-bottom: 0;
  letter-spacing: -0.02em;
}

.logo span {
  color: var(--primary-color);
}

.icon {
  color: var(--primary-color);
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.7;
  max-width: 600px;
  margin: 0 auto;
}

.articles-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 8rem;
}

.voice-notes {
  margin-bottom: 3rem;
  border: 2px solid var(--primary-color);
}

.voice-notes h3 {
  margin: 0;
}

textarea {
  width: 100%;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 1.2rem;
  resize: vertical;
  color: var(--text-color);
  padding: 1rem 0;
  outline: none;
}

.note-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.mic-btn {
  background: var(--primary-color);
  color: white;
}

.mic-btn:hover {
  filter: brightness(1.1);
}

.mic-btn.listening {
  background: #ef4444;
  animation: pulse 1.5s infinite;
}

.clear-btn {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-color);
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.loading {
  text-align: center;
  padding: 4rem;
  font-size: 1.5rem;
  opacity: 0.5;
}

.app-container {
  min-height: 100vh;
}
</style>
