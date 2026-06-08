const fetch = require('node-fetch').default;
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'sample.pdf');
if (!fs.existsSync(filePath)) {
  console.error('sample.pdf not found');
  process.exit(1);
}

const form = new FormData();
form.append('file', fs.createReadStream(filePath));

fetch('http://localhost:3000/api/extract-pdf', {
  method: 'POST',
  body: form,
  headers: form.getHeaders(),
})
  .then(res => res.json())
  .then(json => {
    console.log('Response:', JSON.stringify(json, null, 2));
  })
  .catch(err => {
    console.error('Error:', err);
  });
