<template>
  <div class="home-page">
    <DisabilitySelection v-if="!store.disability" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import DisabilitySelection from '@/components/DisabilitySelection.vue';

const store = useSettingsStore();
const router = useRouter();

const handleRedirect = () => {
  if (store.disability === 'dyslexia') {
    router.replace('/reader');
  } else if (store.disability === 'dyscalculia') {
    router.replace('/dyscalculia');
  }
};

onMounted(() => {
  handleRedirect();
});

watch(() => store.disability, () => {
  handleRedirect();
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-color), #ff6b6b);
}
</style>

