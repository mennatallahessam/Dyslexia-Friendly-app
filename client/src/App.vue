<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import AccessibilityToolbar from './components/AccessibilityToolbar.vue';
import ReadingRuler from './components/ReadingRuler.vue';
import ArticleCard from './components/ArticleCard.vue';
import WordInspector from './components/WordInspector.vue';
import PhonicsGame from './components/PhonicsGame.vue';
import { useSettingsStore } from './stores/settings';
import { Sparkles, Mic, MicOff, Trash2, BookOpen, GraduationCap } from 'lucide-vue-next';

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
}

const store = useSettingsStore();
const articles = ref<Article[]>([]);
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
  <div class="app-container" :class="`font-${store.fontFamily}`">
    <header class="hero">
      <div class="container hero-container">
        <div class="logo">
          <Sparkles :size="32" class="icon" />
          <h1>Dyslexia<span>Helper</span></h1>
        </div>
        <p class="subtitle">Making the web accessible, one word at a time.</p>
        
        <!-- Navigation Tabs -->
        <div class="nav-tabs">
          <button 
            @click="store.setActiveTab('reader')" 
            class="nav-tab-btn" 
            :class="{ active: store.activeTab === 'reader' }"
          >
            <BookOpen :size="18" />
            <span>Reader & Notepad</span>
          </button>
          <button 
            @click="store.setActiveTab('phonics')" 
            class="nav-tab-btn" 
            :class="{ active: store.activeTab === 'phonics' }"
          >
            <GraduationCap :size="18" />
            <span>Phonics Game</span>
          </button>
        </div>
      </div>
    </header>

    <main class="container">
      <KeepAlive>
        <div v-if="store.activeTab === 'reader'">
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
        </div>
        
        <div v-else>
          <PhonicsGame />
        </div>
      </KeepAlive>
    </main>

    <!-- Global Floating Overlays -->
    <ReadingRuler />
    <AccessibilityToolbar />
    <WordInspector />
  </div>
</template>

<style>
.hero {
  padding: 4rem 0 2rem;
  text-align: center;
}

.hero-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
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
  margin: 0 auto 1.5rem auto;
}

/* Nav Tabs styling */
.nav-tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  padding: 0.35rem;
  border-radius: 16px;
  gap: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.theme-dark .nav-tabs {
  background: rgba(255, 255, 255, 0.05);
}

.nav-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-color);
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 12px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.25s ease;
}

.nav-tab-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.02);
}

.theme-dark .nav-tab-btn:hover {
  background: rgba(255, 255, 255, 0.02);
}

.nav-tab-btn.active {
  background: var(--bg-color);
  color: var(--primary-color);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  opacity: 1;
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
