const express = require('express');
const router = express.Router();
const QrCode = require('../models/QrCode');
const shortid = require('shortid');

// Helper function to check if MongoDB is connected
function isMongoConnected() {
  return require('mongoose').connection.readyState === 1;
}

// In-memory storage for when MongoDB is not available
let inMemoryQrCodes = [];
let qrIdCounter = 1;

// @route   POST /api/qr
// @desc    Create a new QR code
router.post('/', async (req, res) => {
  const { name, originalUrl, fgColor, bgColor } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ msg: 'Please provide an original URL' });
  }

  try {
    if (isMongoConnected()) {
      // Use MongoDB
      const qrCode = new QrCode({
        name: name || 'Untitled',
        originalUrl,
        fgColor: fgColor || '#000000',
        bgColor: bgColor || '#ffffff',
      });

      await qrCode.save();
      res.json(qrCode);
    } else {
      // Use in-memory storage
      const shortId = shortid.generate();
      const qrCode = {
        _id: `temp_${qrIdCounter++}`,
        name: name || 'Untitled',
        originalUrl,
        shortUrl: `http://localhost:3001/${shortId}`,
        clicks: 0,
        fgColor: fgColor || '#000000',
        bgColor: bgColor || '#ffffff',
        createdAt: new Date()
      };
      
      inMemoryQrCodes.unshift(qrCode);
      res.json(qrCode);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/qr
// @desc    Get all QR codes
router.get('/', async (req, res) => {
    try {
        if (isMongoConnected()) {
            const qrCodes = await QrCode.find().sort({ createdAt: -1 });
            res.json(qrCodes);
        } else {
            // Return in-memory QR codes
            res.json(inMemoryQrCodes);
        }
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
        if (isMongoConnected()) {
            const createdCodes = await QrCode.insertMany(codes.map(code => ({
                name: code.name || 'Untitled',
                originalUrl: code.originalUrl,
                fgColor: code.fgColor || '#000000',
                bgColor: code.bgColor || '#ffffff'
            })));
            
            res.status(201).json(createdCodes);
        } else {
            // Use in-memory storage
            const createdCodes = codes.map(code => {
                const shortId = shortid.generate();
                return {
                    _id: `temp_${qrIdCounter++}`,
                    name: code.name || 'Untitled',
                    originalUrl: code.originalUrl,
                    shortUrl: `http://localhost:3001/${shortId}`,
                    clicks: 0,
                    fgColor: code.fgColor || '#000000',
                    bgColor: code.bgColor || '#ffffff',
                    createdAt: new Date()
                };
            });
            
            inMemoryQrCodes.unshift(...createdCodes);
            res.status(201).json(createdCodes);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/qr/:id
// @desc    Delete a QR code
router.delete('/:id', async (req, res) => {
    try {
        if (isMongoConnected()) {
            const qrCode = await QrCode.findById(req.params.id);

            if (!qrCode) {
                return res.status(404).json({ msg: 'QR Code not found' });
            }

            await qrCode.deleteOne();
            res.json({ msg: 'QR Code removed' });
        } else {
            // Use in-memory storage
            const index = inMemoryQrCodes.findIndex(qr => qr._id === req.params.id);
            if (index === -1) {
                return res.status(404).json({ msg: 'QR Code not found' });
            }
            
            inMemoryQrCodes.splice(index, 1);
            res.json({ msg: 'QR Code removed' });
        }
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
        if (isMongoConnected()) {
            let qrCode = await QrCode.findById(req.params.id);
            if (!qrCode) {
                return res.status(404).json({ msg: 'QR Code not found' });
            }

            qrCode.name = name || qrCode.name;
            qrCode.originalUrl = originalUrl || qrCode.originalUrl;
            qrCode.fgColor = fgColor || qrCode.fgColor;
            qrCode.bgColor = bgColor || qrCode.bgColor;

            await qrCode.save();
            res.json(qrCode);
        } else {
            // Use in-memory storage
            const qrCode = inMemoryQrCodes.find(qr => qr._id === req.params.id);
            if (!qrCode) {
                return res.status(404).json({ msg: 'QR Code not found' });
            }

            qrCode.name = name || qrCode.name;
            qrCode.originalUrl = originalUrl || qrCode.originalUrl;
            qrCode.fgColor = fgColor || qrCode.fgColor;
            qrCode.bgColor = bgColor || qrCode.bgColor;

            res.json(qrCode);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
