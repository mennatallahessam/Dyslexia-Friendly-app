<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ReadingRuler from './components/ReadingRuler.vue';
import WordInspector from './components/WordInspector.vue';
import AccessibilityToolbar from './components/AccessibilityToolbar.vue';
import { useSettingsStore } from './stores/settings';
import { useAuthStore } from './stores/auth';
import { Sparkles } from 'lucide-vue-next';

const store = useSettingsStore();
const auth = useAuthStore();
const router = useRouter();

onMounted(() => {
  auth.loadFromStorage();
});

const switchProfile = () => {
  store.disability = null;
  localStorage.removeItem('disability');
  router.push('/');
};

const handleLogout = () => {
  auth.logout();
  router.replace('/login');
};
</script>

<template>
  <div class="app-container">
    <!-- Global Header / Top Navigation Bar -->
    <header v-if="auth.isAuthenticated" class="app-header">
      <div class="header-container">
        <router-link to="/" class="brand-logo">
          <Sparkles :size="24" class="logo-icon" />
          <span>InclusivePortal</span>
        </router-link>
        
        <nav v-if="store.disability" class="nav-links">
          <template v-if="store.disability === 'dyslexia'">
            <router-link to="/reader" class="nav-item">Reader</router-link>
            <router-link to="/phonics" class="nav-item">Phonics Games</router-link>
            <router-link to="/pdf" class="nav-item">PDF Reader</router-link>
          </template>
          <template v-else-if="store.disability === 'dyscalculia'">
            <router-link to="/dyscalculia" class="nav-item">Dashboard</router-link>
            <router-link to="/math-tools" class="nav-item">Math Tools</router-link>
          </template>
        </nav>
        
        <div class="user-controls">
          <span v-if="store.disability" class="profile-badge" :class="store.disability">
            {{ store.disability === 'dyslexia' ? 'Dyslexia' : 'Dyscalculia' }}
          </span>
          <button v-if="store.disability" @click="switchProfile" class="switch-profile-btn" title="Switch Profile">
            Switch Profile
          </button>
          <button @click="handleLogout" class="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Global Floating Overlays -->
    <ReadingRuler />
    <AccessibilityToolbar v-if="auth.isAuthenticated" />
    <WordInspector />
  </div>
</template>

<style>
/* Global Header Styling */
.app-header {
  background: var(--toolbar-bg);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 1500;
  width: 100%;
}

.theme-dark .app-header {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-color);
  font-weight: 800;
  font-size: 1.25rem;
}

.logo-icon {
  color: var(--primary-color);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-item {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 700;
  font-size: 0.95rem;
  opacity: 0.7;
  padding: 0.35rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.nav-item:hover, .nav-item.router-link-active {
  opacity: 1;
  border-bottom-color: var(--primary-color);
  color: var(--primary-color);
}

.user-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-badge {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  text-transform: uppercase;
}

.profile-badge.dyslexia {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.profile-badge.dyscalculia {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.switch-profile-btn {
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: var(--text-color);
  padding: 0.45rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-dark .switch-profile-btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.05);
}

.switch-profile-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.45rem 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logout-btn:hover {
  opacity: 0.9;
}

.main-content {
  min-height: calc(100vh - 60px);
}
</style>

