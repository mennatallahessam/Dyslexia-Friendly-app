const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const pdfParse = require('pdf-parse').default;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Configure multer (in-memory storage)
const storage = multer.memoryStorage();
// Limit file size to 10MB to avoid memory issues
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// PDF Text Extraction Route
app.post('/api/extract-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
    }

    const data = await pdfParse(req.file.buffer);
    res.json({
        text: data.text,
        pages: data.numpages,
        info: data.info
      });
    } catch (error) {
      // Log detailed error for debugging
      console.error('PDF parsing error details:', error);
      // Return a more informative message to the client
      const message = error.message || 'Failed to extract text from PDF file.';
      res.status(500).send({ error: message });
  }
});

// Mock data for dyslexia-friendly reading
const accessibleArticles = [
  {
    id: 1,
    title: "Understanding Dyslexia",
    content: "Dyslexia is a learning disorder that involves difficulty reading due to problems identifying speech sounds and learning how they relate to letters and words. Also called reading disability, dyslexia affects areas of the brain that process language. People with dyslexia have normal intelligence and usually have normal vision.",
    category: "Education"
  },
  {
    id: 2,
    title: "Strategies for Reading",
    content: "Using a reading ruler can help keep your place on the page. Breaking words down into smaller sounds is also a key technique. Many people find that specific fonts, like OpenDyslexic, make it easier to distinguish between similar-looking letters like 'b' and 'd'.",
    category: "Tips"
  },
  {
    id: 3,
    title: "The Power of Text-to-Speech",
    content: "Listening to text while reading it can significantly improve comprehension for many dyslexic individuals. This multi-sensory approach engages both the auditory and visual systems of the brain simultaneously.",
    category: "Technology"
  }
];

// API Routes
app.get('/api/articles', (req, res) => {
  res.json(accessibleArticles);
});

app.get('/api/articles/:id', (req, res) => {
  const article = accessibleArticles.find(a => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).send('Article not found');
  res.json(article);
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
