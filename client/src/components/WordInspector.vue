<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { X, Volume2, Square, Info } from 'lucide-vue-next';

const store = useSettingsStore();
const speechRate = ref(0.7); // Dyslexic individuals benefit from slower speech rates
const activeSyllableIndex = ref<number | null>(null);

// Heuristic syllable splitting for English words
const splitSyllables = (word: string): string[] => {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length <= 3) return [word];
  
  const isVowel = (c: string) => 'aeiouy'.includes(c.toLowerCase());
  const sy: string[] = [];
  let current = '';
  
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    current += char;
    
    if (i === word.length - 1) {
      sy.push(current);
      break;
    }
    
    const nextChar = word[i + 1];
    const hasVowelInCurrent = [...current].some(isVowel);
    
    if (hasVowelInCurrent) {
      // VC-CV boundary: split after the first consonant (e.g. un-der, helper)
      if (!isVowel(char) && !isVowel(nextChar) && i + 2 < word.length && isVowel(word[i + 2])) {
        sy.push(current);
        current = '';
      }
      // V-CV boundary: split after the vowel (e.g. ba-by, re-port)
      else if (isVowel(char) && !isVowel(nextChar) && i + 2 < word.length && isVowel(word[i + 2])) {
        sy.push(current);
        current = '';
      }
      // V-V boundary: split between distinct vowels (e.g. cli-ent)
      else if (isVowel(char) && isVowel(nextChar) && !['ea', 'ou', 'ai', 'oi', 'oo', 'ee', 'ae', 'ie', 'oa', 'ui', 'io'].includes((char + nextChar).toLowerCase())) {
        sy.push(current);
        current = '';
      }
    }
  }
  
  const result = sy.filter(s => s.trim());
  if (result.length > 1) {
    const last = result[result.length - 1];
    const lastHasVowel = [...last].some(isVowel);
    if (!lastHasVowel) {
      const popped = result.pop();
      if (popped) {
        result[result.length - 1] += popped;
      }
    }
  }
  
  return result.length > 0 ? result : [word];
};

const syllables = computed(() => {
  if (!store.inspectedWord) return [];
  return splitSyllables(store.inspectedWord);
});

// Letter-by-letter spacing representation
const spacedWord = computed(() => {
  if (!store.inspectedWord) return '';
  return store.inspectedWord.split('').join('  ');
});

const isSpeaking = ref(false);

const speakFullWord = () => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  isSpeaking.value = true;
  
  const utterance = new SpeechSynthesisUtterance(store.inspectedWord);
  utterance.rate = speechRate.value;
  utterance.onend = () => { isSpeaking.value = false; };
  utterance.onerror = () => { isSpeaking.value = false; };
  
  window.speechSynthesis.speak(utterance);
};

const speakSyllable = (syllable: string, index: number) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  activeSyllableIndex.value = index;
  
  const utterance = new SpeechSynthesisUtterance(syllable);
  utterance.rate = speechRate.value - 0.1; // Syllables spoken even slightly slower
  utterance.onend = () => { activeSyllableIndex.value = null; };
  utterance.onerror = () => { activeSyllableIndex.value = null; };
  
  window.speechSynthesis.speak(utterance);
};

const stopSpeech = () => {
  window.speechSynthesis.cancel();
  isSpeaking.value = false;
  activeSyllableIndex.value = null;
};

// Reset speaker status when closing
watch(() => store.showInspector, (newVal) => {
  if (!newVal) {
    stopSpeech();
  }
});
</script>

<template>
  <div v-if="store.showInspector" class="inspector-overlay" @click.self="store.closeWordInspector">
    <div class="inspector-modal fade-in">
      <header class="inspector-header">
        <div class="header-title">
          <Info :size="20" class="primary-icon" />
          <span>Word Inspector</span>
        </div>
        <button @click="store.closeWordInspector" class="close-btn" aria-label="Close Inspector">
          <X :size="20" />
        </button>
      </header>

      <div class="inspector-body">
        <!-- Visual Presentation -->
        <section class="word-presentation">
          <div class="spaced-word-box">
            <p class="spaced-text" :class="`font-${store.fontFamily}`">{{ spacedWord }}</p>
            <span class="label">Spaced Letters</span>
          </div>
        </section>

        <!-- Syllable Breakdown -->
        <section class="syllable-breakdown">
          <h4>Syllable Splits</h4>
          <p class="info-desc">Click any syllable below to hear its individual sound.</p>
          <div class="syllables-list">
            <button 
              v-for="(syllable, index) in syllables" 
              :key="index"
              @click="speakSyllable(syllable, index)"
              class="syllable-bubble"
              :class="{ active: activeSyllableIndex === index }"
            >
              {{ syllable }}
            </button>
          </div>
        </section>

        <!-- Settings & TTS Controls -->
        <section class="inspector-controls">
          <div class="tts-section">
            <button 
              v-if="!isSpeaking" 
              @click="speakFullWord" 
              class="inspector-action-btn speak-btn"
            >
              <Volume2 :size="20" />
              Pronounce Word
            </button>
            <button 
              v-else 
              @click="stopSpeech" 
              class="inspector-action-btn stop-btn"
            >
              <Square :size="20" />
              Stop Playing
            </button>
          </div>

          <div class="speed-slider-container">
            <div class="slider-labels">
              <span>Speech Speed</span>
              <span class="speed-val">{{ speechRate }}x</span>
            </div>
            <input 
              type="range" 
              v-model.number="speechRate" 
              min="0.4" 
              max="1.2" 
              step="0.1" 
              class="speed-slider"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inspector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
}

.inspector-modal {
  background: var(--card-bg);
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.inspector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.primary-icon {
  color: var(--primary-color);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-color);
  opacity: 0.6;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  opacity: 1;
}

.inspector-body {
  padding: 1.5rem;
}

.word-presentation {
  margin-bottom: 2rem;
}

.spaced-word-box {
  background: rgba(99, 102, 241, 0.05);
  border: 2px dashed rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
}

.spaced-text {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--primary-color);
  letter-spacing: 0.15em;
  margin-bottom: 0.25rem;
  text-transform: lowercase;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.5;
  font-weight: 600;
}

.syllable-breakdown {
  margin-bottom: 2rem;
}

.syllable-breakdown h4 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
  font-weight: 700;
}

.info-desc {
  font-size: 0.85rem;
  opacity: 0.6;
  margin-bottom: 1rem;
}

.syllables-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.syllable-bubble {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 700;
  padding: 0.6rem 1.25rem;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.syllable-bubble:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  color: var(--primary-color);
  transform: translateY(-2px);
}

.syllable-bubble.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  animation: bounce 0.4s ease;
}

.inspector-controls {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 1.5rem;
}

.tts-section {
  display: flex;
  gap: 1rem;
}

.inspector-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.9rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.speak-btn {
  background: var(--primary-color);
  color: white;
}

.speak-btn:hover {
  filter: brightness(1.1);
}

.stop-btn {
  background: #ef4444;
  color: white;
}

.stop-btn:hover {
  filter: brightness(1.1);
}

.speed-slider-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.7;
}

.speed-val {
  color: var(--primary-color);
}

.speed-slider {
  width: 100%;
  accent-color: var(--primary-color);
  height: 6px;
  border-radius: 3px;
  cursor: pointer;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
</style>
