import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Home from '@/components/Home.vue';
import WritingAssistant from '@/components/WritingAssistant.vue';
import PhonicsGame from '@/components/PhonicsGame.vue';
import PdfReader from '@/components/PdfReader.vue';
import MathTools from '@/components/MathTools.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: Home },
  { path: '/login', component: () => import('@/components/Login.vue') },
  { path: '/register', component: () => import('@/components/Registration.vue') },
  { path: '/math-tools', component: MathTools },
  { path: '/writing-assistant', component: WritingAssistant },
  { path: '/phonics', component: PhonicsGame },
  { path: '/pdf', component: PdfReader },
  { path: '/reader', component: () => import('@/components/Reader.vue') },
  
  // Dyscalculia core toolkit routes
  { path: '/dyscalculia', component: () => import('@/components/DyscalculiaDashboard.vue') },
  { path: '/dyscalculia/number-pad', component: () => import('@/components/NumberPad.vue') },
  { path: '/dyscalculia/voice-number-input', component: () => import('@/components/VoiceNumberInput.vue') },
  { path: '/dyscalculia/digit-assembly', component: () => import('@/components/DigitAssembly.vue') },
  { path: '/dyscalculia/place-value-columns', component: () => import('@/components/PlaceValueColumns.vue') },
  { path: '/dyscalculia/base-ten-blocks', component: () => import('@/components/BaseTenBlocks.vue') },
  { path: '/dyscalculia/number-line', component: () => import('@/components/NumberLine.vue') }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global navigation guard – redirect unauthenticated users to /login
router.beforeEach((to, _unused, next) => {
  const auth = useAuthStore();
  if (!auth.isAuthenticated && to.path !== '/login' && to.path !== '/register') {
    next('/login');
  } else {
    next();
  }
});

export default router;
