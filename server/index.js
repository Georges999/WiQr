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

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
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

app.use(express.json()); // Middleware to parse JSON bodies

// Define Routes
app.use('/api/qr', require('./routes/qr'));

// Redirect Route
app.get('/:shortUrl', async (req, res) => {
  try {
    const qrCode = await QrCode.findOne({ shortUrl: req.params.shortUrl });

    if (qrCode) {
      qrCode.clicks++;
      await qrCode.save();
      return res.redirect(qrCode.originalUrl);
    } else {
      // If not a short URL, maybe it's a client-side route? 
      // In a full SPA, you'd serve the index.html here.
      return res.status(404).json('Not Found');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
