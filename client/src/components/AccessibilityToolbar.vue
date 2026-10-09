<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { 
  Type, 
  Sun, 
  Moon, 
  Coffee, 
  Cloud, 
  Ruler, 
  Minus, 
  Plus, 
  Space,
  Eye,
  EyeOff,
  AlignJustify,
  Palette,
  Sliders,
  X
} from 'lucide-vue-next';

const store = useSettingsStore();

// Collapsed state: default to true so it sits as a compact floating widget and never blocks page content
const isCollapsed = ref(true);

const customBg = ref(store.customBgColor);
const customText = ref(store.customTextColor);

const updateCustomColors = () => {
  store.setCustomColors(customBg.value, customText.value);
};

const selectPresetBg = (bg: string) => {
  customBg.value = bg;
  updateCustomColors();
};

const selectPresetText = (txt: string) => {
  customText.value = txt;
  updateCustomColors();
};

watch(() => store.customBgColor, (newBg) => {
  customBg.value = newBg;
});

watch(() => store.customTextColor, (newTxt) => {
  customText.value = newTxt;
});
</script>

<template>
  <div class="accessibility-widget-wrapper">
    <!-- Collapsed Floating Button Trigger -->
    <Transition name="fade-pop">
      <button 
        v-if="isCollapsed" 
        @click="isCollapsed = false" 
        class="floating-widget-trigger"
        title="Open Accessibility Controls"
      >
        <Sliders :size="18" class="trigger-icon" />
        <span class="trigger-label">Accessibility</span>
      </button>
    </Transition>

    <!-- Expanded Full Floating Toolbar Panel -->
    <Transition name="slide-up">
      <div v-if="!isCollapsed" class="toolbar-container">
        <!-- Sub-toolbar for Custom Colors -->
        <div v-if="store.theme === 'custom'" class="ruler-sub-toolbar custom-theme-sub-toolbar">
          <div class="toolbar-group colors-group">
            <span class="label-txt">BG:</span>
            <input 
              type="color" 
              v-model="customBg" 
              @input="updateCustomColors"
              class="color-picker-input" 
              title="Custom Background Color"
            />
            <button 
              v-for="bg in ['#fdfdf5', '#fee2e2', '#ffedd5', '#f0fdf4', '#ecfeff']" 
              :key="bg" 
              @click="selectPresetBg(bg)"
              class="preset-dot"
              :style="{ backgroundColor: bg }"
              :class="{ active: store.customBgColor === bg }"
              title="Select preset background"
            ></button>
          </div>
          
          <div class="sub-divider"></div>
          
          <div class="toolbar-group colors-group">
            <span class="label-txt">Text:</span>
            <input 
              type="color" 
              v-model="customText" 
              @input="updateCustomColors"
              class="color-picker-input" 
              title="Custom Text Color"
            />
            <button 
              v-for="text in ['#1e293b', '#1c1917', '#064e3b', '#0c4a6e', '#581c87']" 
              :key="text" 
              @click="selectPresetText(text)"
              class="preset-dot text-preset"
              :style="{ backgroundColor: text }"
              :class="{ active: store.customTextColor === text }"
              title="Select preset text color"
            ></button>
          </div>
        </div>

        <!-- Sub-toolbar for Ruler & Focus Mask -->
        <div v-if="store.showRuler" class="ruler-sub-toolbar">
          <div class="toolbar-group">
            <button 
              @click="store.toggleFocusMask" 
              :class="{ active: store.useFocusMask }" 
              title="Focus Mask dims surroundings"
              class="mask-btn"
            >
              <EyeOff :size="16" />
              <span>Focus Mask</span>
            </button>
          </div>
          
          <div class="sub-divider"></div>
          
          <div class="toolbar-group slider-group">
            <span class="label-txt">Height</span>
            <button @click="store.adjustRulerHeight(-10)" class="adjust-mini-btn" title="Decrease Height"><Minus :size="12" /></button>
            <span class="value-txt">{{ store.rulerHeight }}px</span>
            <button @click="store.adjustRulerHeight(10)" class="adjust-mini-btn" title="Increase Height"><Plus :size="12" /></button>
          </div>

          <div class="sub-divider"></div>

          <div class="toolbar-group slider-group">
            <span class="label-txt">Opacity</span>
            <button @click="store.adjustRulerOpacity(-0.05)" class="adjust-mini-btn" title="Decrease Opacity"><Minus :size="12" /></button>
            <span class="value-txt">{{ Math.round(store.rulerOpacity * 100) }}%</span>
            <button @click="store.adjustRulerOpacity(0.05)" class="adjust-mini-btn" title="Increase Opacity"><Plus :size="12" /></button>
          </div>

          <div class="sub-divider"></div>

          <div class="toolbar-group colors-group">
            <button 
              v-for="color in ['#6366f1', '#f43f5e', '#eab308', '#10b981', '#0ea5e9']" 
              :key="color" 
              @click="store.setRulerColor(color)"
              class="color-dot"
              :style="{ backgroundColor: color }"
              :class="{ active: store.rulerColor === color }"
              :title="`Set ruler color to ${color}`"
            ></button>
          </div>
        </div>

        <!-- Main Toolbar Bar -->
        <div class="accessibility-toolbar">
          <!-- Font Family Controls -->
          <div class="toolbar-group font-selectors">
            <button 
              @click="store.setFontFamily('outfit')" 
              :class="{ active: store.fontFamily === 'outfit' }"
              class="font-btn"
              title="Default Sans-Serif Font"
            >
              Default
            </button>
            <button 
              @click="store.setFontFamily('opendyslexic')" 
              :class="{ active: store.fontFamily === 'opendyslexic' }"
              class="font-btn"
              title="OpenDyslexic Font"
            >
              Dyslexic
            </button>
            <button 
              @click="store.setFontFamily('comic')" 
              :class="{ active: store.fontFamily === 'comic' }"
              class="font-btn"
              title="Comic Readable Font"
            >
              Comic
            </button>
            <button 
              @click="store.setFontFamily('lexend')" 
              :class="{ active: store.fontFamily === 'lexend' }"
              class="font-btn"
              title="Lexend Fluency Font"
            >
              Lexend
            </button>
          </div>

          <div class="divider"></div>

          <!-- Spacing & Sizing Adjusters -->
          <div class="toolbar-group adjusters-group">
            <div class="control-item" title="Adjust Font Size">
              <span class="control-icon-label"><Type :size="16" /></span>
              <button @click="store.adjustFontSize(-2)" class="adjust-btn"><Minus :size="12" /></button>
              <span class="control-value">{{ store.fontSize }}px</span>
              <button @click="store.adjustFontSize(2)" class="adjust-btn"><Plus :size="12" /></button>
            </div>

            <div class="vertical-subdivider"></div>

            <div class="control-item" title="Adjust Word Spacing">
              <span class="control-icon-label"><Space :size="16" /></span>
              <button @click="store.adjustSpacing('word', -2)" class="adjust-btn"><Minus :size="12" /></button>
              <span class="control-value">{{ store.wordSpacing }}px</span>
              <button @click="store.adjustSpacing('word', 2)" class="adjust-btn"><Plus :size="12" /></button>
            </div>

            <div class="vertical-subdivider"></div>

            <div class="control-item" title="Adjust Line Height">
              <span class="control-icon-label"><AlignJustify :size="16" /></span>
              <button @click="store.adjustLineHeight(-0.2)" class="adjust-btn"><Minus :size="12" /></button>
              <span class="control-value">{{ store.lineHeight }}x</span>
              <button @click="store.adjustLineHeight(0.2)" class="adjust-btn"><Plus :size="12" /></button>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Theme Presets -->
          <div class="toolbar-group theme-group">
            <button @click="store.setTheme('default')" :class="{ active: store.theme === 'default' }" class="theme-btn default-theme" title="Light Theme">
              <Sun :size="18" />
            </button>
            <button @click="store.setTheme('cream')" :class="{ active: store.theme === 'cream' }" class="theme-btn cream-theme" title="Cream Theme">
              <Coffee :size="18" />
            </button>
            <button @click="store.setTheme('sky')" :class="{ active: store.theme === 'sky' }" class="theme-btn sky-theme" title="Sky Theme">
              <Cloud :size="18" />
            </button>
            <button @click="store.setTheme('dark')" :class="{ active: store.theme === 'dark' }" class="theme-btn dark-theme" title="Dark Theme">
              <Moon :size="18" />
            </button>
            <button @click="store.setTheme('custom')" :class="{ active: store.theme === 'custom' }" class="theme-btn custom-theme-btn" title="Custom Filter Theme">
              <Palette :size="18" />
            </button>
          </div>

          <div class="divider"></div>

          <!-- Feature Toggles -->
          <div class="toolbar-group toggles-group">
            <button @click="store.toggleBionicReading" :class="{ active: store.bionicReading }" title="Bionic Reading Mode" class="icon-toggle-btn">
              <Eye :size="18" />
              <span>Bionic</span>
            </button>
            <button @click="store.toggleRuler" :class="{ active: store.showRuler }" title="Reading Ruler and Focus Mask" class="icon-toggle-btn">
              <Ruler :size="18" />
              <span>Ruler</span>
            </button>
          </div>

          <div class="divider"></div>

          <!-- Collapse / Minimize Button -->
          <button @click="isCollapsed = true" class="collapse-btn" title="Hide/Minimize Toolbar">
            <X :size="16" />
            <span>Minimize</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.accessibility-widget-wrapper {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 2000;
}

