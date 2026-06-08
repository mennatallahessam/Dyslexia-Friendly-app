import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
app.use(createPinia());
app.use(router);
// Load auth token from localStorage before mounting
const auth = useAuthStore();
auth.loadFromStorage();
app.mount('#app');
