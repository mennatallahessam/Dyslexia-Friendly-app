<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useSettingsStore } from '@/stores/settings';
import ArticleCard from './ArticleCard.vue';
import {
  Mic,
  MicOff,
  Trash2,
  Volume2,
  Square,
  BookOpen,
  Edit3
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
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  if (!SpeechRecognition) {
    alert('Speech recognition is not supported in this browser.');
    return;
  }

  const recognition = new SpeechRecognition();
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
  (window as any).recognitionInstance = recognition;
};

const stopListening = () => {
  if ((window as any).recognitionInstance) {
    (window as any).recognitionInstance.stop();
  }
  isListening.value = false;
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
  // Split on words, spaces, and punctuation
  const tokens = text.split(/([a-zA-Z0-9']+|[^a-zA-Z0-9'\s]+|\s+)/);
  let charIndex = 0;
  return tokens.filter(t => t).map(t => {
    const isWord = /^[a-zA-Z0-9']+$/.test(t);
    const startIndex = charIndex;
    const endIndex = charIndex + t.length;
    charIndex = endIndex;
    return { text: t, raw: t, isWord, startIndex, endIndex };
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
  <div class="reader-page container" :class="`font-${store.fontFamily}`">
    <!-- Accessible Notepad & Playground -->
    <section class="card voice-notes-card fade-in">
      <div class="playground-header">
        <div class="header-info">
          <h3>Accessible Notepad & Playground</h3>
          <p class="subtitle">Take notes, listen to them read aloud, or voice type directly.</p>
        </div>
        <div class="playground-mode-tabs">
          <button 
            @click="playgroundMode = 'edit'" 
            class="playground-tab-btn" 
            :class="{ active: playgroundMode === 'edit' }"
          >
            <Edit3 :size="16" />
            Edit Mode
          </button>
          <button 
            @click="playgroundMode = 'read'" 
            class="playground-tab-btn" 
            :class="{ active: playgroundMode === 'read' }"
            :disabled="!voiceNote"
          >
            <BookOpen :size="16" />
            Read Mode
          </button>
        </div>
      </div>

      <!-- Edit Mode View -->
      <div v-if="playgroundMode === 'edit'" class="playground-edit-view">
        <textarea 
          v-model="voiceNote" 
          placeholder="Type your text or start speaking to take notes..."
          rows="6"
          class="notepad-textarea"
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

    <!-- Articles List -->
    <div v-if="loading" class="loading">Loading content...</div>
    <div v-else class="articles-grid">
      <h3 class="section-title">Practice Articles</h3>
      <ArticleCard 
        v-for="article in articles" 
        :key="article.id" 
        :article="article" 
      />
    </div>
  </div>
</template>

<style scoped>
.reader-page {
  padding-bottom: 8rem; /* Space for accessibility toolbar */
}

.playground-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.subtitle {
  font-size: 0.95rem;
  opacity: 0.7;
  margin: 0.25rem 0 0 0;
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

.notepad-textarea {
  width: 100%;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  background: rgba(0,0,0,0.01);
  font-family: inherit;
  font-size: 1.2rem;
  line-height: inherit;
  resize: vertical;
  color: var(--text-color);
  padding: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.theme-dark .notepad-textarea {
  border-color: rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.01);
}

.notepad-textarea:focus {
  border-color: var(--primary-color);
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

.clear-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.playground-read-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.loading {
  text-align: center;
  padding: 4rem;
  font-size: 1.5rem;
  opacity: 0.5;
}

.section-title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.articles-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}
</style>
