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

    try {
      const response = await axios.post('http://localhost:3001/convert/analyze', formData);
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

    try {
      const response = await axios.post('http://localhost:3001/convert', formData, {
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-5xl space-y-10">
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
      </main>

      {/* Professional Footer */}
      <footer className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="font-display text-white text-sm font-bold">W</span>
              </div>
              <span className="font-heading text-lg">WiQr Platform</span>
            </div>
            
            <p className="text-body">
              made by the one and only{' '}
              <a 
                href="https://georges-ghazal.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium underline decoration-blue-400/30 hover:decoration-blue-300"
              >
                Georges Ghazal
              </a>
            </p>
            
            <div className="flex items-center justify-center space-x-6 pt-4">
              <span className="text-small">© 2025 WiQr Platform</span>
              <span className="text-small">•</span>
              <span className="text-small">InternshipSpeedrun</span>
              <span className="text-small">•</span>
              <span className="text-small">this is all just to get a job</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FileConverter;
