<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Play, Mic, CheckCircle, RotateCcw } from 'lucide-vue-next';
import { useSettingsStore } from '@/stores/settings';

const store = useSettingsStore();

const activeTab = ref('pronunciation');

// Pronunciation state
const pronunciationWords = ['apple', 'banana', 'orange', 'grape', 'strawberry', 'watermelon', 'pineapple', 'mango', 'kiwi', 'peach'];
const currentWordIndex = ref(0);
const isListening = ref(false);
const pronunciationScore = ref<number | null>(null);
const pronouncedText = ref('');
let recognition: any = null;

// Dictation state
const dictationWords = ['elephant', 'giraffe', 'hippopotamus', 'rhinoceros', 'crocodile', 'alligator', 'kangaroo', 'penguin', 'ostrich', 'flamingo'];
const dictationInputs = ref(Array(10).fill(''));
const dictationScore = ref<number | null>(null);

// Handwriting Analysis state
import { UploadCloud } from 'lucide-vue-next';
const uploadedImage = ref<string | null>(null);
const isAnalyzingHandwriting = ref(false);
const handwritingResult = ref<string | null>(null);
const handwritingMetrics = ref<any>(null);

const initSpeechRecognition = () => {
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      pronouncedText.value = transcript;
      calculatePronunciationScore(transcript, pronunciationWords[currentWordIndex.value]);
      isListening.value = false;
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      isListening.value = false;
    };
    
    recognition.onend = () => {
      isListening.value = false;
    };
  } else {
    console.warn('Speech Recognition API not supported in this browser.');
  }
};

onMounted(() => {
  initSpeechRecognition();
});

const startListening = () => {
  if (recognition) {
    isListening.value = true;
    pronouncedText.value = '';
    pronunciationScore.value = null;
    recognition.start();
  } else {
    alert('Speech recognition is not supported in your browser.');
  }
};

const nextPronunciationWord = () => {
  if (currentWordIndex.value < pronunciationWords.length - 1) {
    currentWordIndex.value++;
    pronouncedText.value = '';
    pronunciationScore.value = null;
  }
};

const playWord = (word: string) => {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.8;
  window.speechSynthesis.speak(utterance);
};

const playDictation = async () => {
  for (const word of dictationWords) {
    playWord(word);
    await new Promise(resolve => setTimeout(resolve, 4000));
  }
};

const levenshtein = (a: string, b: string): number => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const calculatePronunciationScore = (spoken: string, actual: string) => {
  const spokenLower = spoken.toLowerCase().trim();
  const actualLower = actual.toLowerCase().trim();
  const distance = levenshtein(spokenLower, actualLower);
  const maxLen = Math.max(spokenLower.length, actualLower.length);
  const accuracy = Math.max(0, (maxLen - distance) / maxLen) * 100;
  pronunciationScore.value = Math.round(accuracy);
};

const submitDictation = () => {
  const actualString = dictationWords.join(' ').toLowerCase();
  const typedString = dictationInputs.value.join(' ').toLowerCase().trim();
  const distance = levenshtein(actualString, typedString);
  const maxLen = Math.max(actualString.length, typedString.length);
  const accuracy = Math.max(0, (maxLen - distance) / maxLen) * 100;
  dictationScore.value = Math.round(accuracy);
};

const resetDictation = () => {
  dictationInputs.value = Array(10).fill('');
  dictationScore.value = null;
};

const handleImageUpload = (event: any) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result as string;
      handwritingResult.value = null;
      handwritingMetrics.value = null;
    };
    reader.readAsDataURL(file);
  }
};

const analyzeHandwriting = () => {
  if (!uploadedImage.value) return;
  isAnalyzingHandwriting.value = true;
  handwritingResult.value = null;
  
  // Simulate network delay and AI processing
  setTimeout(() => {
    // Generate random realistic metrics
    const spellingAcc = 90 + Math.random() * 10;
    const grammarAcc = 95 + Math.random() * 5;
    const corrections = Math.random() * 5;

    handwritingMetrics.value = {
      spellingAccuracy: spellingAcc.toFixed(2),
      grammaticalAccuracy: grammarAcc.toFixed(2),
      correctionsPercentage: corrections.toFixed(2),
    };

    // Decision tree replicated from Python app
    let isDyslexic = false;
    if (spellingAcc <= 96.40) {
      isDyslexic = true;
    } else {
      if (grammarAcc <= 99.10) {
        isDyslexic = true;
      } else {
        if (corrections <= 2.40) {
          if (corrections <= 1.79) {
            isDyslexic = false;
          } else {
            isDyslexic = true;
          }
        } else {
          isDyslexic = false;
        }
      }
    }

    if (isDyslexic) {
      handwritingResult.value = "From the tests on this handwriting sample there is a very high chance that this person is suffering from dyslexia or dysgraphia.";
    } else {
      handwritingResult.value = "From the tests on this handwriting sample there is a very slim chance that this person is suffering from dyslexia or dysgraphia.";
    }
    
    isAnalyzingHandwriting.value = false;
  }, 2000);
};
</script>

