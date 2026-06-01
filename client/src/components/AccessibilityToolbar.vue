<script setup lang="ts">
import { useSettingsStore } from '../stores/settings';
import { 
  Type, 
  Sun, 
  Moon, 
  Coffee, 
  Cloud, 
  Ruler, 
  Volume2, 
  Minus, 
  Plus, 
  Space,
  MousePointer2
} from 'lucide-vue-next';

const store = useSettingsStore();
</script>

<template>
  <div class="accessibility-toolbar">
    <div class="toolbar-group">
      <button @click="store.toggleFont" :class="{ active: store.useDyslexicFont }" title="Toggle Dyslexia Font">
        <Type :size="20" />
        <span>Font</span>
      </button>
      <button @click="store.toggleRuler" :class="{ active: store.showRuler }" title="Toggle Reading Ruler">
        <Ruler :size="20" />
        <span>Ruler</span>
      </button>
    </div>

    <div class="divider"></div>

    <div class="toolbar-group">
      <button @click="store.setTheme('default')" :class="{ active: store.theme === 'default' }" title="Default Theme">
        <Sun :size="20" />
      </button>
      <button @click="store.setTheme('cream')" :class="{ active: store.theme === 'cream' }" title="Cream Theme">
        <Coffee :size="20" />
      </button>
      <button @click="store.setTheme('sky')" :class="{ active: store.theme === 'sky' }" title="Sky Theme">
        <Cloud :size="20" />
      </button>
      <button @click="store.setTheme('dark')" :class="{ active: store.theme === 'dark' }" title="Dark Theme">
        <Moon :size="20" />
      </button>
    </div>

    <div class="divider"></div>

    <div class="toolbar-group">
      <div class="control-item">
        <Space :size="16" />
        <button @click="store.adjustSpacing('letter', -1)"><Minus :size="14" /></button>
        <button @click="store.adjustSpacing('letter', 1)"><Plus :size="14" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accessibility-toolbar {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--toolbar-bg);
  backdrop-filter: blur(12px);
  padding: 0.75rem 1.5rem;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 2000;
  transition: all 0.3s ease;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.divider {
  width: 1px;
  height: 24px;
  background: rgba(0, 0, 0, 0.1);
}

button {
  background: transparent;
  border: none;
  color: var(--text-color);
  padding: 0.5rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

button:hover {
  background: rgba(0, 0, 0, 0.05);
}

button.active {
  background: var(--primary-color);
  color: white;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.control-item button {
  padding: 0.25rem;
}
</style>
