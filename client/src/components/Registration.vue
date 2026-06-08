<template>
  <div class="register-page">
    <div class="register-card">
      <h2>Create Account</h2>
      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required />
        </div>
        <div class="input-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required />
        </div>
        <div class="input-group">
          <label for="confirm">Confirm Password</label>
          <input id="confirm" v-model="confirmPassword" type="password" required />
        </div>
        <button type="submit" class="register-btn">Sign Up</button>
      </form>
      <p class="login-link">
        Already have an account?
        <router-link to="/login">Log In</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const auth = useAuthStore();
const router = useRouter();

function handleRegister() {
  try {
    if (password.value !== confirmPassword.value) {
      alert('Passwords do not match');
      return;
    }
    auth.register(email.value, password.value);
    // After successful registration, redirect to login page
    router.replace('/login');
  } catch (e) {
    alert((e as Error).message);
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--accent-gradient);
}
.register-card {
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
.register-btn {
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
.register-btn:hover {
  background: var(--primary-color-dark);
}
.login-link {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text);
}
</style>
