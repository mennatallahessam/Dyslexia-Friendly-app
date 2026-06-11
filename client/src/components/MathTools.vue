<template>
  <div class="math-tools">
    <h2>Math Tools</h2>
    <p>Enter a LaTeX expression to render it, or plot a simple function.</p>
    <div class="input-group">
      <label for="latexInput">LaTeX Expression:</label>
      <input id="latexInput" v-model="latex" placeholder="e.g. x^2 + y^2 = z^2" />
      <button @click="renderMath">Render</button>
    </div>
    <div class="math-render" v-html="renderedMath"></div>
    <hr />
    <div class="input-group">
      <label for="functionInput">Plot Function (in x):</label>
      <input id="functionInput" v-model="funcExpr" placeholder="e.g. Math.sin(x)" />
      <button @click="plotFunction">Plot</button>
    </div>
    <div ref="plotContainer" class="plot-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Plotly from 'plotly.js-dist-min';

// Lazy-load MathJax to avoid Vite require errors
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

const latex = ref('');
const renderedMath = ref('');
const funcExpr = ref('Math.sin(x)');
const plotContainer = ref<HTMLElement | null>(null);

async function renderMath() {
  if (!mj) await loadMathJax();
  try {
    const mathNode = mj.convert(latex.value || 'x^2 + y^2 = z^2', { display: true });
    renderedMath.value = adaptor.outerHTML(mathNode);
  } catch (e) {
    console.error('MathJax rendering error:', e);
  }
}

function plotFunction() {
  if (!plotContainer.value) return;
  const xValues = [] as number[];
  const yValues = [] as number[];
  for (let i = -10; i <= 10; i += 0.5) {
    xValues.push(i);
    try {
      // eslint-disable-next-line no-eval
      const y = eval(funcExpr.value);
      yValues.push(y);
    } catch {
      yValues.push(NaN);
    }
  }
  const trace = {
    x: xValues,
    y: yValues,
    mode: 'lines',
    type: 'scatter',
    line: { color: '#6366f1' }
  };
  Plotly.newPlot(plotContainer.value, [trace], {
    margin: { t: 0 },
    width: 600,
    height: 400,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent'
  });
}

onMounted(() => {
  // Initial render for default values
  renderMath();
  plotFunction();
});
</script>

<style scoped>
.math-tools {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
.input-group {
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.input-group input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
}
.input-group button {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.math-render {
  margin-top: 1rem;
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 8px;
}
.plot-container {
  margin-top: 1rem;
}
</style>
