<template>
  <div class="home-page">
    <DisabilitySelection v-if="!store.disability" />
    <template v-else>
      <h2>Welcome, {{ store.disability === 'dyslexia' ? 'Dyslexia' : 'Dyscalculia' }} User</h2>
      <p>Select a tool from the navigation bar to begin.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import DisabilitySelection from '@/components/DisabilitySelection.vue';
const store = useSettingsStore();
</script>

<style scoped>
.home-page {
  padding: 2rem;
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
