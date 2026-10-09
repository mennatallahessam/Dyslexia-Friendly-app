<template>
  <div class="writing-studio container" :class="`font-${store.fontFamily}`">
    <div class="header-section fade-in">
      <h2>Assistive Dysgraphia Writing Studio</h2>
      <p>Compose essays and notes effortlessly using voice typing, sentence building blocks, and audio read-along.</p>
    </div>

    <div class="studio-grid">
      <!-- Main Text Editor Area -->
      <div class="editor-card">
        <div class="editor-toolbar">
          <div class="left-tools">
            <button 
              @click="toggleListening" 
              class="mic-btn" 
              :class="{ listening: isListening }"
              :title="isListening ? 'Click to Stop Dictation' : 'Click to Start Speech-to-Text'"
            >
              <Mic v-if="!isListening" :size="18" />
              <MicOff v-else :size="18" />
              <span>{{ isListening ? 'Listening...' : 'Voice Dictation' }}</span>
            </button>

            <button 
              @click="toggleSpeech" 
              class="tts-btn"
              :class="{ speaking: store.isSpeaking }"
            >
              <Volume2 v-if="!store.isSpeaking" :size="18" />
              <Square v-else :size="18" />
              <span>{{ store.isSpeaking ? 'Stop Reading' : 'Read Aloud' }}</span>
            </button>
          </div>

          <div class="right-tools">
            <button @click="copyText" class="tool-icon-btn" title="Copy to Clipboard">
              <Copy :size="18" />
            </button>
            <button @click="downloadText" class="tool-icon-btn" title="Download Text File">
              <Download :size="18" />
            </button>
            <button @click="clearText" class="tool-icon-btn delete-btn" title="Clear Text">
              <Trash2 :size="18" />
            </button>
          </div>
        </div>

        <textarea
          v-model="editorText"
          placeholder="Start typing or click 'Voice Dictation' to dictate your thoughts..."
          class="writing-textarea"
          :style="{
            fontSize: `${store.fontSize}px`,
            lineHeight: store.lineHeight,
            letterSpacing: `${store.letterSpacing}px`,
            wordSpacing: `${store.wordSpacing}px`
          }"
        ></textarea>

        <div class="editor-footer">
          <span>Words: {{ wordCount }}</span>
          <span>Characters: {{ editorText.length }}</span>
        </div>
      </div>

      <!-- Helper Panel: Phrase Blocks & Typography Settings -->
      <div class="sidebar-panel">
        <!-- Sentence Builder Chips -->
        <div class="side-card">
          <h3>Sentence Starters & Transitions</h3>
          <p>Click any phrase to insert it directly into your text:</p>
          
          <div class="phrase-section">
            <span class="section-title">Transitions:</span>
            <div class="chip-grid">
              <button 
                v-for="phrase in transitionPhrases" 
                :key="phrase" 
                @click="insertPhrase(phrase)" 
                class="phrase-chip"
              >
                + {{ phrase }}
              </button>
            </div>
          </div>

          <div class="phrase-section">
            <span class="section-title">Arguments & Opinion:</span>
            <div class="chip-grid">
              <button 
                v-for="phrase in opinionPhrases" 
                :key="phrase" 
                @click="insertPhrase(phrase)" 
                class="phrase-chip"
              >
                + {{ phrase }}
              </button>
            </div>
          </div>
        </div>

        <!-- Typography & Spacing Controls -->
        <div class="side-card">
          <h3>Text Formatting Aids</h3>
          
          <div class="control-row">
            <label>Font Size: {{ store.fontSize }}px</label>
            <div class="btn-group">
              <button @click="store.adjustFontSize(-1)">-</button>
              <button @click="store.adjustFontSize(1)">+</button>
            </div>
          </div>

          <div class="control-row">
            <label>Line Height: {{ store.lineHeight }}</label>
            <div class="btn-group">
              <button @click="store.adjustLineHeight(-0.1)">-</button>
              <button @click="store.adjustLineHeight(0.1)">+</button>
            </div>
          </div>

          <div class="control-row">
            <label>Letter Spacing: {{ store.letterSpacing }}px</label>
            <div class="btn-group">
              <button @click="store.adjustSpacing('letter', -1)">-</button>
              <button @click="store.adjustSpacing('letter', 1)">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  Copy,
  Download,
  Trash2
} from 'lucide-vue-next';

const store = useSettingsStore();

