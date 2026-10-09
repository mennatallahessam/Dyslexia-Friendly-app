<template>
  <div class="math-tools-container container" :class="`font-${store.fontFamily}`">
    <div class="header-section fade-in">
      <h2>Interactive Math & Function Plotter</h2>
      <p>Format LaTeX mathematical expressions and plot functions dynamically in real time.</p>
    </div>

    <div class="tools-grid">
      <!-- LaTeX Formatter Card -->
      <div class="tool-card math-card">
        <div class="card-header">
          <h3>LaTeX Expression Renderer</h3>
          <p>Type LaTeX code or click a preset to format equations visually.</p>
        </div>

        <div class="input-group">
          <label for="latexInput">LaTeX Code</label>
          <div class="input-wrapper">
            <input 
              id="latexInput" 
              v-model="latex" 
              placeholder="e.g. f(x) = \frac{-b \pm \sqrt{b^2-4ac}}{2a}" 
              @keyup.enter="renderMath"
            />
            <button @click="renderMath" class="action-btn">Render</button>
          </div>
        </div>

        <div class="presets">
          <span class="preset-label">Presets:</span>
          <button @click="applyLatexPreset('x^2 + y^2 = z^2')" class="preset-chip">Pythagoras</button>
          <button @click="applyLatexPreset('f(x) = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}')" class="preset-chip">Quadratic Formula</button>
          <button @click="applyLatexPreset('\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}')" class="preset-chip">Gaussian Integral</button>
        </div>

        <div class="math-render-box">
          <div v-if="renderedMath" class="math-output" v-html="renderedMath"></div>
          <div v-else class="math-placeholder">Rendered expression will appear here</div>
        </div>
      </div>

      <!-- Function Plotter Card -->
      <div class="tool-card plot-card">
        <div class="card-header">
          <h3>Function Grapher</h3>
          <p>Type any math function in terms of <code>x</code> (e.g., <code>x^2 - 4</code>, <code>sin(x)</code>, <code>2x + 1</code>, <code>x^3 - 3x</code>).</p>
        </div>

        <div class="input-group">
          <label for="functionInput">Function f(x)</label>
          <div class="input-wrapper">
            <input 
              id="functionInput" 
              v-model="funcExpr" 
              placeholder="e.g. x^2 - 4, sin(x), 2x + 1, x^3 - 3x" 
              @input="plotFunction"
              @keyup.enter="plotFunction"
            />
            <button @click="plotFunction" class="action-btn">Plot</button>
          </div>
        </div>

        <!-- Range Controls & Presets -->
        <div class="plot-controls">
          <div class="range-inputs">
            <label>X Min: <input type="number" v-model.number="xMin" @change="plotFunction" step="1" /></label>
            <label>X Max: <input type="number" v-model.number="xMax" @change="plotFunction" step="1" /></label>
          </div>
          <div class="presets">
            <span class="preset-label">Function Presets:</span>
            <button @click="applyFuncPreset('x^2 - 4')" class="preset-chip">x² - 4</button>
            <button @click="applyFuncPreset('sin(x)')" class="preset-chip">sin(x)</button>
            <button @click="applyFuncPreset('2x + 1')" class="preset-chip">2x + 1</button>
            <button @click="applyFuncPreset('x^3 - 3x')" class="preset-chip">x³ - 3x</button>
            <button @click="applyFuncPreset('cos(x) * x')" class="preset-chip">x · cos(x)</button>
            <button @click="applyFuncPreset('sqrt(abs(x))')" class="preset-chip">√|x|</button>
          </div>
        </div>

        <!-- Plot Status Warning -->
        <div v-if="plotError" class="plot-error-msg">
          {{ plotError }}
        </div>

        <!-- Plotly Canvas Container -->
        <div ref="plotContainer" class="plot-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Plotly from 'plotly.js-dist-min';
import { useSettingsStore } from '@/stores/settings';

const store = useSettingsStore();

// MathJax setup
let mj: any = null;
let adaptor: any = null;

async function loadMathJax() {
  try {
    const [{ mathjax }, { TeX }, { SVG }, { liteAdaptor }, { RegisterHTMLHandler }] = await Promise.all([
      import('mathjax-full/js/mathjax.js'),
      import('mathjax-full/js/input/tex.js'),
      import('mathjax-full/js/output/svg.js'),
      import('mathjax-full/js/adaptors/liteAdaptor.js'),
      import('mathjax-full/js/handlers/html.js')
    ]);
    adaptor = liteAdaptor();
    RegisterHTMLHandler(adaptor);
    const tex = new TeX({ packages: ['base', 'ams'] });
    const svg = new SVG({ fontCache: 'local' });
    mj = mathjax.document(document, { InputJax: tex, OutputJax: svg });
  } catch (e) {
    console.error('Failed to load MathJax:', e);
  }
}

const latex = ref('f(x) = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}');
const renderedMath = ref('');
const funcExpr = ref('x^2 - 4');
const xMin = ref(-10);
const xMax = ref(10);
const plotError = ref('');
const plotContainer = ref<HTMLElement | null>(null);

function applyLatexPreset(val: string) {
  latex.value = val;
  renderMath();
}

function applyFuncPreset(val: string) {
  funcExpr.value = val;
  plotFunction();
}

async function renderMath() {
  if (!mj) await loadMathJax();
  if (!mj) return;
  try {
    const mathNode = mj.convert(latex.value || 'x^2 + y^2 = z^2', { display: true });
    renderedMath.value = adaptor.outerHTML(mathNode);
  } catch (e) {
    console.error('MathJax rendering error:', e);
  }
}

