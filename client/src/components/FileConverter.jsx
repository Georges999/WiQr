import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function FileConverter({ onBack }) {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
    setError(null);
    setSuccess(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    multiple: false,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.tiff']
    }
  });

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first!');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    try {
      const response = await axios.post('http://localhost:3001/convert', formData, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const originalName = file.name.split('.').slice(0, -1).join('.');
      link.setAttribute('download', `${originalName}.${format}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('File converted and download started!');
      setFile(null);
    } catch (err) {
      setError('Error during file conversion. Please try again.');
      console.error('Conversion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatOptions = [
    { value: 'jpeg', label: 'JPEG', desc: 'Best for photos' },
    { value: 'png', label: 'PNG', desc: 'Best for transparency' },
    { value: 'webp', label: 'WebP', desc: 'Modern web format' },
    { value: 'gif', label: 'GIF', desc: 'Best for animations' }
  ];

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
            <h1 className="font-display text-page-title mb-6">File Converter</h1>
            <p className="text-xl text-slate-300 font-light">Transform your images with professional quality</p>
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
                    {isDragActive ? 'Drop your file here' : 'Choose or drag your file'}
                  </h3>
                  <p className="text-slate-300 text-xl">
                    Support for JPEG, PNG, WebP, GIF and more formats
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Selected File Preview */}
          {file && (
            <div className="glass-frosted rounded-3xl p-8 fade-in-scale">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-emerald-500/80 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-xl">File Selected</h4>
                  <p className="text-slate-300 font-medium text-lg">{file.name} • {Math.round(file.size / 1024)} KB</p>
                </div>
              </div>
            </div>
          )}

          {/* Format Selection & Convert */}
          <div className="glass-ultra rounded-3xl p-10 noise-overlay">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between space-y-8 lg:space-y-0 lg:space-x-10">
              {/* Format Selection */}
              <div className="flex-1">
                <label className="block text-2xl font-bold text-white mb-6">Convert to:</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {formatOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormat(option.value)}
                      className={`p-6 rounded-3xl transition-all duration-300 text-left magnetic relative ${
                        format === option.value
                          ? 'glass-frosted ring-2 ring-blue-400/50 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 shadow-lg shadow-blue-500/25'
                          : 'glass-minimal hover:glass-frosted'
                      }`}
                    >
                      {format === option.value && (
                        <div className="absolute top-3 right-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className={`font-bold text-xl ${format === option.value ? 'text-blue-200' : 'text-white'}`}>
                        {option.label}
                      </div>
                      <div className={`mt-2 ${format === option.value ? 'text-blue-300' : 'text-slate-300'}`}>
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Convert Button */}
              <div className="lg:w-80">
                <button
                  onClick={handleConvert}
                  disabled={!file || isLoading}
                  className={`w-full px-10 py-6 rounded-3xl font-bold text-xl text-white transition-all duration-500 magnetic ${
                    !file || isLoading
                      ? 'glass-minimal opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500/80 to-indigo-600/80 glow-ocean morph-subtle'
                  }`}
                >
                  {isLoading ? (
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
