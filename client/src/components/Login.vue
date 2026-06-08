<template>
  <div class="login-page">
    <div class="login-card">
      <h2>Welcome</h2>
      <p>Sign in to continue</p>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required />
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required />
        </div>
        <button type="submit" class="login-btn">Sign In</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const auth = useAuthStore();
const router = useRouter();

function handleLogin() {
  try {
    auth.login(email.value, password.value);
    router.replace('/'); // go to home (disability selection or main app)
  } catch (e) {
    alert((e as Error).message);
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--accent-gradient);
}
.login-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: var(--shadow-elevation-medium);
  max-width: 400px;
  width: 100%;
  text-align: center;
}
.input-group {
  margin: 1rem 0;
  text-align: left;
}
.input-group label {
  display: block;
  margin-bottom: 0.3rem;
  color: var(--text);
}
.input-group input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
}
.login-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}
.login-btn:hover {
  background: var(--primary-color-dark);
}
</style>
