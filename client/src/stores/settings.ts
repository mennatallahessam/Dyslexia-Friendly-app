import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'default', // default, cream, sky, dark
    fontFamily: 'outfit', // outfit, opendyslexic, comic
    useDyslexicFont: false, // kept for backward compatibility if needed, but we use fontFamily
    showRuler: false,
    useFocusMask: false,
    rulerY: 0,
    rulerColor: '#6366f1',
    rulerHeight: 40,
    rulerOpacity: 0.15,
    fontSize: 18,
    lineHeight: 1.6,
    letterSpacing: 0,
    wordSpacing: 0,
    bionicReading: false,
    activeTab: 'reader', // reader, phonics, pdf
    isSpeaking: false,
    inspectedWord: '',
    showInspector: false,
    pdfText: '',
    highlightedWords: {} as Record<string, string>
  }),
  actions: {
    setTheme(theme: string) {
      this.theme = theme;
      document.body.className = `theme-${theme}`;
      this.applyFontFamily(this.fontFamily);
    },
    setFontFamily(font: 'outfit' | 'opendyslexic' | 'comic') {
      this.fontFamily = font;
      this.useDyslexicFont = font === 'opendyslexic';
      this.applyFontFamily(font);
    },
    applyFontFamily(font: string) {
      document.body.classList.remove('font-outfit', 'font-opendyslexic', 'font-comic');
      document.body.classList.add(`font-${font}`);
    },
    toggleFont() {
      // Toggle function for backward compat
      const nextFont = this.fontFamily === 'opendyslexic' ? 'outfit' : 'opendyslexic';
      this.setFontFamily(nextFont);
    },
    toggleRuler() {
      this.showRuler = !this.showRuler;
    },
    toggleFocusMask() {
      this.useFocusMask = !this.useFocusMask;
    },
    updateRulerPosition(y: number) {
      this.rulerY = y;
    },
    setRulerColor(color: string) {
      this.rulerColor = color;
      document.documentElement.style.setProperty('--ruler-color-raw', color);
    },
    adjustRulerHeight(delta: number) {
      this.rulerHeight = Math.max(20, Math.min(150, this.rulerHeight + delta));
      document.documentElement.style.setProperty('--ruler-height', `${this.rulerHeight}px`);
    },
    adjustRulerOpacity(delta: number) {
      this.rulerOpacity = Math.max(0.05, Math.min(0.9, parseFloat((this.rulerOpacity + delta).toFixed(2))));
    },
    adjustFontSize(delta: number) {
      this.fontSize = Math.max(12, Math.min(32, this.fontSize + delta));
      document.documentElement.style.setProperty('--font-size', `${this.fontSize}px`);
    },
    adjustLineHeight(delta: number) {
      this.lineHeight = Math.max(1.2, Math.min(2.8, parseFloat((this.lineHeight + delta).toFixed(1))));
      document.documentElement.style.setProperty('--line-height', `${this.lineHeight}`);
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
    toggleBionicReading() {
      this.bionicReading = !this.bionicReading;
    },
    setActiveTab(tab: 'reader' | 'phonics' | 'pdf') {
      this.activeTab = tab;
    },
    openWordInspector(word: string) {
      // Clean word from trailing punctuation
      const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").trim();
      if (cleanWord) {
        this.inspectedWord = cleanWord;
        this.showInspector = true;
      }
    },
    closeWordInspector() {
      this.showInspector = false;
      this.inspectedWord = '';
    },
    setPdfText(text: string) {
      this.pdfText = text;
    },
    highlightWord(word: string, color: string) {
      const cleanWord = word.toLowerCase().trim();
      if (!cleanWord) return;
      
      const newHighlights = { ...this.highlightedWords };
      if (color === 'clear') {
        delete newHighlights[cleanWord];
      } else {
        newHighlights[cleanWord] = color;
      }
      this.highlightedWords = newHighlights;
    },
    speak(text: string) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => { this.isSpeaking = true; };
        utterance.onend = () => { this.isSpeaking = false; };
        utterance.onerror = () => { this.isSpeaking = false; };
        window.speechSynthesis.speak(utterance);
      }
    },
    stopSpeaking() {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
});
