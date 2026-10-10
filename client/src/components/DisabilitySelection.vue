<template>
  <div class="selection-page">
    <!-- Animated background orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="content">
      <div class="hero-text fade-in">
        <div class="badge">Inclusive Learning Portal</div>
        <h1>What would you like <br /><span class="gradient-text">support with today?</span></h1>
        <p>Select your profile to get a personalized set of assistive tools designed just for you.</p>
      </div>

      <div class="profile-cards fade-in-up">
        <button
          v-for="profile in profiles"
          :key="profile.type"
          class="profile-card"
          :class="profile.accent"
          @click="choose(profile.type)"
        >
          <div class="card-glow"></div>
          <div class="card-icon-wrap">
            <component :is="profile.icon" :size="36" />
          </div>
          <h3>{{ profile.label }}</h3>
          <p>{{ profile.description }}</p>
          <div class="card-arrow">
            <ChevronRight :size="20" />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import { BookOpen, Calculator, PenTool, ChevronRight } from 'lucide-vue-next';

const router = useRouter();
const store = useSettingsStore();

const profiles = [
  {
    type: 'dyslexia' as const,
    label: 'Dyslexia',
    description: 'Reading assistance, phonics games, and dyslexia diagnostics.',
    icon: BookOpen,
    accent: 'accent-indigo',
  },
  {
    type: 'dyscalculia' as const,
    label: 'Dyscalculia',
    description: 'Visual number tools, math aids, and interactive number lines.',
    icon: Calculator,
    accent: 'accent-pink',
  },
  {
    type: 'dysgraphia' as const,
    label: 'Dysgraphia',
    description: 'Writing studio, voice dictation, and handwriting tracing exercises.',
    icon: PenTool,
    accent: 'accent-emerald',
  },
];

function choose(dis: 'dyslexia' | 'dyscalculia' | 'dysgraphia') {
  store.setDisability(dis);
  if (dis === 'dyslexia') {
    router.push('/dyslexia');
  } else if (dis === 'dyscalculia') {
    router.push('/dyscalculia');
  } else if (dis === 'dysgraphia') {
    store.setActiveTab('writing');
    router.push('/dysgraphia');
  }
}
</script>

<style scoped>
.selection-page {
  min-height: 100vh;
  background: #0f0f1a;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

/* Animated background orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  animation: float 8s ease-in-out infinite;
}
.orb-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #6366f1, transparent);
  top: -100px; left: -150px;
  animation-delay: 0s;
}
.orb-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #ec4899, transparent);
  bottom: -80px; right: -100px;
  animation-delay: -3s;
}
.orb-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #10b981, transparent);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -6s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

.orb-2 { animation-name: float2; }
@keyframes float2 {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(25px) scale(0.95); }
}

.content {
  position: relative;
  z-index: 10;
  text-align: center;
  max-width: 1100px;
  width: 100%;
}

.hero-text {
  margin-bottom: 3.5rem;
}

.badge {
  display: inline-block;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #a5b4fc;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  margin-bottom: 1.5rem;
}

h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: white;
  line-height: 1.2;
  margin: 0 0 1rem;
}

.gradient-text {
  background: linear-gradient(135deg, #818cf8, #ec4899, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-text p {
  color: rgba(255, 255, 255, 0.55);
  font-size: 1.15rem;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Profile Cards */
.profile-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.profile-card {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 2.5rem 2rem 2rem;
  cursor: pointer;
  text-align: left;
  color: white;
  backdrop-filter: blur(20px);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.card-glow {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: 24px;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.profile-card:hover .card-glow {
  opacity: 1;
}

.profile-card:hover {
  transform: translateY(-8px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
}

/* Accent colours */
.accent-indigo .card-glow { background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.12), transparent 70%); }
.accent-indigo .card-icon-wrap { background: linear-gradient(135deg, #818cf8, #4f46e5); box-shadow: 0 8px 20px rgba(99,102,241,0.4); }
.accent-indigo:hover { border-color: rgba(99, 102, 241, 0.5); }

.accent-pink .card-glow { background: radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.12), transparent 70%); }
.accent-pink .card-icon-wrap { background: linear-gradient(135deg, #f472b6, #db2777); box-shadow: 0 8px 20px rgba(236,72,153,0.4); }
.accent-pink:hover { border-color: rgba(236, 72, 153, 0.5); }

.accent-emerald .card-glow { background: radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.12), transparent 70%); }
.accent-emerald .card-icon-wrap { background: linear-gradient(135deg, #34d399, #059669); box-shadow: 0 8px 20px rgba(16,185,129,0.4); }
.accent-emerald:hover { border-color: rgba(16, 185, 129, 0.5); }

.card-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  color: white;
  transition: transform 0.3s ease;
}

.profile-card:hover .card-icon-wrap {
  transform: scale(1.1) rotate(-3deg);
}

.profile-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.profile-card p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.5;
}

.card-arrow {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.profile-card:hover .card-arrow {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateX(4px);
}

/* Animations */
.fade-in { animation: fadeIn 0.7s ease both; }
.fade-in-up { animation: fadeInUp 0.7s ease 0.2s both; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
