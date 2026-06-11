<template>
  <div class="voice-number-input-page">
    <h2 class="title">Voice Number Input</h2>
    <p class="subtitle">Speak a number and it will be captured.</p>
    <button class="record-btn" @click="toggleListening">
      <span v-if="!listening">🎤 Start Listening</span>
      <span v-else>⏹ Stop</span>
    </button>
    <div class="output" v-if="transcript">
      <strong>Captured:</strong> {{ transcript }}
    </div>
    <div class="error" v-if="errorMessage">{{ errorMessage }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

let recognition: any = null;
const listening = ref(false);
const transcript = ref('');
const errorMessage = ref('');

if ('webkitSpeechRecognition' in window) {
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.onresult = (event: any) => {
    const result = event.results[0][0].transcript;
    transcript.value = result.trim();
  };
  recognition.onerror = (event: any) => {
    errorMessage.value = `Error: ${event.error}`;
  };
  recognition.onend = () => {
    listening.value = false;
  };
} else {
  errorMessage.value = 'Speech Recognition not supported in this browser.';
}

function toggleListening() {
  if (!recognition) return;
  if (listening.value) {
    recognition.stop();
  } else {
    transcript.value = '';
    errorMessage.value = '';
    recognition.start();
    listening.value = true;
  }
}
</script>

<style scoped>
.voice-number-input-page {
  max-width: 600px;
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
.subtitle { margin-bottom: 1rem; opacity: 0.85; }
.record-btn {
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.record-btn:hover { background: var(--primary-color-dark); }
.output { margin-top: 1.5rem; font-size: 1.2rem; }
.error { margin-top: 1rem; color: #e53935; }
</style>
