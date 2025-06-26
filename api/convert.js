const multer = require('multer');
const sharp = require('sharp');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const { Parser } = require('json2csv');
const pdf = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// File conversion utilities
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

const getMimeType = (extension) => {
  const mimeTypes = {
    'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif',
    'webp': 'image/webp', 'bmp': 'image/bmp', 'tiff': 'image/tiff',
    'pdf': 'application/pdf', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain', 'html': 'text/html',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'csv': 'text/csv', 'json': 'application/json'
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

const getSupportedConversions = (inputExtension) => {
  const conversions = {
    'jpg': ['png', 'webp', 'gif', 'bmp', 'tiff'],
    'jpeg': ['png', 'webp', 'gif', 'bmp', 'tiff'],
    'png': ['jpg', 'webp', 'gif', 'bmp', 'tiff'],
    'gif': ['jpg', 'png', 'webp', 'bmp', 'tiff'],
    'webp': ['jpg', 'png', 'gif', 'bmp', 'tiff'],
    'bmp': ['jpg', 'png', 'webp', 'gif', 'tiff'],
    'tiff': ['jpg', 'png', 'webp', 'gif', 'bmp'],
    'docx': ['txt', 'html'],
    'doc': ['txt', 'html'],
    'txt': ['html', 'docx'],
    'html': ['txt'],
    'pdf': ['txt', 'docx', 'html'],
    'xlsx': ['csv', 'json', 'html'],
    'xls': ['csv', 'json', 'html', 'xlsx'],
    'csv': ['json', 'xlsx', 'html'],
    'json': ['csv', 'xlsx', 'html']
  };
  return conversions[inputExtension] || [];
};

// Middleware wrapper for multer
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle file upload
    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { action } = req.query;

    if (action === 'analyze') {
      const inputExtension = getFileExtension(req.file.originalname);
      const supportedFormats = getSupportedConversions(inputExtension);
      
      return res.json({
        filename: req.file.originalname,
        size: req.file.size,
        inputFormat: inputExtension,
        supportedConversions: supportedFormats.map(format => ({
          extension: format,
          name: format.toUpperCase(),
          mimeType: getMimeType(format)
        }))
      });
    }

    // File conversion
    const inputExtension = getFileExtension(req.file.originalname);
    const outputFormat = req.body.format;
    const originalName = req.file.originalname.split('.').slice(0, -1).join('.');
    const newFileName = `${originalName}.${outputFormat}`;

    let convertedBuffer;
    let contentType = getMimeType(outputFormat);

    // Image conversions using Sharp
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(inputExtension)) {
      if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'].includes(outputFormat)) {
        convertedBuffer = await sharp(req.file.buffer)
          .toFormat(outputFormat === 'jpg' ? 'jpeg' : outputFormat)
          .toBuffer();
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
      const pdfData = await pdf(req.file.buffer);
      
      if (outputFormat === 'txt') {
        convertedBuffer = Buffer.from(pdfData.text, 'utf8');
      } else if (outputFormat === 'html') {
        const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Converted from PDF</title></head><body><pre>${pdfData.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`;
        convertedBuffer = Buffer.from(htmlContent, 'utf8');
      } else if (outputFormat === 'docx') {
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                text: "Converted from PDF",
                heading: HeadingLevel.HEADING_1,
              }),
              ...pdfData.text.split('\n').map(line => 
                new Paragraph({
                  children: [new TextRun({ text: line.trim() || ' ' })]
                })
              )
            ]
          }]
        });
        convertedBuffer = await Packer.toBuffer(doc);
      }
    }

    if (!convertedBuffer) {
      return res.status(400).json({ 
        error: `Conversion from ${inputExtension} to ${outputFormat} is not supported.` 
      });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${newFileName}"`);
    res.setHeader('Content-Type', contentType);
    res.send(convertedBuffer);

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Error during file conversion: ' + error.message });
  }
} 