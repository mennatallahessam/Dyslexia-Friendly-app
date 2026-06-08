<template>
  <div class="number-pad">
    <div class="display">{{ value }}</div>
    <div class="grid">
      <button v-for="digit in digits" :key="digit" @click="append(digit)" class="digit-btn">
        {{ digit }}
      </button>
      <button @click="clear" class="action-btn">Clear</button>
      <button @click="backspace" class="action-btn">←</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';

const emit = defineEmits(['input']);
const value = ref('');
const digits = ['7','8','9','4','5','6','1','2','3','0'];

function append(digit: string) {
  if (value.value === '' && digit === '0') return;
  value.value += digit;
  emit('input', value.value);
}
function clear() {
  value.value = '';
  emit('input', value.value);
}
function backspace() {
  value.value = value.value.slice(0, -1);
  emit('input', value.value);
}
</script>

<style scoped>
.number-pad {
  max-width: 320px;
  margin: 1rem auto;
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: var(--shadow-elevation-medium);
}
.display {
  font-size: 2rem;
  text-align: right;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: var(--bg);
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  color: var(--text);
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.digit-btn {
  font-size: 1.5rem;
  padding: 0.75rem;
  background: var(--accent-gradient);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.2s ease;
}
.digit-btn:active {
  transform: scale(0.95);
}
.action-btn {
  grid-column: span 3;
  background: var(--primary-color);
  color: #fff;
  padding: 0.6rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.action-btn:hover {
  background: var(--primary-color-dark);
}
</style>
