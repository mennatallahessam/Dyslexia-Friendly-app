const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

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
