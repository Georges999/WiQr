const path = require('path');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
// Remove MongoDB dependencies for simpler deployment
// const mongoose = require('mongoose');
// const QrCode = require('./models/QrCode');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3001;

// In-memory storage for QR codes - primary storage method
let inMemoryQrCodes = [];
let qrIdCounter = 1;

// Make storage globally accessible for routes
global.inMemoryQrCodes = inMemoryQrCodes;
global.qrIdCounter = qrIdCounter;

// Optional: Add basic persistence with JSON file backup
const fs = require('fs');
const dataFile = path.join(__dirname, 'qr-data.json');

// Load existing data on startup (if file exists)
try {
  if (fs.existsSync(dataFile)) {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    inMemoryQrCodes = data.qrCodes || [];
    qrIdCounter = data.counter || 1;
    // Update global references
    global.inMemoryQrCodes = inMemoryQrCodes;
    global.qrIdCounter = qrIdCounter;
    console.log(`📚 Loaded ${inMemoryQrCodes.length} QR codes from backup`);
  }
} catch (error) {
  console.log('📝 Starting with fresh data storage');
}

// Save data periodically (every 5 minutes) and on exit
const saveData = () => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify({
      qrCodes: global.inMemoryQrCodes,
      counter: global.qrIdCounter,
      lastSaved: new Date().toISOString()
    }, null, 2));
    console.log('💾 Data saved to backup file');
  } catch (error) {
    console.error('❌ Error saving data:', error.message);
  }
};

// Auto-save every 5 minutes
setInterval(saveData, 5 * 60 * 1000);

// Save on process exit
process.on('SIGINT', () => {
  console.log('\n🔄 Saving data before exit...');
  saveData();
  process.exit(0);
});

process.on('SIGTERM', () => {
  saveData();
  process.exit(0);
});

console.log('🚀 WiQr Server starting with in-memory storage...');
console.log('📊 Current QR codes in memory:', inMemoryQrCodes.length);

// Middleware
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'WiQr Backend API',
    status: 'running',
    storage: 'in-memory',
    qrCodes: inMemoryQrCodes.length,
    uptime: process.uptime()
  });
});

app.post('/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const format = req.body.format || 'jpeg'; // Default to jpeg if no format is specified
  const originalName = req.file.originalname.split('.').slice(0, -1).join('.');
  const newFileName = `${originalName}.${format}`;

  try {
    const convertedFile = await sharp(req.file.buffer)
      .toFormat(format)
      .toBuffer();

    res.set({ 
      'Content-Disposition': `attachment; filename="${newFileName}"`,
      'Content-Type': `image/${format}`
    });
    res.send(convertedFile);
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).send('Error during file conversion.');
  }
});

// Define Routes
app.use('/api/qr', require('./routes/qr'));

// Redirect Route
app.get('/:shortId', async (req, res) => {
  try {
    let qrCode = null;
    const shortId = req.params.shortId; // This is just the short ID part
    
    // Check in-memory storage - look for shortUrl ending with this shortId
    qrCode = global.inMemoryQrCodes.find(qr => 
      qr.shortUrl.endsWith(`/${shortId}`)
    );
    if (qrCode) {
      qrCode.clicks++;
    }

    if (qrCode) {
      // Ensure the URL has a protocol
      let redirectUrl = qrCode.originalUrl;
      if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
        redirectUrl = 'https://' + redirectUrl;
      }
      console.log(`Redirecting ${shortId} to ${redirectUrl}`);
      return res.redirect(redirectUrl);
    } else {
      console.log(`Short URL not found: ${shortId}`);
      return res.status(404).json({ error: 'Short URL not found' });
    }
  } catch (err) {
    console.error('Redirect error:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.listen(port, () => {
  console.log(`🚀 WiQr Server listening at http://localhost:${port}`);
  console.log(`📊 Storage: In-Memory with JSON backup`);
  console.log(`📈 QR Codes loaded: ${global.inMemoryQrCodes.length}`);
});
