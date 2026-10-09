<template>
  <div class="handwriting-studio container" :class="`font-${store.fontFamily}`">
    <div class="header-section fade-in">
      <h2>Handwriting & Tracing Studio</h2>
      <p>Practice fine motor control, letter formation, and stroke guidance on ruled handwriting paper.</p>
    </div>

    <div class="studio-layout">
      <!-- Toolbar Controls -->
      <div class="control-panel">
        <!-- Template Selection -->
        <div class="control-group">
          <label>Tracing Guide:</label>
          <select v-model="selectedGuide" @change="drawBackground">
            <option value="none">Blank (Free Drawing)</option>
            <optgroup label="Letters">
              <option v-for="char in alphabet" :key="char" :value="`letter-${char}`">Letter {{ char }}</option>
            </optgroup>
            <optgroup label="Numbers">
              <option v-for="num in numbers" :key="num" :value="`number-${num}`">Number {{ num }}</option>
            </optgroup>
            <optgroup label="Patterns">
              <option value="pattern-loops">Cursive Loops</option>
              <option value="pattern-waves">Wave Lines</option>
              <option value="pattern-zigzag">Zigzag Strokes</option>
            </optgroup>
          </select>
        </div>

        <!-- Paper Style -->
        <div class="control-group">
          <label>Paper Style:</label>
          <select v-model="paperStyle" @change="drawBackground">
            <option value="ruled">Ruled Notebook Lines</option>
            <option value="grid">Grid Paper</option>
            <option value="blank">Blank Whiteboard</option>
          </select>
        </div>

        <!-- Tool Mode -->
        <div class="control-group">
          <label>Tool:</label>
          <div class="tool-toggle">
            <button :class="{ active: !isEraser }" @click="isEraser = false" class="tool-btn">
              ✏️ Pen
            </button>
            <button :class="{ active: isEraser }" @click="isEraser = true" class="tool-btn">
              🧹 Eraser
            </button>
          </div>
        </div>

        <!-- Color Selection -->
        <div class="control-group" v-if="!isEraser">
          <label>Ink Color:</label>
          <div class="color-picker">
            <button 
              v-for="color in colors" 
              :key="color.value" 
              :style="{ background: color.value }" 
              :class="{ active: strokeColor === color.value }"
              @click="strokeColor = color.value"
              class="color-swatch"
              :title="color.name"
            />
          </div>
        </div>

        <!-- Stroke Width -->
        <div class="control-group">
          <label>Line Thickness: {{ strokeWidth }}px</label>
          <input type="range" min="2" max="24" v-model.number="strokeWidth" />
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="clearUserStrokes" class="action-btn clear-btn">
            <Trash2 :size="16" /> Clear Drawing
          </button>
          <button @click="downloadCanvas" class="action-btn save-btn">
            <Download :size="16" /> Download Image
          </button>
        </div>
      </div>

      <!-- Interactive Canvas Area -->
      <div class="canvas-wrapper" ref="canvasContainer">
        <canvas 
          ref="bgCanvas" 
          class="canvas-layer bg-layer" 
          :width="canvasWidth" 
          :height="canvasHeight"
        ></canvas>
        <canvas 
          ref="drawCanvas" 
          class="canvas-layer draw-layer" 
          :width="canvasWidth" 
          :height="canvasHeight"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart.prevent="handleTouchStart"
          @touchmove.prevent="handleTouchMove"
          @touchend.prevent="stopDrawing"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { Trash2, Download } from 'lucide-vue-next';

const store = useSettingsStore();

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const numbers = '0123456789'.split('');
const colors = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Blue', value: '#0284c7' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Dark', value: '#1f2937' }
];

const selectedGuide = ref('letter-A');
const paperStyle = ref('ruled');
const isEraser = ref(false);
const strokeColor = ref('#4f46e5');
const strokeWidth = ref(6);

const canvasWidth = ref(800);
const canvasHeight = ref(500);

const canvasContainer = ref<HTMLElement | null>(null);
const bgCanvas = ref<HTMLCanvasElement | null>(null);
const drawCanvas = ref<HTMLCanvasElement | null>(null);

let isDrawing = false;
let lastX = 0;
let lastY = 0;

function resizeCanvas() {
  if (canvasContainer.value) {
    const rect = canvasContainer.value.getBoundingClientRect();
    canvasWidth.value = Math.max(600, rect.width);
    canvasHeight.value = 520;
    setTimeout(() => {
      drawBackground();
    }, 50);
  }
}

