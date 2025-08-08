const express = require('express');
const QRCode = require('qrcode');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const messages = {};

// Splash screen
app.get('/', (req, res) => {
  res.render('splash');
});

// Input form
app.get('/create', (req, res) => {
  res.render('input');
});

// Handle form and generate QR
app.post('/generate', async (req, res) => {
  const { to, from, message } = req.body;
  const id = Date.now().toString();

  // Save the message in memory
  messages[id] = { to, from, message };

  // Dynamically get the correct base URL
  const baseURL = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const qrLink = `${baseURL}/reveal?id=${id}`;

  // Generate QR Code
  const qrImage = await QRCode.toDataURL(qrLink);

  // Render the QR view
  res.render('qr', { qrImage });
});

// Reveal page - ask for names
app.get('/reveal', (req, res) => {
  const { id } = req.query;
  res.render('reveal', { id, error: null });
});

// Validate and show message
app.post('/reveal', (req, res) => {
  const { id, to, from } = req.body;
  const data = messages[id];

  if (data && data.to === to && data.from === from) {
    res.render('result', { message: data.message });
  } else {
    res.render('reveal', { id, error: 'This message is not for you 😢' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
