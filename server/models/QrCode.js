const mongoose = require('mongoose');
const shortid = require('shortid');

const qrCodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    default: function() {
      return `http://localhost:3001/${shortid.generate()}`;
    }
  },
  clicks: {
    type: Number,
    required: true,
    default: 0
  },
  fgColor: {
    type: String,
    default: '#000000'
  },
  bgColor: {
    type: String,
    default: '#ffffff'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QrCode', qrCodeSchema);
