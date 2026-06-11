<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { Play, RotateCcw, AlertTriangle } from 'lucide-vue-next';

const store = useSettingsStore();

const num1 = ref(5);
const operator = ref<'+' | '-'>('+');
const num2 = ref(7);

const isJumping = ref(false);
const currentStep = ref(0); // 0: idle, 1: showing first jump, 2: showing second jump, 3: completed
const showMarker = ref(false);
const markerX = ref(40);
const markerY = ref(120);

// SVG positioning constants
const svgWidth = 800;
const svgHeight = 200;
const paddingX = 40;
const lineY = 120;
const stepSize = (svgWidth - paddingX * 2) / 20; // 36px per unit

const getX = (val: number) => paddingX + val * stepSize;

const result = computed(() => {
  if (operator.value === '+') {
    return num1.value + num2.value;
  } else {
    return num1.value - num2.value;
  }
});

const isInvalid = computed(() => {
  const res = result.value;
  return res < 0 || res > 20;
});

// Calculate Bezier quadratic control points for jumps
const firstJumpPath = computed(() => {
  const startX = getX(0);
  const endX = getX(num1.value);
  const ctrlX = (startX + endX) / 2;
  const ctrlY = lineY - Math.min(100, num1.value * 12); // Arc height proportional to distance
  return `M ${startX} ${lineY} Q ${ctrlX} ${ctrlY} ${endX} ${lineY}`;
});

const secondJumpPath = computed(() => {
  const startX = getX(num1.value);
  const endX = getX(result.value);
  const ctrlX = (startX + endX) / 2;
  const distance = Math.abs(result.value - num1.value);
  const ctrlY = lineY - Math.min(100, distance * 12);
  return `M ${startX} ${lineY} Q ${ctrlX} ${ctrlY} ${endX} ${lineY}`;
});

// Run sequence of jumps
const startJumping = async () => {
  if (isInvalid.value) return;
  isJumping.value = true;
  currentStep.value = 1;
  showMarker.value = true;
  
  // Animate first jump
  await animateMarker(0, num1.value, lineY - Math.min(100, num1.value * 12));
  
  // Hold briefly
  await sleep(400);
  currentStep.value = 2;
  
  // Animate second jump
  const distance = Math.abs(result.value - num1.value);
  await animateMarker(num1.value, result.value, lineY - Math.min(100, distance * 12));
  
  await sleep(400);
  currentStep.value = 3;
  isJumping.value = false;
};

// Helper function to animate marker along quadratic bezier
const animateMarker = (fromVal: number, toVal: number, ctrlY: number) => {
  return new Promise<void>((resolve) => {
    const startX = getX(fromVal);
    const endX = getX(toVal);
    const steps = 30;
    let step = 0;
    
    const interval = setInterval(() => {
      step++;
      const t = step / steps;
      
      // Quadratic bezier formula: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
      const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ((startX + endX) / 2) + t * t * endX;
      const y = (1 - t) * (1 - t) * lineY + 2 * (1 - t) * t * ctrlY + t * t * lineY;
      
      markerX.value = x;
      markerY.value = y;
      
      if (step >= steps) {
        clearInterval(interval);
        markerX.value = endX;
        markerY.value = lineY;
        resolve();
      }
    }, 25);
  });
};

