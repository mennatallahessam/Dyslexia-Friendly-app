import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'default', // default, cream, sky, dark
    useDyslexicFont: false,
    showRuler: false,
    rulerY: 0,
    fontSize: 18,
    letterSpacing: 0,
    wordSpacing: 0,
    isSpeaking: false,
  }),
  actions: {
    setTheme(theme: string) {
      this.theme = theme;
      document.body.className = `theme-${theme}`;
      if (this.useDyslexicFont) {
        document.body.classList.add('use-dyslexic-font');
      }
    },
    toggleFont() {
      this.useDyslexicFont = !this.useDyslexicFont;
      if (this.useDyslexicFont) {
        document.body.classList.add('use-dyslexic-font');
      } else {
        document.body.classList.remove('use-dyslexic-font');
      }
    },
    toggleRuler() {
      this.showRuler = !this.showRuler;
    },
    updateRulerPosition(y: number) {
      this.rulerY = y;
    },
    adjustFontSize(delta: number) {
      this.fontSize = Math.max(12, Math.min(32, this.fontSize + delta));
      document.documentElement.style.setProperty('--font-size', `${this.fontSize}px`);
    },
    adjustSpacing(type: 'letter' | 'word', delta: number) {
      if (type === 'letter') {
        this.letterSpacing = Math.max(0, Math.min(10, this.letterSpacing + delta));
        document.body.style.setProperty('--letter-spacing', `${this.letterSpacing}px`);
      } else {
        this.wordSpacing = Math.max(0, Math.min(20, this.wordSpacing + delta));
        document.body.style.setProperty('--word-spacing', `${this.wordSpacing}px`);
      }
    },
    speak(text: string) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => { this.isSpeaking = true; };
        utterance.onend = () => { this.isSpeaking = false; };
        window.speechSynthesis.speak(utterance);
      }
    },
    stopSpeaking() {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
});
