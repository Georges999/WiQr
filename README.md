# WiQr - Universal File Conversion & QR Code Platform

🌐 **Live Demo:** [wiqr.vercel.app](https://wiqr.vercel.app)  
📂 **Source Code:** [github.com/Georges999/WiQr](https://github.com/Georges999/WiQr)

A modern, privacy-first web platform combining universal file conversion and intelligent QR code generation. Built with a stunning glass-morphism interface powered by Three.js, WiQr sets a new standard for utility websites.

## ✨ Features

### 🔄 Universal File Converter
- **Multi-format Support:** Images (JPG, PNG, WebP, GIF, TIFF), Documents (PDF ↔ DOCX, TXT, HTML), Spreadsheets (XLSX, CSV, JSON)
- **Smart Format Detection:** Automatic file analysis with intelligent conversion suggestions
- **Privacy-First:** All processing done locally - no data storage or tracking
- **Professional Quality:** Leverages industry-standard libraries for reliable conversions

### 📱 Smart QR Code Generator
- **Dual Generators:** URL QR codes and WiFi QR codes with custom styling
- **Advanced Customization:** Color themes, size options, and error correction levels
- **Download Support:** High-resolution PNG export (512x512px) with SVG-to-Canvas conversion
- **Real-time Preview:** Instant QR code generation with live customization

### 🎨 Interactive 3D Interface
- **Three.js Integration:** Immersive 3D background with particle systems
- **Glass-morphism Design:** Modern UI with advanced CSS effects and animations
- **Responsive Layout:** Mobile-first design with adaptive grid systems
- **Professional UX:** Smooth transitions, loading states, and error handling

## 🛠 Technology Stack

### Frontend
- **Framework:** [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/) for fast development
- **3D Graphics:** [Three.js](https://threejs.org/) with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom glass-morphism components
- **File Handling:** [React Dropzone](https://react-dropzone.js.org/) for drag-and-drop uploads
- **QR Generation:** [qrcode.js](https://github.com/soldair/node-qrcode) for client-side QR code creation
- **Data Visualization:** [Chart.js](https://www.chartjs.org/) with React wrapper for analytics
- **Analytics:** [Vercel Analytics](https://vercel.com/analytics) for performance monitoring

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/) framework
- **File Processing Libraries:**
  - **Images:** [Sharp](https://sharp.pixelplumbing.com/) for high-performance image processing
  - **Documents:** [Mammoth.js](https://github.com/mwilliamson/mammoth.js) for DOCX parsing, [pdf-parse](https://www.npmjs.com/package/pdf-parse) for PDF text extraction
  - **Spreadsheets:** [SheetJS](https://sheetjs.com/) for Excel/CSV processing
  - **PDF Generation:** [Puppeteer](https://pptr.dev/) for HTML-to-PDF conversion
- **File Upload:** [Multer](https://github.com/expressjs/multer) with memory storage
- **Data Storage:** In-memory storage with JSON backup (no database required)

### Deployment & DevOps
- **Hosting:** [Vercel](https://vercel.com/) with automatic deployments
- **CI/CD:** GitHub integration with Vercel for seamless updates
- **Performance:** Edge functions and CDN optimization
- **Monitoring:** Built-in analytics and error tracking

## 📁 Project Structure

```
WiQr/
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── components/    # React components (Dashboard, FileConverter, QR Generators)
│   │   ├── assets/        # Static assets and images
│   │   └── styles/        # CSS and Tailwind configurations
│   ├── public/            # Public assets (logos, favicon)
│   └── package.json       # Frontend dependencies
├── server/                # Node.js Backend API
│   ├── models/           # Data models and schemas
│   ├── routes/           # API route handlers
│   ├── index.js          # Main server file
│   └── package.json      # Backend dependencies
├── vercel.json           # Vercel deployment configuration
└── README.md             # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git for version control

### Local Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Georges999/WiQr.git
   cd WiQr
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install && cd ..
   
   # Install server dependencies
   cd server && npm install && cd ..
   ```

3. **Start Development Servers**
   ```bash
   npm run dev
   ```
   
   This starts both servers concurrently:
   - **Frontend:** http://localhost:5173
   - **Backend API:** http://localhost:3001

### Production Deployment

The project is configured for automatic deployment on Vercel:

1. **Fork/Clone** the repository
2. **Connect** to Vercel dashboard
3. **Deploy** automatically with zero configuration

## 🔧 Key Implementation Details

### File Conversion Engine
- **Smart Format Detection:** Automatic MIME type detection and conversion matrix
- **Memory-Efficient Processing:** Stream-based file handling to support large files
- **Error Handling:** Comprehensive error catching with user-friendly messages
- **Format Optimization:** Quality-preserving conversions with format-specific settings

### QR Code System
- **Client-Side Generation:** Real-time QR code creation without server dependency
- **High-Resolution Export:** SVG-to-Canvas conversion for crisp 512px downloads
- **WiFi QR Standards:** Compliant with WiFi QR code specification for universal compatibility
- **Custom Styling:** Advanced color theming with professional presets

### 3D Interface
- **Performance Optimized:** Efficient particle systems with frame rate management
- **Responsive Design:** Adaptive 3D elements that scale across devices
- **Accessibility:** Reduced motion options and keyboard navigation support

## 🎯 Privacy & Security

- **Zero Data Storage:** Files processed in memory and immediately discarded
- **Local Processing:** No server-side file storage or user tracking
- **Transparent Operations:** Open-source codebase for full transparency
- **HTTPS Encryption:** Secure data transmission for all operations

## 👨‍💻 Author

**Georges Ghazal**
- Website: [georges-ghazal.org](https://georges-ghazal.org)
- GitHub: [@Georges999](https://github.com/Georges999)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

