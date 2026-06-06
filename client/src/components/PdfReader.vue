<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import { useSettingsStore } from '../stores/settings';
import { Upload, FileText, Volume2, Square, RefreshCw, AlertCircle } from 'lucide-vue-next';

const store = useSettingsStore();

const isDragging = ref(false);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadError = ref('');

// Parse words in the PDF
interface TextToken {
  text: string;
  raw: string;
  isWord: boolean;
}

const parsedWords = computed<TextToken[]>(() => {
  const text = store.pdfText;
  if (!text) return [];
  
  // Split on boundaries: words, punctuation, spaces
  const tokens = text.split(/([a-zA-Z0-9']+|[^a-zA-Z0-9'\s]+|\s+)/);
  return tokens.filter(t => t).map(t => {
    const isWord = /^[a-zA-Z0-9']+$/.test(t);
    return {
      text: t,
      raw: t,
      isWord
    };
  });
});

// Format words for Bionic Reading
const bionicFormat = (word: string) => {
  if (word.length <= 3) {
    return `<strong class="bionic-prefix">${word.substring(0, 1)}</strong>${word.substring(1)}`;
  } else if (word.length <= 6) {
    return `<strong class="bionic-prefix">${word.substring(0, 2)}</strong>${word.substring(2)}`;
  } else if (word.length <= 9) {
    return `<strong class="bionic-prefix">${word.substring(0, 3)}</strong>${word.substring(3)}`;
  } else {
    const mid = Math.ceil(word.length * 0.45);
    return `<strong class="bionic-prefix">${word.substring(0, mid)}</strong>${word.substring(mid)}`;
  }
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    uploadFile(files[0]);
  }
};

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (files && files.length > 0) {
    uploadFile(files[0]);
  }
};

const uploadFile = async (file: File) => {
  if (file.type !== 'application/pdf') {
    uploadError.value = 'Please select a valid PDF file.';
    return;
  }

  isUploading.value = true;
  uploadError.value = '';
  uploadProgress.value = 0;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('http://localhost:3000/api/extract-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      },
    });

    store.setPdfText(response.data.text);
  } catch (err: any) {
    console.error('Error uploading file:', err);
    uploadError.value = err.response?.data?.error || 'An error occurred while extracting PDF text.';
  } finally {
    isUploading.value = false;
  }
};

const toggleTts = () => {
  if (store.isSpeaking) {
    store.stopSpeaking();
  } else {
    store.speak(store.pdfText);
  }
};

const clearPdf = () => {
  store.stopSpeaking();
  store.setPdfText('');
  uploadError.value = '';
};
</script>

<template>
  <div class="pdf-reader-container fade-in" :class="`font-${store.fontFamily}`">
    <!-- PDF Upload View -->
    <div v-if="!store.pdfText" class="upload-view">
      <div 
        class="drag-drop-zone"
        :class="{ dragging: isDragging, uploading: isUploading }"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div v-if="!isUploading" class="upload-content">
          <Upload :size="48" class="upload-icon" />
          <h3>Upload PDF Document</h3>
          <p class="upload-sub">Drag & drop your PDF file here, or click to browse</p>
          <input 
            type="file" 
            accept=".pdf" 
            @change="handleFileSelect" 
            class="file-input"
            id="pdf-file-upload"
          />
          <label for="pdf-file-upload" class="browse-btn">Select PDF</label>
        </div>

        <div v-else class="upload-loading">
          <RefreshCw :size="48" class="spin-icon" />
          <h3>Extracting Text...</h3>
          <p>Please wait while we parse your PDF contents.</p>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
          </div>
          <span class="progress-text">{{ uploadProgress }}% uploaded</span>
        </div>
      </div>

      <div v-if="uploadError" class="error-banner">
        <AlertCircle :size="20" />
        <span>{{ uploadError }}</span>
      </div>
    </div>

    <!-- PDF Document View -->
    <div v-else class="document-view card">
      <header class="doc-header">
        <div class="header-left">
          <FileText :size="24" class="doc-icon" />
          <h3>PDF Document Reader</h3>
        </div>
        <div class="header-actions">
          <button @click="toggleTts" class="action-btn tts-btn" :class="{ speaking: store.isSpeaking }">
            <Volume2 v-if="!store.isSpeaking" :size="20" />
            <Square v-else :size="20" />
            {{ store.isSpeaking ? 'Stop Reading' : 'Read Aloud' }}
          </button>
          <button @click="clearPdf" class="action-btn clear-btn">
            Clear Document
          </button>
        </div>
      </header>

      <!-- Extracted PDF text display -->
      <div class="doc-body content">
        <template v-for="(token, index) in parsedWords" :key="index">
          <span 
            v-if="token.isWord" 
            class="word-interactive" 
            @click="store.openWordInspector(token.raw)"
            :style="{ backgroundColor: store.highlightedWords[token.text.toLowerCase()] }"
          >
            <span v-if="store.bionicReading" v-html="bionicFormat(token.text)"></span>
            <span v-else>{{ token.text }}</span>
          </span>
          <template v-else>
            {{ token.text }}
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pdf-reader-container {
  margin-top: 1rem;
}

.drag-drop-zone {
  border: 3px dashed rgba(99, 102, 241, 0.25);
  background: var(--card-bg);
  border-radius: 24px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.drag-drop-zone:hover, .drag-drop-zone.dragging {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.03);
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.05);
}

.drag-drop-zone.uploading {
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.05);
  cursor: wait;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.upload-icon {
  color: var(--primary-color);
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.upload-sub {
  font-size: 0.95rem;
  opacity: 0.6;
  margin-bottom: 0.75rem;
}

.file-input {
  display: none;
}

.browse-btn {
  background: var(--primary-color);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.browse-btn:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 320px;
}

.spin-icon {
  color: var(--primary-color);
  animation: spin 1.5s linear infinite;
  margin-bottom: 0.5rem;
}

.progress-bar-container {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.2s ease;
}

.progress-text {
  font-size: 0.8rem;
  opacity: 0.6;
  font-weight: 700;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  padding: 1rem 1.5rem;
  border-radius: 16px;
  color: #b91c1c;
  font-weight: 700;
  margin-top: 1.5rem;
  animation: slide-down 0.2s ease;
}

/* Document View styles */
.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-left h3 {
  margin: 0;
  font-size: 1.5rem;
}

.doc-icon {
  color: var(--primary-color);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.tts-btn {
  border: 2px solid var(--primary-color);
  background: transparent;
  color: var(--primary-color);
}

.tts-btn:hover {
  background: var(--primary-color);
  color: white;
}

.tts-btn.speaking {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.clear-btn {
  background: rgba(0, 0, 0, 0.04);
  color: var(--text-color);
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.doc-body {
  font-size: inherit; /* inherit from settings store */
  line-height: inherit; /* inherit from settings store */
  white-space: pre-wrap; /* keep PDF formatting/newlines */
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Custom Scrollbar for PDF Document Reader */
.doc-body::-webkit-scrollbar {
  width: 6px;
}
.doc-body::-webkit-scrollbar-track {
  background: transparent;
}
.doc-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
.theme-dark .doc-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slide-down {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