const reset = () => {
  currentStep.value = 0;
  showMarker.value = false;
  isJumping.value = false;
  markerX.value = getX(0);
  markerY.value = lineY;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
</script>

<template>
  <div class="number-line container" :class="`font-${store.fontFamily}`">
    <div class="card header-card fade-in">
      <h2>Interactive Jump Number Line</h2>
      <p>Solve addition and subtraction equations visually by watching steps jump along the number line.</p>
      
      <div class="controls-panel">
        <div class="equation-inputs">
          <input 
            type="number" 
            v-model.number="num1" 
            min="0" 
            max="20" 
            class="num-input" 
            :disabled="isJumping"
          />
          
          <select v-model="operator" class="op-select" :disabled="isJumping">
            <option value="+">+</option>
            <option value="-">-</option>
          </select>
          
          <input 
            type="number" 
            v-model.number="num2" 
            min="0" 
            max="20" 
            class="num-input" 
            :disabled="isJumping"
          />
          
          <span class="equals-txt">=</span>
          <span class="result-badge" :class="{ error: isInvalid }">
            {{ isInvalid ? '?' : result }}
          </span>
        </div>

        <div class="action-buttons">
          <button 
            @click="startJumping" 
            :disabled="isJumping || isInvalid"
            class="jump-btn"
          >
            <Play :size="16" />
            Simulate Jumps
          </button>
          <button @click="reset" :disabled="isJumping" class="reset-btn">
            <RotateCcw :size="16" />
            Reset
          </button>
        </div>
      </div>
      
      <div v-if="isInvalid" class="alert-banner">
        <AlertTriangle :size="18" />
        <span>Calculation must result in a value between 0 and 20.</span>
      </div>
    </div>

    <!-- Visual SVG Canvas -->
    <div class="card line-card fade-in">
      <div class="svg-container">
        <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="number-line-svg">
          <!-- First Jump Path (0 to Num1) -->
          <path 
            v-if="currentStep >= 1" 
            :d="firstJumpPath" 
            fill="none" 
            stroke="#6366f1" 
            stroke-width="3.5" 
            stroke-dasharray="1000" 
            stroke-dashoffset="0"
            class="jump-path-1"
          />
          
          <!-- Second Jump Path (Num1 to Result) -->
          <path 
            v-if="currentStep >= 2" 
            :d="secondJumpPath" 
            fill="none" 
            :stroke="operator === '+' ? '#10b981' : '#f43f5e'" 
            stroke-width="3.5" 
            stroke-dasharray="1000" 
            stroke-dashoffset="0"
            class="jump-path-2"
          />

          <!-- Main Axis Line -->
          <line 
            :x1="paddingX - 10" 
            :y1="lineY" 
            :x2="svgWidth - paddingX + 10" 
            :y2="lineY" 
            stroke="var(--text-color)" 
            stroke-width="3"
            opacity="0.7"
          />

          <!-- Tick Marks and Numbers -->
          <g v-for="i in 21" :key="i">
            <!-- Major tick marks -->
            <line 
              :x1="getX(i-1)" 
              :y1="lineY - 6" 
              :x2="getX(i-1)" 
              :y2="lineY + 6" 
              stroke="var(--text-color)" 
              stroke-width="2.5"
            />
            <!-- Numbers -->
            <text 
              :x="getX(i-1)" 
              :y="lineY + 28" 
              text-anchor="middle" 
              class="tick-label"
              :class="{ 
                highlight: (i-1) === 0 || (i-1) === num1 || ((i-1) === result && currentStep >= 2)
              }"
            >
              {{ i - 1 }}
            </text>
          </g>

          <!-- Highlights/Markers -->
          <!-- Start point dot -->
          <circle 
            :cx="getX(0)" 
            :cy="lineY" 
            r="6" 
            fill="#6366f1"
          />
          
          <!-- Midpoint dot (num1) -->
          <circle 
            v-if="currentStep >= 1"
            :cx="getX(num1)" 
            :cy="lineY" 
            r="6" 
            fill="#6366f1"
          />

          <!-- Endpoint Highlight ring -->
          <circle 
            v-if="currentStep >= 2 && !isInvalid"
            :cx="getX(result)" 
            :cy="lineY" 
            r="12" 
            fill="none"
            :stroke="operator === '+' ? '#10b981' : '#f43f5e'" 
            stroke-width="3"
            class="pulse-ring"
          />
          
          <circle 
            v-if="currentStep >= 2 && !isInvalid"
            :cx="getX(result)" 
            :cy="lineY" 
            r="6" 
            :fill="operator === '+' ? '#10b981' : '#f43f5e'" 
          />

          <!-- Jumping Marker (Frog/Ball effect) -->
          <circle 
            v-if="showMarker"
            :cx="markerX" 
            :cy="markerY" 
            r="8" 
            fill="#eab308" 
            stroke="#1e293b"
            stroke-width="2"
            class="glow-marker"
          />
        </svg>
      </div>

      <!-- Explanatory math helper box -->
      <div v-if="currentStep > 0" class="step-explanation">
        <div class="step-box" :class="{ active: currentStep === 1 }">
          <span class="step-num">Step 1</span>
          <span class="step-text">Start at <strong>0</strong> and jump <strong>{{ num1 }}</strong> units forward to land on <strong>{{ num1 }}</strong>.</span>
        </div>
        <div class="step-box" :class="{ active: currentStep === 2 || currentStep === 3 }">
          <span class="step-num">Step 2</span>
          <span class="step-text">
            From <strong>{{ num1 }}</strong>, jump <strong>{{ num2 }}</strong> units 
            <strong>{{ operator === '+' ? 'forward' : 'backward' }}</strong> to land on the answer, 
            <strong>{{ result }}</strong>.
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.number-line {
  padding-bottom: 8rem;
}

