<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
const route = useRoute();
const isAuthPage = computed(() => route.path === '/login' || route.path === '/register');
import ReadingRuler from './components/ReadingRuler.vue';

import ArticleCard from './components/ArticleCard.vue';
import WordInspector from './components/WordInspector.vue';
import PhonicsGame from './components/PhonicsGame.vue';
import PdfReader from './components/PdfReader.vue';

import WritingAssistant from './components/WritingAssistant.vue';
import { useSettingsStore } from './stores/settings';
import DisabilitySelection from './components/DisabilitySelection.vue';
import { useAuthStore } from './stores/auth';
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
const auth = useAuthStore();
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
    auth.loadFromStorage();
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
    return word;
  }
};
</script>

<template>
  <router-view />
  <ReadingRuler />
  <WordInspector />
</template>

<style scoped>
/* Styles omitted for brevity */
</style>