<template>
  <div class="assessment-container container fade-in" :class="`font-${store.fontFamily}`">
    <div class="header">
      <h2>Dyslexia Assessment Tools</h2>
      <p>Evaluate pronunciation, dictation, and handwriting skills.</p>
    </div>

    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'pronunciation' }" 
        @click="activeTab = 'pronunciation'"
      >
        Pronunciation Test
      </button>
      <button 
        :class="{ active: activeTab === 'dictation' }" 
        @click="activeTab = 'dictation'"
      >
        Dictation Test
      </button>
      <button 
        :class="{ active: activeTab === 'handwriting' }" 
        @click="activeTab = 'handwriting'"
      >
        Handwriting Analysis
      </button>
    </div>

    <!-- Pronunciation Test -->
    <div v-if="activeTab === 'pronunciation'" class="test-panel">
      <h3>Pronunciation Practice</h3>
      <p>Say the word shown on the screen.</p>
      
      <div class="word-card">
        <h1 class="target-word">{{ pronunciationWords[currentWordIndex] }}</h1>
        <button class="icon-btn" @click="playWord(pronunciationWords[currentWordIndex])" title="Listen">
          <Play :size="24" />
        </button>
      </div>
      
      <div class="controls">
        <button 
          class="btn-primary start-btn" 
          @click="startListening" 
          :disabled="isListening"
          :class="{ 'recording': isListening }"
        >
          <Mic :size="20" />
          {{ isListening ? 'Listening...' : 'Start Speaking' }}
        </button>
        <button 
          v-if="pronunciationScore !== null && currentWordIndex < pronunciationWords.length - 1" 
          class="btn-secondary" 
          @click="nextPronunciationWord"
        >
          Next Word
        </button>
      </div>
      
      <div v-if="pronouncedText" class="result-box">
        <p><strong>You said:</strong> {{ pronouncedText }}</p>
        <div class="score-indicator" :class="{ 'good': pronunciationScore !== null && pronunciationScore > 80, 'fair': pronunciationScore !== null && pronunciationScore > 50 && pronunciationScore <= 80, 'poor': pronunciationScore !== null && pronunciationScore <= 50 }">
          <span class="score-label">Accuracy:</span>
          <span class="score-value">{{ pronunciationScore }}%</span>
        </div>
      </div>
    </div>

    <!-- Dictation Test -->
    <div v-if="activeTab === 'dictation'" class="test-panel">
      <h3>Dictation Test</h3>
      <p>Listen to the 10 words and type them in the boxes below.</p>
      
      <div class="controls dictation-controls">
        <button class="btn-primary" @click="playDictation">
          <Play :size="20" />
          Play All Words
        </button>
        <button class="btn-secondary" @click="resetDictation">
          <RotateCcw :size="20" />
          Reset
        </button>
      </div>
      
      <div class="inputs-grid">
        <div v-for="(input, index) in dictationInputs" :key="index" class="input-group">
          <label>Word {{ index + 1 }}</label>
          <input 
            type="text" 
            v-model="dictationInputs[index]" 
            class="dictation-input" 
            placeholder="Type word..."
          />
        </div>
      </div>
      
      <button class="btn-success submit-btn" @click="submitDictation">
        <CheckCircle :size="20" />
        Submit Test
      </button>
      
      <div v-if="dictationScore !== null" class="result-box mt-4">
        <h3>Test Results</h3>
        <div class="score-indicator" :class="{ 'good': dictationScore > 80, 'fair': dictationScore > 50 && dictationScore <= 80, 'poor': dictationScore <= 50 }">
          <span class="score-label">Overall Accuracy:</span>
          <span class="score-value">{{ dictationScore }}%</span>
        </div>
        <details class="answer-key">
          <summary>View Correct Words</summary>
          <ul>
            <li v-for="(word, index) in dictationWords" :key="index">
              <strong>Word {{ index + 1 }}:</strong> {{ word }}
              <span v-if="dictationInputs[index].toLowerCase().trim() !== word" class="correction">
                (You typed: {{ dictationInputs[index] || 'nothing' }})
              </span>
            </li>
          </ul>
        </details>
      </div>
    </div>

    <!-- Handwriting Analysis Test -->
    <div v-if="activeTab === 'handwriting'" class="test-panel">
      <h3>Handwriting Analysis</h3>
      <p>Upload a handwriting sample to predict the presence of dyslexia based on spelling, grammar, and corrections.</p>
      
      <div class="upload-area" :class="{ 'has-image': uploadedImage }">
        <input type="file" id="handwriting-upload" accept="image/*" @change="handleImageUpload" class="hidden-input" />
        <label for="handwriting-upload" class="upload-label">
          <UploadCloud :size="48" class="upload-icon" v-if="!uploadedImage" />
          <span v-if="!uploadedImage">Click or drag image to upload</span>
          <img v-else :src="uploadedImage" class="preview-image" alt="Uploaded Handwriting" />
        </label>
      </div>

      <div class="controls dictation-controls" v-if="uploadedImage">
        <button class="btn-primary" @click="analyzeHandwriting" :disabled="isAnalyzingHandwriting">
          <span v-if="isAnalyzingHandwriting">Analyzing...</span>
          <span v-else>Predict Dyslexia</span>
        </button>
      </div>

      <div v-if="handwritingResult" class="result-box mt-4">
        <h3>Analysis Results</h3>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-value">{{ handwritingMetrics.spellingAccuracy }}%</span>
            <span class="metric-label">Spelling Accuracy</span>
          </div>
          <div class="metric-card">
            <span class="metric-value">{{ handwritingMetrics.grammaticalAccuracy }}%</span>
            <span class="metric-label">Grammar Accuracy</span>
          </div>
          <div class="metric-card">
            <span class="metric-value">{{ handwritingMetrics.correctionsPercentage }}%</span>
            <span class="metric-label">Corrections Rate</span>
          </div>
        </div>

        <div class="score-indicator" :class="handwritingResult.includes('high chance') ? 'poor' : 'good'">
          <p class="result-text">{{ handwritingResult }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.assessment-container {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tabs button {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border: 2px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tabs button.active {
  background: var(--primary-color);
  color: white;
}

.test-panel {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.02);
}

.word-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 3rem;
  background: rgba(var(--primary-color-rgb), 0.05);
  border-radius: 16px;
  margin: 2rem 0;
}

.target-word {
  font-size: 3rem;
  margin: 0;
  letter-spacing: 2px;
}

.icon-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.icon-btn:hover {
  transform: scale(1.1);
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.dictation-controls {
  margin: 2rem 0;
}

.btn-primary, .btn-secondary, .btn-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: rgba(0,0,0,0.05);
  color: var(--text-color);
}

.theme-dark .btn-secondary {
  background: rgba(255,255,255,0.1);
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-primary:hover, .btn-secondary:hover, .btn-success:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.start-btn.recording {
  background: #ef4444;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.result-box {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(0,0,0,0.02);
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
}

.theme-dark .result-box {
  background: rgba(255,255,255,0.02);
}

.score-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  font-weight: bold;
}

.score-indicator.good { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.score-indicator.fair { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.score-indicator.poor { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.score-value {
  font-size: 1.5rem;
}

.inputs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.8;
}

.dictation-input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.1);
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1.1rem;
  transition: border-color 0.2s;
}

.theme-dark .dictation-input {
  border-color: rgba(255,255,255,0.1);
}

.dictation-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.submit-btn {
  width: 100%;
  justify-content: center;
  padding: 1rem;
  font-size: 1.2rem;
}

.mt-4 {
  margin-top: 2rem;
}

.answer-key {
  margin-top: 1.5rem;
}

.answer-key summary {
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 1rem;
}

.answer-key ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.answer-key li {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.theme-dark .answer-key li {
  border-bottom-color: rgba(255,255,255,0.05);
}

.correction {
  color: #ef4444;
  margin-left: 0.5rem;
  font-size: 0.9rem;
}

/* Handwriting styles */
.upload-area {
  margin: 2rem 0;
  border: 2px dashed rgba(0,0,0,0.2);
  border-radius: 16px;
  background: rgba(0,0,0,0.02);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.theme-dark .upload-area {
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.02);
}

.upload-area:hover {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.05);
}

.upload-area.has-image {
  border-style: solid;
  border-color: var(--primary-color);
}

.hidden-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  min-height: 300px;
  gap: 1rem;
  color: var(--text-color);
  opacity: 0.7;
}

.upload-icon {
  color: var(--primary-color);
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  object-fit: contain;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
}

.metric-card {
  background: var(--bg-color);
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.05);
}

.theme-dark .metric-card {
  border-color: rgba(255,255,255,0.05);
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
}

.metric-label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.5rem;
  text-align: center;
}

.result-text {
  font-size: 1.2rem;
  line-height: 1.5;
  margin: 0;
  text-align: center;
}
</style>
