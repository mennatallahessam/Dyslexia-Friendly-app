<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { HelpCircle, Volume2, Trophy, RotateCcw, CheckCircle2, AlertTriangle, ArrowLeftRight } from 'lucide-vue-next';

const store = useSettingsStore();

// Game State
const currentMode = ref<'word-complete' | 'letter-flip'>('word-complete');
const score = ref(0);
const questionsAnswered = ref(0);
const totalQuestions = 5;
const gameFinished = ref(false);
const feedback = ref<{ status: 'correct' | 'incorrect' | null; message: string }>({ status: null, message: '' });

// 1. Word Completion Game Mode Data
interface WordQuestion {
  word: string;
  missingIndex: number[];
  options: string[];
  correctLetter: string;
  definition: string;
}

const wordQuestions: WordQuestion[] = [
  { word: 'dog', missingIndex: [0], options: ['d', 'b'], correctLetter: 'd', definition: 'A friendly pet that barks.' },
  { word: 'baby', missingIndex: [0, 2], options: ['b', 'd'], correctLetter: 'b', definition: 'A very young child.' },
  { word: 'queen', missingIndex: [0], options: ['q', 'p'], correctLetter: 'q', definition: 'A female royal ruler.' },
  { word: 'play', missingIndex: [0], options: ['p', 'q'], correctLetter: 'p', definition: 'To have fun or take part in a game.' },
  { word: 'duck', missingIndex: [0], options: ['d', 'b'], correctLetter: 'd', definition: 'A water bird with webbed feet.' },
  { word: 'pond', missingIndex: [3], options: ['d', 'b'], correctLetter: 'd', definition: 'A small body of still water.' },
  { word: 'bad', missingIndex: [0, 2], options: ['b', 'd'], correctLetter: 'b', definition: 'Opposite of good.' }, // note: first letter is b, last is d
  { word: 'quiz', missingIndex: [0], options: ['q', 'p'], correctLetter: 'q', definition: 'A short test of knowledge.' }
];

const currentWordIndex = ref(0);
const wordQuestion = computed(() => wordQuestions[currentWordIndex.value]);

const playWordSound = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.7; // slow speed for learning
    window.speechSynthesis.speak(utterance);
  }
};

const selectLetterOption = (letter: string) => {
  if (feedback.value.status !== null) return; // wait for next

  const correct = letter === wordQuestion.value.correctLetter;
  questionsAnswered.value++;

  if (correct) {
    score.value++;
    feedback.value = {
      status: 'correct',
      message: `Great job! "${wordQuestion.value.word}" is correct!`
    };
    playWordSound(wordQuestion.value.word);
  } else {
    feedback.value = {
      status: 'incorrect',
      message: `Not quite. The correct word is "${wordQuestion.value.word}".`
    };
    playWordSound(wordQuestion.value.word);
  }

  setTimeout(() => {
    nextQuestion();
  }, 2500);
};

// 2. Letter Flipping Game Mode Data
interface FlipQuestion {
  targetLetter: string; // the correct letter we want
  initialFlipped: boolean; // starts flipped horizontally?
  promptText: string;
}

const flipQuestions: FlipQuestion[] = [
  { targetLetter: 'd', initialFlipped: true, promptText: "Flip the letter to make it a 'd' for dog!" }, // Looks like 'b' initially
  { targetLetter: 'b', initialFlipped: true, promptText: "Flip the letter to make it a 'b' for baby!" }, // Looks like 'd' initially
  { targetLetter: 'q', initialFlipped: true, promptText: "Flip the letter to make it a 'q' for queen!" }, // Looks like 'p' initially
  { targetLetter: 'p', initialFlipped: true, promptText: "Flip the letter to make it a 'p' for play!" }  // Looks like 'q' initially
];

const currentFlipIndex = ref(0);
const flipQuestion = computed(() => flipQuestions[currentFlipIndex.value]);
const letterIsFlipped = ref(true); // Horizontal flip state

const letterAppearance = computed(() => {
  const target = flipQuestion.value.targetLetter;
  // If target is 'd' and flipped horizontally, it looks like 'b'
  // If target is 'b' and flipped, it looks like 'd'
  // If target is 'q' and flipped, it looks like 'p'
  // If target is 'p' and flipped, it looks like 'q'
  
  if (letterIsFlipped.value) {
    if (target === 'd') return 'b';
    if (target === 'b') return 'd';
    if (target === 'q') return 'p';
    if (target === 'p') return 'q';
  }
  return target;
});

const flipHorizontal = () => {
  if (feedback.value.status !== null) return;
  letterIsFlipped.value = !letterIsFlipped.value;
  playWordSound(letterAppearance.value);
};

