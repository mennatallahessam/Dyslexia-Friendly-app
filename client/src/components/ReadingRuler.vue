<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useSettingsStore } from '../stores/settings';

const store = useSettingsStore();

const handleMouseMove = (e: MouseEvent) => {
  if (store.showRuler) {
    store.updateRulerPosition(e.clientY - 20); // Center the 40px height ruler
  }
};

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<template>
  <div 
    v-if="store.showRuler" 
    class="reading-ruler active"
    :style="{ top: `${store.rulerY}px` }"
  ></div>
</template>

<style scoped>
/* Styles are handled in global index.css for the ruler class */
</style>