/* Floating Trigger Button */
.floating-widget-trigger {
  background: var(--primary-color, #6366f1);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-widget-trigger:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.5);
}

/* Toolbar Panel Container */
.toolbar-container {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  max-width: 95vw;
}

.accessibility-toolbar, .ruler-sub-toolbar {
  background: var(--toolbar-bg);
  backdrop-filter: blur(16px);
  padding: 0.6rem 1.25rem;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  flex-wrap: wrap;
  justify-content: center;
}

.ruler-sub-toolbar {
  padding: 0.4rem 1.25rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  font-size: 0.85rem;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.divider {
  width: 1px;
  height: 24px;
  background: rgba(0, 0, 0, 0.08);
}

.sub-divider {
  width: 1px;
  height: 16px;
  background: rgba(0, 0, 0, 0.08);
}

.vertical-subdivider {
  width: 1px;
  height: 14px;
  background: rgba(0, 0, 0, 0.05);
}

button {
  background: transparent;
  border: none;
  color: var(--text-color);
  padding: 0.45rem 0.75rem;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.15s ease;
}

button:hover {
  background: rgba(0, 0, 0, 0.05);
}

button.active {
  background: var(--primary-color);
  color: white;
}

.collapse-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  border-radius: 50px;
}

.collapse-btn:hover {
  background: #ef4444;
  color: white;
}

/* Custom font buttons */
.font-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

/* Typography Adjusters */
.control-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(0, 0, 0, 0.03);
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
}