const checkFlipAnswer = () => {
  if (feedback.value.status !== null) return;
  questionsAnswered.value++;

  if (!letterIsFlipped.value) {
    score.value++;
    feedback.value = {
      status: 'correct',
      message: `Excellent! You successfully flipped it to a '${flipQuestion.value.targetLetter}'!`
    };
    playWordSound(flipQuestion.value.targetLetter);
  } else {
    feedback.value = {
      status: 'incorrect',
      message: `Oops, that letter is still flipped. It looks like a '${letterAppearance.value}'.`
    };
    playWordSound(letterAppearance.value);
  }

  setTimeout(() => {
    nextQuestion();
  }, 2500);
};

// Next Question / Finish Game
const nextQuestion = () => {
  feedback.value = { status: null, message: '' };
  
  if (questionsAnswered.value >= totalQuestions) {
    gameFinished.value = true;
    return;
  }

  if (currentMode.value === 'word-complete') {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * wordQuestions.length);
    } while (nextIndex === currentWordIndex.value);
    currentWordIndex.value = nextIndex;
  } else {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * flipQuestions.length);
    } while (nextIndex === currentFlipIndex.value);
    currentFlipIndex.value = nextIndex;
    letterIsFlipped.value = true; // reset to flipped
  }
};

const resetGame = () => {
  score.value = 0;
  questionsAnswered.value = 0;
  gameFinished.value = false;
  feedback.value = { status: null, message: '' };
  currentWordIndex.value = Math.floor(Math.random() * wordQuestions.length);
  currentFlipIndex.value = Math.floor(Math.random() * flipQuestions.length);
  letterIsFlipped.value = true;
};

const switchMode = (mode: 'word-complete' | 'letter-flip') => {
  currentMode.value = mode;
  resetGame();
};
</script>

<template>
  <div class="phonics-game card fade-in" :class="`font-${store.fontFamily}`">
    <div class="game-header">
      <div class="header-main">
        <h3>Letter Reversal Training</h3>
        <p class="subtitle">Practice distinguishing b, d, p, and q with fun interactive exercises.</p>
      </div>
      
      <!-- Mode Switcher -->
      <div class="mode-tabs">
        <button 
          @click="switchMode('word-complete')" 
          class="tab-btn" 
          :class="{ active: currentMode === 'word-complete' }"
        >
          Word Builder
        </button>
        <button 
          @click="switchMode('letter-flip')" 
          class="tab-btn" 
          :class="{ active: currentMode === 'letter-flip' }"
        >
          Letter Flipper
        </button>
      </div>
    </div>

    <!-- Game Active View -->
    <div v-if="!gameFinished" class="game-content">
      <!-- Top info bar -->
      <div class="game-info-bar">
        <span class="progress-txt">Question {{ questionsAnswered + 1 }} of {{ totalQuestions }}</span>
        <span class="score-txt">Score: {{ score }}</span>
      </div>

      <!-- Mode 1: Word Completion -->
      <div v-if="currentMode === 'word-complete'" class="mode-container word-complete-mode">
        <div class="hint-card">
          <HelpCircle :size="20" class="hint-icon" />
          <p>{{ wordQuestion.definition }}</p>
          <button @click="playWordSound(wordQuestion.word)" class="sound-btn" title="Listen to Hint">
            <Volume2 :size="18" />
            Listen
          </button>
        </div>

        <div class="word-display">
          <div 
            v-for="(char, i) in wordQuestion.word" 
            :key="i"
            class="letter-box"
            :class="{ 
              missing: wordQuestion.missingIndex.includes(i),
              solved: wordQuestion.missingIndex.includes(i) && feedback.status !== null 
            }"
          >
            <span v-if="wordQuestion.missingIndex.includes(i)">
              {{ feedback.status !== null ? wordQuestion.word[i] : '?' }}
            </span>
            <span v-else>{{ char }}</span>
          </div>
        </div>

        <p class="instruction">Choose the correct letter to complete the word:</p>

        <div class="options-container">
          <button 
            v-for="option in wordQuestion.options" 
            :key="option"
            @click="selectLetterOption(option)"
            class="option-letter-btn"
            :disabled="feedback.status !== null"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <!-- Mode 2: Letter Flipper -->
      <div v-else class="mode-container letter-flip-mode">
        <p class="instruction-desc">{{ flipQuestion.promptText }}</p>

        <div class="flipping-canvas">
          <div class="guide-box">
            <!-- Ghost target letter -->
            <span class="ghost-letter">{{ flipQuestion.targetLetter }}</span>
            <span class="guide-label">Goal Letter</span>
          </div>

          <div class="interactive-letter-box" :class="{ flipped: letterIsFlipped }">
            <span class="manipulated-letter">{{ flipQuestion.targetLetter }}</span>
          </div>
        </div>

        <div class="flipping-controls">
          <button @click="flipHorizontal" class="control-action-btn flip-btn" :disabled="feedback.status !== null">
            <ArrowLeftRight :size="20" />
            Flip Letter
          </button>
          <button @click="checkFlipAnswer" class="control-action-btn submit-btn" :disabled="feedback.status !== null">
            Submit Orientation
          </button>
        </div>
      </div>

      <!-- Feedback Banner -->
      <div 
        v-if="feedback.status" 
        class="feedback-banner" 
        :class="feedback.status"
      >
        <CheckCircle2 v-if="feedback.status === 'correct'" :size="24" />
        <AlertTriangle v-else :size="24" />
        <span>{{ feedback.message }}</span>
      </div>
    </div>

    <!-- Game Finished View -->
    <div v-else class="game-finished-view">
      <div class="trophy-box">
        <Trophy :size="72" class="trophy-icon" />
      </div>
      <h2>Exercise Complete!</h2>
      <p class="score-summary">You scored <strong>{{ score }}</strong> out of <strong>{{ totalQuestions }}</strong> questions correct.</p>
      
      <div class="finished-actions">
        <button @click="resetGame" class="restart-btn">
          <RotateCcw :size="20" />
          Play Again
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.phonics-game {
  margin-top: 1rem;
  padding: 2.5rem;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-main h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
}

