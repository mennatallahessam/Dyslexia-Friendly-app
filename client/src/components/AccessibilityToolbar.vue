<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
const auth = useAuthStore();
const router = useRouter();
function handleLogout() {
  auth.logout();
  router.replace('/login');
}
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
  LogOut,
  Palette,
} from 'lucide-vue-next';

const store = useSettingsStore();

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
  <div class="toolbar-wrapper">
    <!-- Sliding Custom Theme Panel -->
    <Transition name="slide-up">
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
    </Transition>

    <!-- Sliding Ruler Customizer Sub-toolbar -->
    <Transition name="slide-up">
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

        <!-- Color Options -->
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
    </Transition>

    <!-- Main Toolbar -->
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

      <!-- Spacing and Sizing Adjusters -->
      <div class="toolbar-group adjusters-group">
        <!-- Font Size -->
        <div class="control-item" title="Adjust Font Size">
          <span class="control-icon-label"><Type :size="16" /></span>
          <button @click="store.adjustFontSize(-2)" class="adjust-btn"><Minus :size="12" /></button>
          <span class="control-value">{{ store.fontSize }}px</span>
          <button @click="store.adjustFontSize(2)" class="adjust-btn"><Plus :size="12" /></button>
        </div>

        <div class="vertical-subdivider"></div>

        <!-- Word Spacing -->
        <div class="control-item" title="Adjust Word Spacing">
          <span class="control-icon-label"><Space :size="16" /></span>
          <button @click="store.adjustSpacing('word', -2)" class="adjust-btn"><Minus :size="12" /></button>
          <span class="control-value">{{ store.wordSpacing }}px</span>
          <button @click="store.adjustSpacing('word', 2)" class="adjust-btn"><Plus :size="12" /></button>
        </div>

        <div class="vertical-subdivider"></div>

        <!-- Line Height -->
        <div class="control-item" title="Adjust Line Height">
          <span class="control-icon-label"><AlignJustify :size="16" /></span>
          <button @click="store.adjustLineHeight(-0.2)" class="adjust-btn"><Minus :size="12" /></button>
          <span class="control-value">{{ store.lineHeight }}x</span>
          <button @click="store.adjustLineHeight(0.2)" class="adjust-btn"><Plus :size="12" /></button>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Themes -->
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

      <!-- Toggles (Ruler & Bionic Reading) -->
      <div class="toolbar-group toggles-group">
        <button @click="store.toggleBionicReading" :class="{ active: store.bionicReading }" title="Bionic Reading Mode" class="icon-toggle-btn">
          <Eye :size="18" />
          <span>Bionic</span>
        </button>
        <template v-if="auth.isAuthenticated">
          <button @click="handleLogout" class="icon-toggle-btn" title="Logout">
            <LogOut :size="18" />
            <span>Logout</span>
          </button>
        </template>
        <button @click="store.toggleRuler" :class="{ active: store.showRuler }" title="Reading Ruler and Focus Mask" class="icon-toggle-btn">
          <Ruler :size="18" />
          <span>Ruler</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar-wrapper {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  pointer-events: none; /* Let clicks pass through outside of containers */
}

.accessibility-toolbar, .ruler-sub-toolbar {
  pointer-events: auto; /* Re-enable clicks */
  background: var(--toolbar-bg);
  backdrop-filter: blur(16px);
  padding: 0.6rem 1.25rem;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.ruler-sub-toolbar {
  padding: 0.4rem 1.25rem;
  border-radius: 100px;
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

/* Slide Up Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(15px);
  opacity: 0;
}
</style>