/**
 * Safely evaluates a mathematical expression for a given x value.
 * Supports standard math syntax: x^2, 2x, sin(x), cos(x), tan(x), sqrt(x), abs(x), log(x), etc.
 */
function evaluateMathExpression(exprStr: string, xVal: number): number {
  if (!exprStr || !exprStr.trim()) return NaN;

  let cleaned = exprStr.trim();

  // Normalize caret ^ to exponentiation **
  cleaned = cleaned.replace(/\^/g, '**');

  // Handle implicit multiplication: 2x -> 2*x, 2(x) -> 2*(x), (x)(x) -> (x)*(x)
  cleaned = cleaned.replace(/(\d)\s*([a-zA-Z(])/g, '$1*$2');
  cleaned = cleaned.replace(/(\))\s*([\d a-zA-Z(])/g, '$1*$2');

  // Handle implicit multiplication like 'x sin(x)' -> 'x*sin(x)'
  cleaned = cleaned.replace(/\b(x)\s+([a-zA-Z0-9(])/g, '$1*$2');

  try {
    // Evaluates inside a Math-scoped context so sin, cos, tan, sqrt, abs, log, PI, E are in scope directly
    const fn = new Function('x', 'Math', `
      with (Math) {
        return (${cleaned});
      }
    `);
    const result = Number(fn(xVal, Math));
    return isFinite(result) ? result : NaN;
  } catch {
    return NaN;
  }
}

function plotFunction() {
  if (!plotContainer.value) return;

  const min = typeof xMin.value === 'number' ? xMin.value : -10;
  const max = typeof xMax.value === 'number' ? xMax.value : 10;
  
  if (min >= max) {
    plotError.value = 'X Min must be strictly less than X Max.';
    return;
  }

  const step = (max - min) / 300; // 300 smooth points
  const xValues: number[] = [];
  const yValues: (number | null)[] = [];
  let validCount = 0;

  for (let x = min; x <= max; x += step) {
    const currentX = Number(x.toFixed(4));
    xValues.push(currentX);

    const yVal = evaluateMathExpression(funcExpr.value, currentX);
    if (!isNaN(yVal)) {
      yValues.push(yVal);
      validCount++;
    } else {
      yValues.push(null);
    }
  }

  if (validCount === 0) {
    plotError.value = 'Could not evaluate function. Check your expression (e.g. x^2, sin(x), 2x + 1).';
  } else {
    plotError.value = '';
  }

  const isDark = store.theme === 'dark';

  const trace = {
    x: xValues,
    y: yValues,
    mode: 'lines',
    type: 'scatter',
    name: `f(x) = ${funcExpr.value}`,
    line: {
      color: '#6366f1',
      width: 3
    },
    connectgaps: false
  };

  const layout = {
    margin: { t: 30, r: 30, b: 40, l: 50 },
    autosize: true,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      color: isDark ? '#f3f4f6' : '#1f2937',
      family: 'Inter, system-ui, sans-serif'
    },
    xaxis: {
      gridcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      zerolinecolor: isDark ? '#818cf8' : '#4f46e5',
      zerolinewidth: 2,
      title: { text: 'x' }
    },
    yaxis: {
      gridcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      zerolinecolor: isDark ? '#818cf8' : '#4f46e5',
      zerolinewidth: 2,
      title: { text: 'f(x)' }
    }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false
  };

  Plotly.newPlot(plotContainer.value, [trace], layout, config);
}

watch(() => store.theme, () => {
  plotFunction();
});

onMounted(() => {
  renderMath();
  plotFunction();
});
</script>

<style scoped>
.math-tools-container {
  padding-top: 1.5rem;
  padding-bottom: 5rem;
  max-width: 1100px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 2.5rem;
}

.header-section h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-section p {
  opacity: 0.75;
  font-size: 1.05rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 900px) {
  .tools-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.tool-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 1.75rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.theme-dark .tool-card {
  border-color: rgba(255, 255, 255, 0.05);
}

.card-header h3 {
  font-size: 1.3rem;
  margin: 0 0 0.35rem 0;
  color: var(--text-color);
}

.card-header p {
  font-size: 0.88rem;
  opacity: 0.7;
  margin: 0;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.input-wrapper input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: var(--bg-color);
  color: var(--text-color);
  outline: none;
  transition: border-color 0.2s;
}

.theme-dark .input-wrapper input {
  border-color: rgba(255, 255, 255, 0.15);
}

.input-wrapper input:focus {
  border-color: var(--primary-color);
}

.action-btn {
  padding: 0.75rem 1.25rem;
  background: var(--primary-color);
  color: white;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.9;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.preset-label {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.6;
  margin-right: 0.25rem;
}

.preset-chip {
  background: rgba(99, 102, 241, 0.08);
  color: var(--primary-color);
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-chip:hover {
  background: var(--primary-color);
  color: white;
}

.math-render-box {
  min-height: 120px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(0, 0, 0, 0.1);
}

.theme-dark .math-render-box {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.1);
}

.math-placeholder {
  opacity: 0.4;
  font-size: 0.9rem;
  font-style: italic;
}

.math-output {
  width: 100%;
  overflow-x: auto;
  display: flex;
  justify-content: center;
}

.plot-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.range-inputs {
  display: flex;
  gap: 1.5rem;
}

.range-inputs label {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.range-inputs input {
  width: 70px;
  padding: 0.35rem 0.5rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: var(--bg-color);
  color: var(--text-color);
}

.theme-dark .range-inputs input {
  border-color: rgba(255, 255, 255, 0.15);
}

.plot-error-msg {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
}

.plot-container {
  width: 100%;
  min-height: 320px;
}
</style>