const editorText = ref(
  'Dysgraphia makes writing by hand exhausting, but voice dictation and assistive tools help express ideas smoothly.'
);

const isListening = ref(false);
let recognition: any = null;

const transitionPhrases = [
  'However', 'Furthermore', 'In addition', 'Therefore', 'For example', 'Consequently', 'In conclusion'
];

const opinionPhrases = [
  'I believe that', 'In my opinion', 'One key reason is', 'Another important point is', 'Evidence shows that'
];

const wordCount = computed(() => {
  const trimmed = editorText.value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
});

function insertPhrase(phrase: string) {
  if (editorText.value && !editorText.value.endsWith(' ')) {
    editorText.value += ' ';
  }
  editorText.value += phrase + ' ';
}

function toggleListening() {
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  if (!SpeechRecognition) {
    alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
    return;
  }

  if (isListening.value) {
    if (recognition) recognition.stop();
    isListening.value = false;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isListening.value = true;
  };

  recognition.onresult = (event: any) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        transcript += event.results[i][0].transcript;
      }
    }
    if (transcript) {
      if (editorText.value && !editorText.value.endsWith(' ')) {
        editorText.value += ' ';
      }
      editorText.value += transcript;
    }
  };

  recognition.onerror = (err: any) => {
    console.error('Speech recognition error:', err);
    isListening.value = false;
  };

  recognition.onend = () => {
    isListening.value = false;
  };

  recognition.start();
}

function toggleSpeech() {
  if (store.isSpeaking) {
    store.stopSpeaking();
  } else {
    store.speak(editorText.value);
  }
}

function copyText() {
  navigator.clipboard.writeText(editorText.value);
  alert('Text copied to clipboard!');
}

function downloadText() {
  const blob = new Blob([editorText.value], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `writing-notes-${Date.now()}.txt`;
  link.click();
}

function clearText() {
  if (confirm('Are you sure you want to clear your notes?')) {
    editorText.value = '';
  }
}
</script>

<style scoped>
.writing-studio {
  padding-top: 1.5rem;
  padding-bottom: 5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.header-section h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #10b981, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-section p {
  opacity: 0.75;
  font-size: 1.05rem;
}

.studio-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 900px) {
  .studio-grid {
    grid-template-columns: 1.6fr 1fr;
  }
}

.editor-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.theme-dark .editor-card {
  border-color: rgba(255, 255, 255, 0.05);
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;

  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.theme-dark .editor-toolbar {
  border-bottom-color: rgba(255,255,255,0.05);
}

.left-tools, .right-tools {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mic-btn, .tts-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mic-btn {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.mic-btn.listening {
  background: #ef4444;
  color: white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.tts-btn {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.tts-btn.speaking {
  background: #6366f1;
  color: white;
}

.tool-icon-btn {
  padding: 0.5rem;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.05);
  background: rgba(0,0,0,0.03);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.theme-dark .tool-icon-btn {
  background: rgba(255,255,255,0.05);
  border-color: rgba(255,255,255,0.05);
}

.tool-icon-btn:hover {
  background: var(--primary-color);
  color: white;
}

.tool-icon-btn.delete-btn:hover {
  background: #ef4444;
  color: white;
}

.writing-textarea {
  width: 100%;
  min-height: 380px;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,0.1);
  background: var(--bg-color);
  color: var(--text-color);
  resize: vertical;
  outline: none;
  font-family: inherit;
}

.theme-dark .writing-textarea {
  border-color: rgba(255,255,255,0.1);
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  opacity: 0.6;
}

.sidebar-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.side-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}

.theme-dark .side-card {
  border-color: rgba(255,255,255,0.05);
}

.side-card h3 {
  font-size: 1.15rem;
  margin: 0 0 0.35rem 0;
}

.side-card p {
  font-size: 0.85rem;
  opacity: 0.7;
  margin: 0 0 1rem 0;
}

.phrase-section {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.7;
  display: block;
  margin-bottom: 0.4rem;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.phrase-chip {
  background: rgba(16, 185, 129, 0.08);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
  padding: 0.3rem 0.65rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.phrase-chip:hover {
  background: #10b981;
  color: white;
}

.control-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.btn-group {
  display: flex;
  gap: 0.25rem;
}

.btn-group button {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.1);
  background: var(--bg-color);
  color: var(--text-color);
  font-weight: 700;
  cursor: pointer;
}

.theme-dark .btn-group button {
  border-color: rgba(255,255,255,0.1);
}
</style>