.header-card {
  margin: 1.5rem 0;
  padding: 2rem;
}

.controls-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1.5rem;
  background: rgba(0,0,0,0.02);
  padding: 1rem 1.5rem;
  border-radius: 16px;
}

.theme-dark .controls-panel {
  background: rgba(255,255,255,0.02);
}

.equation-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.num-input {
  width: 70px;
  padding: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.15);
  background: var(--bg-color);
  color: var(--text-color);
}

.op-select {
  padding: 0.5rem;
  font-size: 1.25rem;
  font-weight: 800;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.15);
  background: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
}

.equals-txt {
  font-size: 1.5rem;
  font-weight: 700;
}

.result-badge {
  font-size: 1.5rem;
  font-weight: 800;
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 10px;
  min-width: 50px;
  text-align: center;
}

.result-badge.error {
  background: #ef4444;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.jump-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.jump-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.jump-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(0,0,0,0.05);
  border: none;
  padding: 0.6rem 1.25rem;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  color: var(--text-color);
}

.reset-btn:hover {
  background: rgba(0,0,0,0.1);
}

.alert-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.line-card {
  padding: 2rem;
  overflow: hidden;
}

.svg-container {
  width: 100%;
  overflow-x: auto;
}

.number-line-svg {
  width: 100%;
  min-width: 760px;
  height: auto;
}

.tick-label {
  font-size: 0.85rem;
  font-weight: 600;
  fill: var(--text-color);
  opacity: 0.6;
}

.tick-label.highlight {
  font-size: 1.15rem;
  font-weight: 800;
  fill: var(--primary-color);
  opacity: 1;
}

/* SVG Path Draw effect */
.jump-path-1 {
  stroke-dashoffset: 0;
  animation: draw 0.8s ease-out;
}

.jump-path-2 {
  stroke-dashoffset: 0;
  animation: draw 0.8s ease-out;
}

@keyframes draw {
  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.pulse-ring {
  animation: pulse-stroke 1.5s infinite;
}

@keyframes pulse-stroke {
  0% {
    r: 8;
    opacity: 1;
  }
  100% {
    r: 18;
    opacity: 0;
  }
}

.glow-marker {
  filter: drop-shadow(0 0 4px #eab308);
}

/* Step Explanation Panel */
.step-explanation {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  border-top: 1px solid rgba(0,0,0,0.05);
  padding-top: 1.5rem;
}

.theme-dark .step-explanation {
  border-top-color: rgba(255,255,255,0.05);
}

.step-box {
  padding: 1rem;
  border-radius: 12px;
  background: rgba(0,0,0,0.01);
  border: 1px solid transparent;
  opacity: 0.5;
  transition: all 0.3s;
}

.step-box.active {
  opacity: 1;
  background: rgba(99, 102, 241, 0.03);
  border-color: rgba(99, 102, 241, 0.15);
}

.step-num {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.step-text {
  font-size: 0.95rem;
  color: var(--text-color);
}
</style>
