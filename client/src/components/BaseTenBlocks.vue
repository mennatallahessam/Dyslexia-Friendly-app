<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { Plus, Minus, RefreshCw, Layers } from 'lucide-vue-next';

const store = useSettingsStore();

const inputValue = ref(132);
const hundreds = ref(1);
const tens = ref(3);
const ones = ref(2);

// Sync counts when input value changes
const syncFromInput = () => {
  const val = Math.max(0, Math.min(999, inputValue.value));
  hundreds.value = Math.floor(val / 100);
  tens.value = Math.floor((val % 100) / 10);
  ones.value = val % 10;
};

// Watch input value changes
watch(inputValue, () => {
  syncFromInput();
}, { immediate: true });

// Total current value represented by blocks
const totalValue = computed(() => {
  return (hundreds.value * 100) + (tens.value * 10) + ones.value;
});

const increment = (type: 'hundreds' | 'tens' | 'ones') => {
  if (type === 'hundreds' && totalValue.value + 100 <= 999) hundreds.value++;
  if (type === 'tens' && totalValue.value + 10 <= 999) tens.value++;
  if (type === 'ones' && totalValue.value + 1 <= 999) ones.value++;
};

const decrement = (type: 'hundreds' | 'tens' | 'ones') => {
  if (type === 'hundreds' && hundreds.value > 0) hundreds.value--;
  if (type === 'tens' && tens.value > 0) tens.value--;
  if (type === 'ones' && ones.value > 0) ones.value--;
};

// Splitting (decomposing) larger blocks
const splitHundred = () => {
  if (hundreds.value > 0) {
    hundreds.value--;
    tens.value += 10;
  }
};

const splitTen = () => {
  if (tens.value > 0) {
    tens.value--;
    ones.value += 10;
  }
};

// Regrouping (composing) smaller blocks
const canRegroupOnes = computed(() => ones.value >= 10);
const canRegroupTens = computed(() => tens.value >= 10);

const regroupOnes = () => {
  if (ones.value >= 10) {
    ones.value -= 10;
    tens.value += 1;
  }
};

const regroupTens = () => {
  if (tens.value >= 10) {
    tens.value -= 10;
    hundreds.value += 1;
  }
};

const reset = () => {
  inputValue.value = 132;
  syncFromInput();
};
</script>

<template>
  <div class="base-ten-blocks container" :class="`font-${store.fontFamily}`">
    <div class="card header-card fade-in">
      <h2>Base-10 Blocks Visualizer</h2>
      <p>Explore numbers by breaking down hundreds into tens, and tens into ones. Build visual understanding of place value.</p>
      
      <div class="input-panel">
        <div class="number-input-group">
          <label for="numInput">Enter Number (0-999):</label>
          <input 
            id="numInput"
            type="number" 
            v-model.number="inputValue" 
            min="0" 
            max="999"
            class="val-input"
          />
        </div>
        <div class="total-display">
          <span>Active Value:</span>
          <strong class="value-num">{{ totalValue }}</strong>
        </div>
        <div class="regroup-panel">
          <button 
            @click="regroupOnes" 
            :disabled="!canRegroupOnes"
            class="regroup-btn"
            title="Combine 10 Ones into 1 Ten"
          >
            <Layers :size="16" />
            Regroup 10 Ones → 1 Ten
          </button>
          <button 
            @click="regroupTens" 
            :disabled="!canRegroupTens"
            class="regroup-btn"
            title="Combine 10 Tens into 1 Hundred"
          >
            <Layers :size="16" />
            Regroup 10 Tens → 1 Hundred
          </button>
          <button @click="reset" class="reset-btn" title="Reset blocks">
            <RefreshCw :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Playground View -->
    <div class="blocks-playground fade-in">
      <!-- Hundreds Section (Flats) -->
      <div class="column-section flats-section">
        <div class="col-header">
          <h3>Hundreds Flat ({{ hundreds }})</h3>
          <div class="col-controls">
            <button @click="decrement('hundreds')" :disabled="hundreds === 0"><Minus :size="14" /></button>
            <button @click="increment('hundreds')" :disabled="totalValue + 100 > 999"><Plus :size="14" /></button>
          </div>
        </div>
        <p class="section-tip" v-if="hundreds > 0">💡 Click a flat to break it into 10 rods!</p>
        <div class="blocks-container flat-grid">
          <div 
            v-for="i in hundreds" 
            :key="'flat-'+i" 
            class="hundred-flat-wrap"
            @click="splitHundred()"
            title="Click to decompose this hundred flat into 10 rods"
          >
            <div class="hundred-flat">
              <div v-for="cell in 100" :key="cell" class="block-unit mini"></div>
            </div>
          </div>
          <div v-if="hundreds === 0" class="empty-placeholder">No Hundreds</div>
        </div>
      </div>

      <!-- Tens Section (Rods) -->
      <div class="column-section rods-section">
        <div class="col-header">
          <h3>Tens Rods ({{ tens }})</h3>
          <div class="col-controls">
            <button @click="decrement('tens')" :disabled="tens === 0"><Minus :size="14" /></button>
            <button @click="increment('tens')" :disabled="totalValue + 10 > 999"><Plus :size="14" /></button>
          </div>
        </div>
        <p class="section-tip" v-if="tens > 0">💡 Click a rod to break it into 10 units!</p>
        <div class="blocks-container rod-grid">
          <div 
            v-for="i in tens" 
            :key="'rod-'+i" 
            class="ten-rod"
            @click="splitTen()"
            title="Click to decompose this ten rod into 10 unit ones"
          >
            <div v-for="cell in 10" :key="cell" class="block-unit mini"></div>
          </div>
          <div v-if="tens === 0" class="empty-placeholder">No Tens</div>
        </div>
      </div>

      <!-- Ones Section (Units) -->
      <div class="column-section units-section">
        <div class="col-header">
          <h3>Ones Units ({{ ones }})</h3>
          <div class="col-controls">
            <button @click="decrement('ones')" :disabled="ones === 0"><Minus :size="14" /></button>
            <button @click="increment('ones')" :disabled="totalValue + 1 > 999"><Plus :size="14" /></button>
          </div>
        </div>
        <p class="section-tip" v-if="ones >= 10">💡 You can regroup 10 units into 1 ten above!</p>
        <div class="blocks-container unit-grid">
          <div 
            v-for="i in ones" 
            :key="'one-'+i" 
            class="block-unit"
          ></div>
          <div v-if="ones === 0" class="empty-placeholder">No Ones</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-ten-blocks {
  padding-bottom: 8rem;
}

