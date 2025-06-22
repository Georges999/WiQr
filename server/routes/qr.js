const express = require('express');
const router = express.Router();
const shortid = require('shortid');

// Import the in-memory storage from the main app
// We'll access this through the app instance
let inMemoryQrCodes = [];
let qrIdCounter = 1;

// Helper function to get the storage from the main app
function getStorage() {
  // Access the storage from the main app instance
  return {
    qrCodes: global.inMemoryQrCodes || inMemoryQrCodes,
    counter: global.qrIdCounter || qrIdCounter
  };
}

function updateStorage(qrCodes, counter) {
  global.inMemoryQrCodes = qrCodes;
  global.qrIdCounter = counter;
  inMemoryQrCodes = qrCodes;
  qrIdCounter = counter;
}

// @route   POST /api/qr
// @desc    Create a new QR code
router.post('/', async (req, res) => {
  const { name, originalUrl, fgColor, bgColor } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ msg: 'Please provide an original URL' });
  }

  try {
    const storage = getStorage();
    const shortId = shortid.generate();
    const qrCode = {
      _id: `qr_${storage.counter}`,
      name: name || 'Untitled',
      originalUrl,
      shortUrl: `${req.protocol}://${req.get('host')}/${shortId}`,
      clicks: 0,
      fgColor: fgColor || '#000000',
      bgColor: bgColor || '#ffffff',
      createdAt: new Date()
    };
    
    storage.qrCodes.unshift(qrCode);
    updateStorage(storage.qrCodes, storage.counter + 1);
    
    res.json(qrCode);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/qr
// @desc    Get all QR codes
router.get('/', async (req, res) => {
    try {
        const storage = getStorage();
        res.json(storage.qrCodes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/qr/bulk
// @desc    Create multiple QR codes at once
router.post('/bulk', async (req, res) => {
    const { codes } = req.body; // Expect an array of objects: [{ name, originalUrl }]

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
        return res.status(400).json({ msg: 'Please provide an array of codes to generate.' });
    }

    try {
        const storage = getStorage();
        const createdCodes = codes.map(code => {
            const shortId = shortid.generate();
            return {
                _id: `qr_${storage.counter++}`,
                name: code.name || 'Untitled',
                originalUrl: code.originalUrl,
                shortUrl: `${req.protocol}://${req.get('host')}/${shortId}`,
                clicks: 0,
                fgColor: code.fgColor || '#000000',
                bgColor: code.bgColor || '#ffffff',
                createdAt: new Date()
            };
        });
        
        storage.qrCodes.unshift(...createdCodes);
        updateStorage(storage.qrCodes, storage.counter);
        
        res.status(201).json(createdCodes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/qr/:id
// @desc    Delete a QR code
router.delete('/:id', async (req, res) => {
    try {
        const storage = getStorage();
        const index = storage.qrCodes.findIndex(qr => qr._id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ msg: 'QR Code not found' });
        }
        
        storage.qrCodes.splice(index, 1);
        updateStorage(storage.qrCodes, storage.counter);
        
        res.json({ msg: 'QR Code removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/qr/:id
// @desc    Update a QR code
router.put('/:id', async (req, res) => {
    const { name, originalUrl, fgColor, bgColor } = req.body;

    try {
        const storage = getStorage();
        const qrCode = storage.qrCodes.find(qr => qr._id === req.params.id);
        
        if (!qrCode) {
            return res.status(404).json({ msg: 'QR Code not found' });
        }

        qrCode.name = name || qrCode.name;
        qrCode.originalUrl = originalUrl || qrCode.originalUrl;
        qrCode.fgColor = fgColor || qrCode.fgColor;
        qrCode.bgColor = bgColor || qrCode.bgColor;

        updateStorage(storage.qrCodes, storage.counter);
        res.json(qrCode);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