.subtitle {
  margin: 0;
  opacity: 0.7;
  font-size: 0.95rem;
}

.mode-tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  padding: 0.25rem;
  border-radius: 12px;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.7;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  opacity: 1;
}

.tab-btn.active {
  background: var(--bg-color);
  color: var(--primary-color);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  opacity: 1;
}

.game-info-bar {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 700;
  opacity: 0.6;
  margin-bottom: 2rem;
}

.mode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* Word Completion styles */
.hint-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.1);
  padding: 1rem 1.5rem;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
}

.hint-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.hint-card p {
  margin: 0;
  flex-grow: 1;
  font-size: 1.05rem;
}

.sound-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-color);
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sound-btn:hover {
  background: var(--primary-color);
  color: white;
}

.word-display {
  display: flex;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.letter-box {
  width: 70px;
  height: 80px;
  background: var(--bg-color);
  border: 3px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  text-transform: lowercase;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
}

.letter-box.missing {
  border-style: dashed;
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(99, 102, 241, 0.02);
}

.letter-box.solved {
  border-style: solid;
  border-color: #10b981;
  color: #10b981;
  background: rgba(16, 185, 129, 0.05);
  animation: success-pop 0.4s ease;
}

.instruction {
  font-size: 1.15rem;
  font-weight: 700;
  opacity: 0.8;
}

.options-container {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.option-letter-btn {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  border: 3px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  font-size: 2.5rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.option-letter-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
}

.option-letter-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Letter Flipping styles */
.instruction-desc {
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  opacity: 0.8;
}

.flipping-canvas {
  display: flex;
  gap: 3rem;
  align-items: center;
  margin: 1rem 0;
  flex-wrap: wrap;
  justify-content: center;
}

.guide-box, .interactive-letter-box {
  width: 140px;
  height: 160px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6rem;
  font-weight: 800;
  position: relative;
}

.guide-box {
  border: 3px dashed rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.02);
}

.ghost-letter {
  opacity: 0.2;
}

.guide-label {
  position: absolute;
  bottom: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.4;
}

.interactive-letter-box {
  border: 3px solid var(--primary-color);
  background: var(--bg-color);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.interactive-letter-box.flipped {
  transform: scaleX(-1);
}

.manipulated-letter {
  display: inline-block;
}

.flipping-controls {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
}

.control-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.9rem;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.flip-btn {
  background: var(--bg-color);
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
}

.flip-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.05);
}

.submit-btn {
  background: var(--primary-color);
  color: white;
  border: none;
}

.submit-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 6px 15px rgba(99, 102, 241, 0.2);
}

.control-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Feedback Banner */
.feedback-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 14px;
  font-weight: 700;
  width: 100%;
  max-width: 500px;
  animation: feedback-slide 0.3s ease;
  margin-top: 1rem;
}

.feedback-banner.correct {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #047857;
}

.feedback-banner.incorrect {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #b91c1c;
}

/* Finished View */
.game-finished-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  text-align: center;
}

.trophy-box {
  background: rgba(245, 158, 11, 0.1);
  width: 130px;
  height: 130px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  animation: trophy-bounce 1s infinite alternate;
}

.trophy-icon {
  color: #f59e0b;
}

.score-summary {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.restart-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 700;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.restart-btn:hover {
  filter: brightness(1.1);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

@keyframes success-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes feedback-slide {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes trophy-bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-8px); }
}
</style>
