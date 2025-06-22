const path = require('path');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const mongoose = require('mongoose');
const QrCode = require('./models/QrCode');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = 3001;

// Database Connection - with improved error handling
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wiqr';

let isMongoConnected = false;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected successfully.');
    isMongoConnected = true;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('⚠️  MongoDB is not running. QR code features will use in-memory storage.');
    isMongoConnected = false;
  });

// In-memory storage for QR codes when MongoDB is not available
let inMemoryQrCodes = [];
let qrIdCounter = 1;

// Middleware
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
const upload = multer({ storage: multer.memoryStorage() }); // Store files in memory

// Routes
app.get('/', (req, res) => {
  res.send('Hello from the WiQr backend!');
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
    
    if (isMongoConnected) {
      // Look for QR code where shortUrl ends with this shortId
      qrCode = await QrCode.findOne({ 
        shortUrl: { $regex: `/${shortId}$` }
      });
      if (qrCode) {
        qrCode.clicks++;
        await qrCode.save();
      }
    } else {
      // Check in-memory storage - look for shortUrl ending with this shortId
      qrCode = inMemoryQrCodes.find(qr => 
        qr.shortUrl.endsWith(`/${shortId}`)
      );
      if (qrCode) {
        qrCode.clicks++;
      }
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
});
