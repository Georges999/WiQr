import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function FileConverter({ onBack }) {
  const [file, setFile] = useState(null);
  const [fileAnalysis, setFileAnalysis] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    setFileAnalysis(null);
    setSelectedFormat('');
    setError(null);
    setSuccess(null);
    
    // Automatically analyze the file
    await analyzeFile(uploadedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    multiple: false
    // Remove accept restriction to allow any file type
  });

  const analyzeFile = async (file) => {
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    // Use different endpoints for local vs production
    const isLocal = window.location.hostname === 'localhost';
    const apiUrl = isLocal ? 'http://localhost:3001/convert/analyze' : '/api/convert?action=analyze';

    try {
      const response = await axios.post(apiUrl, formData);
      setFileAnalysis(response.data);
      
      // Auto-select first available format if any
      if (response.data.supportedConversions && response.data.supportedConversions.length > 0) {
        setSelectedFormat(response.data.supportedConversions[0].extension);
      }
    } catch (err) {
      setError('Error analyzing file. Please try a different file.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConvert = async () => {
    if (!file || !selectedFormat) {
      setError('Please select a file and output format!');
      return;
    }

    setIsConverting(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', selectedFormat);

    // Use different endpoints for local vs production
    const isLocal = window.location.hostname === 'localhost';
    const apiUrl = isLocal ? 'http://localhost:3001/convert' : '/api/convert';

    try {
      const response = await axios.post(apiUrl, formData, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const originalName = file.name.split('.').slice(0, -1).join('.');
      link.setAttribute('download', `${originalName}.${selectedFormat}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('File converted and download started!');
      
      // Reset form
      setFile(null);
      setFileAnalysis(null);
      setSelectedFormat('');
    } catch (err) {
      setError('Error during file conversion. Please try again.');
      console.error('Conversion error:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const getFileTypeIcon = (inputFormat) => {
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'];
    const docFormats = ['docx', 'doc', 'txt', 'html', 'pdf'];
    const spreadsheetFormats = ['xlsx', 'xls', 'csv', 'json'];
    const archiveFormats = ['zip', 'rar', '7z'];

    if (imageFormats.includes(inputFormat?.toLowerCase())) {
      return (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    } else if (docFormats.includes(inputFormat?.toLowerCase())) {
      return (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else if (spreadsheetFormats.includes(inputFormat?.toLowerCase())) {
      return (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    } else if (archiveFormats.includes(inputFormat?.toLowerCase())) {
      return (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    } else {
      return (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
  };

  const getFormatDescription = (extension, name) => {
    const descriptions = {
      // Images
      'jpg': 'Best for photos',
      'jpeg': 'Best for photos', 
      'png': 'Best for transparency',
      'webp': 'Modern web format',
      'gif': 'Best for animations',
      'bmp': 'Uncompressed format',
      'tiff': 'High quality format',
      
      // Documents
      'pdf': 'Portable document',
      'txt': 'Plain text format',
      'html': 'Web page format',
      'docx': 'Word document',
      
      // Data
      'csv': 'Spreadsheet data',
      'json': 'Structured data',
      'xlsx': 'Excel format'
    };
    
    return descriptions[extension] || `${name} format`;
  };

  return (
    <div className="min-h-screen flex flex-col no-border">
      {/* Header with Back Button */}
      <header className="pt-12 pb-8">
        <div className="max-w-5xl mx-auto px-6">
          <button
            onClick={onBack}
            className="inline-flex items-center px-6 py-3 text-slate-300 hover:text-white font-medium transition-all duration-300 glass-minimal rounded-2xl mb-8 magnetic"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="text-center fade-in-scale">
            <h1 className="font-display text-page-title mb-6">Universal File Converter</h1>
            <p className="text-xl text-slate-300 font-light">Convert any file type with professional quality</p>
            
            {/* PDF to Word Featured Indicator */}
            <div className="inline-flex items-center px-6 py-3 mt-6 glass-frosted rounded-2xl border border-emerald-400/30">
              <div className="w-8 h-8 bg-emerald-500/80 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-emerald-300 font-semibold"> Now Supports PDF ↔ Word Conversion!</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Conversion List Sidebar */}
            <div className="xl:col-span-1 order-2 xl:order-1">
              <div className="glass-ultra rounded-3xl p-6 xl:sticky xl:top-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-aurora-purple to-aurora-blue rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  Supported Conversions
                </h3>
                
                <div className="space-y-4">
                  {/* Images */}
                  <div className="space-y-2">
                    <h4 className="text-aurora-blue font-semibold text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Images
                    </h4>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>JPG ↔ PNG, WebP, GIF, TIFF</div>
                      <div>PNG ↔ JPG, WebP, GIF, TIFF</div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="space-y-2">
                    <h4 className="text-aurora-emerald font-semibold text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Documents
                    </h4>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div className="text-emerald-300 font-medium"> PDF ↔ DOCX (Word)</div>
                      <div>PDF → TXT, HTML</div>
                      <div>DOCX → TXT, HTML</div>
                    </div>
                  </div>

                  {/* Spreadsheets */}
                  <div className="space-y-2">
                    <h4 className="text-aurora-purple font-semibold text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Spreadsheets
                    </h4>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>XLSX ↔ CSV, JSON</div>
                      <div>CSV ↔ JSON, XLSX</div>
                    </div>
                  </div>

                  {/* Data */}
                  <div className="space-y-2">
                    <h4 className="text-aurora-blue font-semibold text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Data
                    </h4>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div>JSON ↔ CSV, XLSX</div>
                      <div>TXT → HTML, PDF</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3 glass-minimal rounded-xl border border-blue-400/20">
                  <p className="text-xs text-blue-300 text-center">
                    <span className="font-semibold"> Tip:</span> Upload any file to see available conversions!
                  </p>
                </div>
              </div>
            </div>

            {/* Main Converter Area */}
            <div className="xl:col-span-4 space-y-10 order-1 xl:order-2">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`relative group cursor-pointer morph-subtle liquid-ripple noise-overlay ${
              isDragActive ? 'scale-105' : ''
            }`}
          >
            <input {...getInputProps()} />
            <div className={`glass-ultra rounded-3xl p-20 text-center transition-all duration-500 ${
              isDragActive ? 'glow-ocean' : ''
            }`}>
              <div className="space-y-8">
                <div className={`mx-auto w-32 h-32 bg-gradient-to-r from-blue-500/80 to-indigo-600/80 rounded-3xl flex items-center justify-center organic-blob ${
                  isDragActive ? 'pulse-matte' : ''
                }`}>
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {isDragActive ? 'Drop your file here' : 'Choose or drag any file'}
                  </h3>
                  <p className="text-slate-300 text-xl">
                    Images • Documents • Spreadsheets • Archives • And more
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* File Analysis Loading */}
          {isAnalyzing && (
            <div className="glass-frosted rounded-3xl p-8 fade-in-scale">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/80 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-xl">Analyzing File</h4>
                  <p className="text-slate-300">Detecting format and available conversions...</p>
                </div>
              </div>
            </div>
          )}
          
          {/* File Analysis Results */}
          {fileAnalysis && (
            <div className="glass-frosted rounded-3xl p-8 fade-in-scale">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-emerald-500/80 rounded-2xl flex items-center justify-center">
                  {getFileTypeIcon(fileAnalysis.inputFormat)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-xl">File Analyzed</h4>
                  <p className="text-slate-300 font-medium text-lg">
                    {fileAnalysis.filename} • {Math.round(fileAnalysis.size / 1024)} KB • {fileAnalysis.inputFormat?.toUpperCase()}
                  </p>
                  <p className="text-emerald-300 text-sm mt-1">
                    {fileAnalysis.supportedConversions?.length || 0} conversion formats available
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Format Selection & Convert */}
          {fileAnalysis && fileAnalysis.supportedConversions && fileAnalysis.supportedConversions.length > 0 && (
            <div className="glass-ultra rounded-3xl p-10 noise-overlay">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between space-y-8 lg:space-y-0 lg:space-x-10">
                {/* Dynamic Format Selection */}
                <div className="flex-1">
                  <label className="block text-2xl font-bold text-white mb-6">Convert to:</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {fileAnalysis.supportedConversions.map((conversion) => (
                      <button
                        key={conversion.extension}
                        onClick={() => setSelectedFormat(conversion.extension)}
                        className={`p-6 rounded-3xl transition-all duration-300 text-left magnetic relative ${
                          selectedFormat === conversion.extension
                            ? 'glass-frosted ring-2 ring-blue-400/50 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 shadow-lg shadow-blue-500/25'
                            : 'glass-minimal hover:glass-frosted'
                        }`}
                      >
                        {selectedFormat === conversion.extension && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                        <div className={`font-bold text-xl ${selectedFormat === conversion.extension ? 'text-blue-200' : 'text-white'}`}>
                          {conversion.name}
                        </div>
                        <div className={`mt-2 text-sm ${selectedFormat === conversion.extension ? 'text-blue-300' : 'text-slate-300'}`}>
                          {getFormatDescription(conversion.extension, conversion.name)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Convert Button */}
                <div className="lg:w-80">
                  <button
                    onClick={handleConvert}
                    disabled={!file || !selectedFormat || isConverting}
                    className={`w-full px-10 py-6 rounded-3xl font-bold text-xl text-white transition-all duration-500 magnetic ${
                      !file || !selectedFormat || isConverting
                        ? 'glass-minimal opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500/80 to-indigo-600/80 glow-ocean morph-subtle'
                    }`}
                  >
                    {isConverting ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Converting...</span>
                      </div>
                    ) : (
                      'Convert & Download'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No Conversions Available */}
          {fileAnalysis && (!fileAnalysis.supportedConversions || fileAnalysis.supportedConversions.length === 0) && (
            <div className="glass-frosted rounded-3xl p-8 fade-in-scale">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-500/80 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-yellow-300 font-semibold text-xl">No conversions available</p>
                  <p className="text-slate-300">This file type is not supported for conversion yet.</p>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="glass-frosted rounded-3xl p-8 fade-in-scale">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500/80 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-300 font-semibold text-xl">{error}</p>
              </div>
            </div>
          )}
          
          {success && (
            <div className="glass-frosted rounded-3xl p-8 fade-in-scale">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-500/80 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-emerald-300 font-semibold text-xl">{success}</p>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="font-display text-white text-sm font-bold">W</span>
              </div>
              <span className="font-heading text-lg">WiQr Platform</span>
            </div>
            
            <div className="space-y-3">
              <p className="text-body">
                Built by{' '}
                <a 
                  href="https://georges-ghazal.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium underline decoration-blue-400/30 hover:decoration-blue-300"
                >
                  Georges Ghazal
                </a>
                {' '}using React, Node.js, Three.js, Tailwind CSS, and Express
              </p>
              
              <div className="flex items-center justify-center space-x-3">
                <a 
                  href="https://github.com/Georges999/WiQr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 glass-minimal rounded-xl text-slate-300 hover:text-white hover:glass-frosted transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View Source Code
                </a>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-6 pt-4 text-xs text-slate-400">
              <span>© 2025 WiQr Platform</span>
              <span>•</span>
              <span>internshipspeedrun</span>
              <span>•</span>
              <span>HireMePlz</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FileConverter;