.control-icon-label {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  opacity: 0.6;
  margin: 0 0.1rem;
}

.control-value {
  font-weight: 700;
  font-size: 0.8rem;
  min-width: 36px;
  text-align: center;
}

.adjust-btn {
  padding: 0.2rem;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 50%;
}
.adjust-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Sub-toolbar features */
.label-txt {
  font-weight: 700;
  opacity: 0.6;
  margin-right: 0.2rem;
}

.value-txt {
  font-weight: 700;
  min-width: 30px;
  text-align: center;
}

.adjust-mini-btn {
  padding: 0.15rem;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 50%;
}

.mask-btn {
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
}

/* Color dot pickers */
.colors-group {
  gap: 0.35rem;
}

.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  padding: 0;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.color-dot:hover {
  transform: scale(1.2);
}

.color-dot.active {
  border-color: var(--text-color);
  transform: scale(1.1);
}

/* Icon Toggles */
.icon-toggle-btn {
  padding: 0.45rem 0.8rem;
}

/* Theme buttons specific circular styling */
.theme-btn {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
}

/* Custom theme color pickers */
.color-picker-input {
  width: 26px;
  height: 26px;
  border: 2px solid rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  background: none;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.color-picker-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker-input::-webkit-color-swatch {
  border: none;
  border-radius: 50%;
}

.preset-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 0;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.preset-dot:hover {
  transform: scale(1.2);
}

.preset-dot.active {
  border: 2px solid var(--primary-color);
  transform: scale(1.1);
}

.custom-theme-btn {
  background: linear-gradient(135deg, #fca5a5, #fde047, #86efac, #93c5fd);
  border: 2px solid transparent;
}

.custom-theme-btn.active {
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
}

/* Transitions */
.fade-pop-enter-active, .fade-pop-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-pop-enter-from, .fade-pop-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translate(-50%, 20px);
  opacity: 0;
}
</style>
