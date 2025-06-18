const express = require('express');
const router = express.Router();
const QrCode = require('../models/QrCode');

// @route   POST /api/qr
// @desc    Create a new QR code
router.post('/', async (req, res) => {
  const { name, originalUrl, fgColor, bgColor } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ msg: 'Please provide an original URL' });
  }

  try {
    // For simplicity, we create a new one every time. 
    // A real-world app might check if the originalUrl already exists.
    const qrCode = new QrCode({
      name: name || 'Untitled',
      originalUrl,
      fgColor,
      bgColor,
    });

    await qrCode.save();
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
        const qrCodes = await QrCode.find().sort({ createdAt: -1 });
        res.json(qrCodes);
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
        const createdCodes = await QrCode.insertMany(codes.map(code => ({
            name: code.name || 'Untitled',
            originalUrl: code.originalUrl
        })));
        
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
        const qrCode = await QrCode.findById(req.params.id);

        if (!qrCode) {
            return res.status(404).json({ msg: 'QR Code not found' });
        }

        await qrCode.deleteOne();

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
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