function drawBackground() {
  if (!bgCanvas.value) return;
  const ctx = bgCanvas.value.getContext('2d');
  if (!ctx) return;

  const w = canvasWidth.value;
  const h = canvasHeight.value;
  const isDark = store.theme === 'dark';

  // Clear background
  ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Draw paper pattern
  if (paperStyle.value === 'ruled') {
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(99, 102, 241, 0.2)';
    ctx.lineWidth = 1;
    
    // Draw horizontal notebook lines
    const lineSpacing = 100;
    for (let y = 80; y < h; y += lineSpacing) {
      // Top line
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();

      // Middle dashed line
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, y + 40);
      ctx.lineTo(w, y + 40);
      ctx.stroke();

      // Baseline
      ctx.setLineDash([]);
      ctx.strokeStyle = isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, y + 80);
      ctx.lineTo(w, y + 80);
      ctx.stroke();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(99, 102, 241, 0.2)';
    }
  } else if (paperStyle.value === 'grid') {
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    const step = 30;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  // Draw Tracing Guide Overlay
  if (selectedGuide.value.startsWith('letter-') || selectedGuide.value.startsWith('number-')) {
    const char = selectedGuide.value.split('-')[1];
    ctx.font = 'bold 260px "Comic Sans MS", "Outfit", sans-serif';
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, w / 2, h / 2 + 10);
  } else if (selectedGuide.value === 'pattern-loops') {
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 4;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(40, h / 2);
    for (let x = 40; x < w - 40; x += 80) {
      ctx.bezierCurveTo(x + 20, h / 2 - 120, x + 60, h / 2 - 120, x + 80, h / 2);
    }
    ctx.stroke();
  } else if (selectedGuide.value === 'pattern-waves') {
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 4;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(40, h / 2);
    for (let x = 40; x < w - 40; x += 100) {
      ctx.quadraticCurveTo(x + 25, h / 2 - 80, x + 50, h / 2);
      ctx.quadraticCurveTo(x + 75, h / 2 + 80, x + 100, h / 2);
    }
    ctx.stroke();
  } else if (selectedGuide.value === 'pattern-zigzag') {
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 4;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(40, h / 2 + 50);
    for (let x = 40; x < w - 40; x += 80) {
      ctx.lineTo(x + 40, h / 2 - 70);
      ctx.lineTo(x + 80, h / 2 + 50);
    }
    ctx.stroke();
  }
}

function startDrawing(e: MouseEvent) {
  isDrawing = true;
  const rect = drawCanvas.value!.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    isDrawing = true;
    const rect = drawCanvas.value!.getBoundingClientRect();
    lastX = e.touches[0].clientX - rect.left;
    lastY = e.touches[0].clientY - rect.top;
  }
}

function draw(e: MouseEvent) {
  if (!isDrawing || !drawCanvas.value) return;
  const rect = drawCanvas.value.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;
  executeStroke(currentX, currentY);
}

function handleTouchMove(e: TouchEvent) {
  if (!isDrawing || !drawCanvas.value || e.touches.length === 0) return;
  const rect = drawCanvas.value.getBoundingClientRect();
  const currentX = e.touches[0].clientX - rect.left;
  const currentY = e.touches[0].clientY - rect.top;
  executeStroke(currentX, currentY);
}

function executeStroke(currentX: number, currentY: number) {
  const ctx = drawCanvas.value!.getContext('2d');
  if (!ctx) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(currentX, currentY);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (isEraser.value) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = strokeWidth.value * 2;
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = strokeColor.value;
    ctx.lineWidth = strokeWidth.value;
  }

  ctx.stroke();
  lastX = currentX;
  lastY = currentY;
}

function stopDrawing() {
  isDrawing = false;
}

function clearUserStrokes() {
  if (!drawCanvas.value) return;
  const ctx = drawCanvas.value.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
  }
}

function downloadCanvas() {
  if (!bgCanvas.value || !drawCanvas.value) return;
  
  // Combine background and draw layer
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvasWidth.value;
  tempCanvas.height = canvasHeight.value;
  const ctx = tempCanvas.getContext('2d');
  if (!ctx) return;

  ctx.drawImage(bgCanvas.value, 0, 0);
  ctx.drawImage(drawCanvas.value, 0, 0);

  const link = document.createElement('a');
  link.download = `handwriting-practice-${Date.now()}.png`;
  link.href = tempCanvas.toDataURL();
  link.click();
}

watch(() => store.theme, () => {
  drawBackground();
});

onMounted(() => {
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
});
</script>

<style scoped>
.handwriting-studio {
  padding-top: 1.5rem;
  padding-bottom: 5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.header-section h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #10b981, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-section p {
  opacity: 0.75;
  font-size: 1.05rem;
}

.studio-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-panel {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
}

.theme-dark .control-panel {
  border-color: rgba(255, 255, 255, 0.05);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.control-group label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.control-group select {
  padding: 0.45rem 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: var(--bg-color);
  color: var(--text-color);
  font-weight: 600;
  outline: none;
}

.theme-dark .control-group select {
  border-color: rgba(255, 255, 255, 0.15);
}

.tool-toggle {
  display: flex;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.25rem;
  border-radius: 10px;
}

.theme-dark .tool-toggle {
  background: rgba(255, 255, 255, 0.05);
}

.tool-btn {
  padding: 0.35rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--text-color);
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
}

.tool-btn.active {
  background: var(--primary-color);
  color: white;
}

.color-picker {
  display: flex;
  gap: 0.4rem;
}

.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-swatch.active {
  transform: scale(1.2);
  border-color: var(--text-color);
}

.action-buttons {
  margin-left: auto;
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.clear-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.save-btn {
  background: #10b981;
  color: white;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 520px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.theme-dark .canvas-wrapper {
  border-color: rgba(255, 255, 255, 0.08);
}

.canvas-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.draw-layer {
  cursor: crosshair;
}
</style>
