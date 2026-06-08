<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import AccessibilityToolbar from './components/AccessibilityToolbar.vue';
import ReadingRuler from './components/ReadingRuler.vue';
import ArticleCard from './components/ArticleCard.vue';
import WordInspector from './components/WordInspector.vue';
import PhonicsGame from './components/PhonicsGame.vue';
import PdfReader from './components/PdfReader.vue';
import { useSettingsStore } from './stores/settings';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  FileText,
  Edit3,
  BookOpenCheck,
  Volume2,
  Square
} from 'lucide-vue-next';

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
const playgroundMode = ref<'edit' | 'read'>('edit');

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
  playgroundMode.value = 'edit';
  store.stopSpeaking();
};

const togglePlaygroundSpeech = () => {
  if (store.isSpeaking && store.speakingText === voiceNote.value) {
    store.stopSpeaking();
  } else {
    store.speak(voiceNote.value);
  }
};

// Parse notes into word tokens with index ranges for highlighting
interface TextToken {
  text: string;
  raw: string;
  isWord: boolean;
  startIndex: number;
  endIndex: number;
}

const parsedNoteWords = computed<TextToken[]>(() => {
  const text = voiceNote.value;
  if (!text) return [];
  
  const tokens = text.split(/([a-zA-Z0-9']+|[^a-zA-Z0-9'\s]+|\s+)/);
  let charIndex = 0;
  return tokens.filter(t => t).map(t => {
    const isWord = /^[a-zA-Z0-9']+$/.test(t);
    const startIndex = charIndex;
    const endIndex = charIndex + t.length;
    charIndex = endIndex;
    return {
      text: t,
      raw: t,
      isWord,
      startIndex,
      endIndex
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
  <div 
    class="app-container" 
    :class="`font-${store.fontFamily}`"
    :style="store.theme === 'custom' ? { '--custom-bg': store.customBgColor, '--custom-text': store.customTextColor } : {}"
  >
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
          <button 
            @click="store.setActiveTab('pdf')" 
            class="nav-tab-btn" 
            :class="{ active: store.activeTab === 'pdf' }"
          >
            <FileText :size="18" />
            <span>PDF Reader</span>
          </button>
        </div>
      </div>
    </header>

    <main class="container">
      <KeepAlive>
        <div v-if="store.activeTab === 'reader'">
          <!-- Accessible Notepad & Playground -->
          <section class="card voice-notes fade-in">
            <div class="card-header playground-header">
              <div class="header-info">
                <span class="category">Playground</span>
                <h3>Accessible Notepad</h3>
              </div>
              
              <!-- Mode Tabs -->
              <div class="playground-mode-tabs">
                <button 
                  @click="playgroundMode = 'edit'; store.stopSpeaking()" 
                  class="playground-tab-btn"
                  :class="{ active: playgroundMode === 'edit' }"
                >
                  <Edit3 :size="16" />
                  <span>Write Mode</span>
                </button>
                <button 
                  @click="playgroundMode = 'read'" 
                  class="playground-tab-btn"
                  :class="{ active: playgroundMode === 'read' }"
                  :disabled="!voiceNote.trim()"
                >
                  <BookOpenCheck :size="16" />
                  <span>Read Mode</span>
                </button>
              </div>
            </div>

            <!-- Edit Mode View -->
            <div v-if="playgroundMode === 'edit'" class="playground-edit-view">
              <textarea 
                v-model="voiceNote" 
                placeholder="Type your text or start speaking to take notes..."
                rows="5"
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
            </div>

            <!-- Read Mode View -->
            <div v-else class="playground-read-view">
              <div class="playground-read-toolbar">
                <button @click="togglePlaygroundSpeech" class="action-btn tts-btn" :class="{ speaking: store.isSpeaking && store.speakingText === voiceNote }">
                  <Volume2 v-if="!(store.isSpeaking && store.speakingText === voiceNote)" :size="18" />
                  <Square v-else :size="18" />
                  {{ store.isSpeaking && store.speakingText === voiceNote ? 'Stop Reading' : 'Read Aloud' }}
                </button>
              </div>
              <div class="playground-content-display content">
                <template v-for="(token, index) in parsedNoteWords" :key="index">
                  <span 
                    v-if="token.isWord" 
                    class="word-interactive" 
                    :class="{ 'speaking-word': store.isSpeaking && store.speakingText === voiceNote && store.speakingCharIndex >= token.startIndex && store.speakingCharIndex < token.endIndex }"
                    @click="store.openWordInspector(token.raw)"
                    :style="{ backgroundColor: store.highlightedWords[token.text.toLowerCase()] }"
                  >
                    <span v-if="store.bionicReading" v-html="bionicFormat(token.text)"></span>
                    <span v-else>{{ token.text }}</span>
                  </span>
                  <template v-else>
                    {{ token.text }}
                  </template>
                </template>
              </div>
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
        
        <div v-else-if="store.activeTab === 'pdf'">
          <PdfReader />
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

/* Accessible Notepad Playground CSS */
.playground-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.playground-mode-tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  padding: 0.25rem;
  border-radius: 12px;
}

.theme-dark .playground-mode-tabs {
  background: rgba(255, 255, 255, 0.05);
}

.playground-tab-btn {
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.7;
  transition: all 0.2s ease;
}

.playground-tab-btn:hover:not(:disabled) {
  opacity: 1;
}

.playground-tab-btn.active {
  background: var(--bg-color);
  color: var(--primary-color);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  opacity: 1;
}

.playground-tab-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.playground-read-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.playground-read-toolbar {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 1rem;
}

.theme-dark .playground-read-toolbar {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.playground-content-display {
  font-size: inherit;
  line-height: inherit;
  white-space: pre-wrap;
}

.tts-btn {
  border: 2px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
}

.tts-btn:hover {
  background: var(--primary-color);
  color: white;
}

.tts-btn.speaking {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}
</style>
