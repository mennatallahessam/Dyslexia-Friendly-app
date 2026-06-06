<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useSettingsStore } from '../stores/settings';

const store = useSettingsStore();

const handleMouseMove = (e: MouseEvent) => {
  if (store.showRuler) {
    // Center the ruler of height store.rulerHeight around mouse Y
    store.updateRulerPosition(e.clientY - (store.rulerHeight / 2));
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
  <div v-if="store.showRuler">
    <!-- Focus Mask Mode -->
    <template v-if="store.useFocusMask">
      <div class="focus-mask-top" :style="{ height: `${store.rulerY}px` }"></div>
      <div 
        class="focus-mask-highlight" 
        :style="{ 
          top: `${store.rulerY}px`, 
          height: `${store.rulerHeight}px`,
          backgroundColor: store.rulerColor,
          opacity: store.rulerOpacity,
          borderColor: store.rulerColor
        }"
      ></div>
      <div class="focus-mask-bottom" :style="{ top: `${store.rulerY + store.rulerHeight}px`, height: `calc(100vh - ${store.rulerY + store.rulerHeight}px)` }"></div>
    </template>

    <!-- Standard Reading Ruler Mode -->
    <template v-else>
      <div 
        class="reading-ruler active"
        :style="{ 
          top: `${store.rulerY}px`, 
          height: `${store.rulerHeight}px`,
          backgroundColor: store.rulerColor,
          opacity: store.rulerOpacity,
          borderColor: store.rulerColor
        }"
      ></div>
    </template>
  </div>
</template>

<style scoped>
/* Focus mask backdrops and highlight borders are styled in style.css */
</style>
