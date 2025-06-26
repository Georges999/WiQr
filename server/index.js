const path = require('path');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const fs = require('fs');
const archiver = require('archiver');
const unzipper = require('unzipper');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const { Parser } = require('json2csv');
const pdf = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
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

// File conversion utilities
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

const getMimeType = (extension) => {
  const mimeTypes = {
    // Images
    'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif',
    'webp': 'image/webp', 'bmp': 'image/bmp', 'tiff': 'image/tiff', 'svg': 'image/svg+xml',
    // Documents
    'pdf': 'application/pdf', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc': 'application/msword', 'txt': 'text/plain', 'html': 'text/html',
    // Spreadsheets
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel', 'csv': 'text/csv',
    // Archives
    'zip': 'application/zip', 'json': 'application/json'
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

// Get supported conversions for a file type
const getSupportedConversions = (inputExtension) => {
  const conversions = {
    // Image conversions
    'jpg': ['png', 'webp', 'gif', 'bmp', 'tiff', 'pdf'],
    'jpeg': ['png', 'webp', 'gif', 'bmp', 'tiff', 'pdf'],
    'png': ['jpg', 'webp', 'gif', 'bmp', 'tiff', 'pdf'],
    'gif': ['jpg', 'png', 'webp', 'bmp', 'tiff', 'pdf'],
    'webp': ['jpg', 'png', 'gif', 'bmp', 'tiff', 'pdf'],
    'bmp': ['jpg', 'png', 'webp', 'gif', 'tiff', 'pdf'],
    'tiff': ['jpg', 'png', 'webp', 'gif', 'bmp', 'pdf'],
    
    // Document conversions
    'docx': ['txt', 'html', 'pdf'],
    'doc': ['txt', 'html', 'pdf'],
    'txt': ['html', 'pdf', 'docx'],
    'html': ['txt', 'pdf'],
    'pdf': ['txt', 'docx', 'html'], // PDF to text, Word, and HTML
    
    // Spreadsheet conversions
    'xlsx': ['csv', 'json', 'html', 'pdf'],
    'xls': ['csv', 'json', 'html', 'pdf', 'xlsx'],
    'csv': ['json', 'xlsx', 'html'],
    'json': ['csv', 'xlsx', 'html'],
    
    // Archive conversions
    'zip': ['json'] // Extract file list
  };
  
  return conversions[inputExtension] || [];
};

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

// Get supported conversions for uploaded file
app.post('/convert/analyze', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const inputExtension = getFileExtension(req.file.originalname);
  const supportedFormats = getSupportedConversions(inputExtension);
  
  res.json({
    filename: req.file.originalname,
    size: req.file.size,
    inputFormat: inputExtension,
    supportedConversions: supportedFormats.map(format => ({
      extension: format,
      name: format.toUpperCase(),
      mimeType: getMimeType(format)
    }))
  });
});

// Convert file
app.post('/convert', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const inputExtension = getFileExtension(req.file.originalname);
  const outputFormat = req.body.format;
  const originalName = req.file.originalname.split('.').slice(0, -1).join('.');
  const newFileName = `${originalName}.${outputFormat}`;

  try {
    let convertedBuffer;
    let contentType = getMimeType(outputFormat);

    // Image conversions
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(inputExtension)) {
      if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'].includes(outputFormat)) {
        convertedBuffer = await sharp(req.file.buffer)
          .toFormat(outputFormat === 'jpg' ? 'jpeg' : outputFormat)
          .toBuffer();
      } else if (outputFormat === 'pdf') {
        // Convert image to PDF (create a simple PDF with the image)
        const imageBuffer = await sharp(req.file.buffer)
          .png()
          .toBuffer();
        // For now, just return the image - in production you'd use a PDF library
        convertedBuffer = imageBuffer;
        contentType = 'image/png';
      }
    }
    
    // Document conversions
    else if (['docx', 'doc'].includes(inputExtension)) {
      if (outputFormat === 'txt') {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        convertedBuffer = Buffer.from(result.value, 'utf8');
      } else if (outputFormat === 'html') {
        const result = await mammoth.convertToHtml({ buffer: req.file.buffer });
        convertedBuffer = Buffer.from(result.value, 'utf8');
      }
    }
    
    // Spreadsheet conversions
    else if (['xlsx', 'xls'].includes(inputExtension)) {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      if (outputFormat === 'csv') {
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        convertedBuffer = Buffer.from(csv, 'utf8');
      } else if (outputFormat === 'json') {
        const json = XLSX.utils.sheet_to_json(worksheet);
        convertedBuffer = Buffer.from(JSON.stringify(json, null, 2), 'utf8');
      } else if (outputFormat === 'html') {
        const html = XLSX.utils.sheet_to_html(worksheet);
        convertedBuffer = Buffer.from(html, 'utf8');
      }
    }
    
    // CSV conversions
    else if (inputExtension === 'csv') {
      const csvData = req.file.buffer.toString('utf8');
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      const rows = lines.slice(1).filter(line => line.trim());
      
      if (outputFormat === 'json') {
        const jsonData = rows.map(row => {
          const values = row.split(',');
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
          });
          return obj;
        });
        convertedBuffer = Buffer.from(JSON.stringify(jsonData, null, 2), 'utf8');
      } else if (outputFormat === 'xlsx') {
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows.map(row => row.split(','))]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        convertedBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      }
    }
    
    // JSON conversions
    else if (inputExtension === 'json') {
      const jsonData = JSON.parse(req.file.buffer.toString('utf8'));
      
      if (outputFormat === 'csv') {
        const parser = new Parser();
        const csv = parser.parse(jsonData);
        convertedBuffer = Buffer.from(csv, 'utf8');
      } else if (outputFormat === 'xlsx') {
        const worksheet = XLSX.utils.json_to_sheet(jsonData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        convertedBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      }
    }
    
    // PDF conversions
    else if (inputExtension === 'pdf') {
      console.log(`Converting PDF to ${outputFormat}`);
      const pdfData = await pdf(req.file.buffer);
      console.log(`PDF extracted text length: ${pdfData.text.length}`);
      
      if (outputFormat === 'txt') {
        convertedBuffer = Buffer.from(pdfData.text, 'utf8');
      } else if (outputFormat === 'html') {
        // Convert to HTML with basic formatting
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Converted from PDF</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        .pdf-content { white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>PDF Content</h1>
    <div class="pdf-content">${pdfData.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
</body>
</html>`;
        convertedBuffer = Buffer.from(htmlContent, 'utf8');
      } else if (outputFormat === 'docx') {
        console.log('Starting PDF to DOCX conversion');
        
        try {
          // Create DOCX document using the reliable 'docx' library
          const doc = new Document({
            sections: [{
              properties: {},
              children: [
                // Title
                new Paragraph({
                  text: "Converted from PDF",
                  heading: HeadingLevel.HEADING_1,
                }),
                // Content paragraphs
                ...pdfData.text.split('\n').map(line => 
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: line.trim() || ' ',
                        font: "Arial",
                        size: 24, // 12pt in half-points
                      })
                    ]
                  })
                )
              ]
            }]
          });
          
          console.log('Generating DOCX buffer...');
          convertedBuffer = await Packer.toBuffer(doc);
          console.log(`DOCX buffer created, size: ${convertedBuffer.length} bytes`);
          
        } catch (docxError) {
          console.error('DOCX conversion failed:', docxError);
          throw new Error(`Failed to convert PDF to DOCX: ${docxError.message}`);
        }
      }
    }

    if (!convertedBuffer) {
      return res.status(400).json({ 
        error: `Conversion from ${inputExtension} to ${outputFormat} is not supported.` 
      });
    }

    res.set({ 
      'Content-Disposition': `attachment; filename="${newFileName}"`,
      'Content-Type': contentType
    });
    res.send(convertedBuffer);

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Error during file conversion: ' + error.message });
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
  console.log(`🔄 File Converter: Ready with multi-format support`);
});