.header-card {
  margin: 1.5rem 0;
  padding: 2rem;
}

.input-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1.5rem;
  background: rgba(0, 0, 0, 0.02);
  padding: 1rem 1.5rem;
  border-radius: 16px;
}

.theme-dark .input-panel {
  background: rgba(255, 255, 255, 0.02);
}

.number-input-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.val-input {
  width: 90px;
  padding: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: var(--bg-color);
  color: var(--text-color);
}

.total-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.value-num {
  font-size: 1.75rem;
  color: var(--primary-color);
  font-weight: 800;
}

.regroup-panel {
  display: flex;
  gap: 0.75rem;
}

.regroup-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--bg-color);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  font-weight: 700;
  font-size: 0.85rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.regroup-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.regroup-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: rgba(0, 0, 0, 0.1);
  color: var(--text-color);
}

.theme-dark .regroup-btn:disabled {
  border-color: rgba(255, 255, 255, 0.1);
}

.reset-btn {
  background: rgba(0, 0, 0, 0.05);
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.blocks-playground {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .blocks-playground {
    grid-template-columns: 1fr;
  }
}

.column-section {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
  min-height: 450px;
}

.col-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
}

.theme-dark .col-header {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.col-controls {
  display: flex;
  gap: 0.35rem;
}

.col-controls button {
  background: rgba(0, 0, 0, 0.04);
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-color);
}

.col-controls button:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.col-controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.section-tip {
  font-size: 0.8rem;
  opacity: 0.6;
  margin-bottom: 1rem;
  font-style: italic;
}

.blocks-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  flex-grow: 1;
  align-content: flex-start;
  overflow-y: auto;
  max-height: 400px;
  padding: 0.25rem;
}

.empty-placeholder {
  width: 100%;
  text-align: center;
  padding: 3rem;
  opacity: 0.3;
  font-weight: 600;
  border: 2px dashed rgba(0,0,0,0.05);
  border-radius: 12px;
}

/* Base units blocks */
.block-unit {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #ec4899, #db2777);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 3px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.block-unit.mini {
  width: 10px;
  height: 10px;
  border-radius: 1px;
  box-shadow: none;
}

/* Ten Rod styling */
.ten-rod {
  display: flex;
  flex-direction: column;
  border: 2px solid #9333ea;
  background: #faf5ff;
  border-radius: 6px;
  padding: 2px;
  gap: 1px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  width: 18px;
  height: 124px;
}

.ten-rod:hover {
  transform: scale(1.08) rotate(1deg);
  box-shadow: 0 4px 10px rgba(147, 51, 234, 0.25);
}

.ten-rod .block-unit {
  background: linear-gradient(135deg, #a855f7, #9333ea);
  border-color: rgba(0,0,0,0.08);
}

/* Hundred Flat styling */
.hundred-flat-wrap {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.hundred-flat-wrap:hover {
  transform: scale(1.05) rotate(-0.5deg);
  box-shadow: 0 6px 15px rgba(79, 70, 229, 0.25);
}

.hundred-flat {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  gap: 1px;
  border: 3px solid #4f46e5;
  background: #eef2ff;
  padding: 3px;
  border-radius: 8px;
  width: 124px;
  height: 124px;
}

.hundred-flat .block-unit {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-color: rgba(0,0,0,0.08);
}

/* Unit Grid layout */
.unit-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}
</style>
