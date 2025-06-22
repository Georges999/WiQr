import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

// Modal Component for Editing with Aurora Theme
function EditModal({ qr, onClose, onSave }) {
  const [name, setName] = useState(qr.name);
  const [originalUrl, setOriginalUrl] = useState(qr.originalUrl);
  const [fgColor, setFgColor] = useState(qr.fgColor || '#000000');
  const [bgColor, setBgColor] = useState(qr.bgColor || '#ffffff');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!originalUrl) {
      setError('URL cannot be empty.');
      return;
    }
    onSave(qr._id, { name, originalUrl, fgColor, bgColor });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-ultra border-2 border-white/20 rounded-3xl shadow-2xl w-full max-w-md aurora-glow">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Edit QR Code</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Name</label>
              <input
                type="text"
                placeholder="QR Code Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-aurora-purple focus:ring-2 focus:ring-aurora-purple/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
                className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-aurora-blue focus:ring-2 focus:ring-aurora-blue/30 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Foreground</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={fgColor} 
                    onChange={(e) => setFgColor(e.target.value)} 
                    className="w-12 h-12 rounded-xl border-2 border-white/20 cursor-pointer bg-transparent"
                  />
                  <span className="text-sm text-slate-300 font-mono">{fgColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Background</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)} 
                    className="w-12 h-12 rounded-xl border-2 border-white/20 cursor-pointer bg-transparent"
                  />
                  <span className="text-sm text-slate-300 font-mono">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 glass-minimal border border-red-400/30 rounded-xl">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <button 
              onClick={onClose} 
              className="px-6 py-3 text-slate-300 font-semibold rounded-xl glass-minimal hover:glass-frosted transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="px-6 py-3 bg-gradient-to-r from-aurora-purple to-aurora-blue text-white font-semibold rounded-xl hover:from-aurora-purple/80 hover:to-aurora-blue/80 transition-all shadow-lg shadow-aurora-purple/25"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QrCodeGenerator({ onBack }) {
  const [name, setName] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrCodes, setQrCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingQr, setEditingQr] = useState(null);

  useEffect(() => {
    fetchQrCodes();
  }, []);

  const fetchQrCodes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/qr');
      setQrCodes(response.data);
    } catch (err) {
      setError('Failed to fetch QR codes.');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      setError('Please enter a URL.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await axios.post('http://localhost:3001/api/qr', { name, originalUrl, fgColor, bgColor });
      setName('');
      setOriginalUrl('');
      setFgColor('#000000');
      setBgColor('#ffffff');
      fetchQrCodes();
    } catch (err) {
      setError('Failed to create QR code.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/qr/${id}`);
      fetchQrCodes();
    } catch (err) {
      setError('Failed to delete QR code.');
      console.error(err);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await axios.put(`http://localhost:3001/api/qr/${id}`, updatedData);
      setEditingQr(null);
      fetchQrCodes();
    } catch (err) {
      console.error('Failed to update QR code.', err);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col w-full">
        {/* Header with Back Button */}
        <header className="pt-8 pb-6">
          <div className="max-w-6xl mx-auto px-6">
            <button
              onClick={onBack}
              className="inline-flex items-center px-6 py-3 text-slate-300 hover:text-white font-medium transition-all glass-minimal rounded-xl hover:glass-frosted mb-8"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            
            <div className="text-center fade-in-scale">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">QR Code Generator</h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">Create dynamic, trackable QR codes with custom styling and aurora aesthetics</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 pb-8">
          <div className="w-full max-w-6xl mx-auto space-y-8">
            {/* Create Form */}
            <form onSubmit={handleSubmit} className="glass-ultra border border-white/20 rounded-3xl p-8 shadow-xl card-simple">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-aurora-emerald to-aurora-blue rounded-lg mr-3"></div>
                Create New QR Code
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">QR Code Name</label>
                    <input
                      type="text"
                      placeholder="My Awesome QR Code"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-aurora-emerald focus:ring-2 focus:ring-aurora-emerald/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-3">Target URL *</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      required
                      className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-aurora-blue focus:ring-2 focus:ring-aurora-blue/30 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-3">Foreground Color</label>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="color" 
                          value={fgColor} 
                          onChange={(e) => setFgColor(e.target.value)} 
                          className="w-14 h-14 rounded-xl border-2 border-white/20 cursor-pointer bg-transparent"
                        />
                        <span className="text-sm text-slate-300 font-mono">{fgColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-3">Background Color</label>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="color" 
                          value={bgColor} 
                          onChange={(e) => setBgColor(e.target.value)} 
                          className="w-14 h-14 rounded-xl border-2 border-white/20 cursor-pointer bg-transparent"
                        />
                        <span className="text-sm text-slate-300 font-mono">{bgColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="flex flex-col items-center justify-center">
                  <div className="glass-frosted rounded-2xl p-6 mb-4">
                    <h4 className="text-lg font-semibold text-white mb-4 text-center">Live Preview</h4>
                    {originalUrl ? (
                      <QRCodeSVG 
                        value={originalUrl} 
                        size={200} 
                        fgColor={fgColor} 
                        bgColor={bgColor}
                        level="M"
                        includeMargin={true}
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] glass-minimal rounded-xl flex items-center justify-center">
                        <p className="text-slate-400 text-center text-sm">Enter URL to see preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 glass-minimal border border-red-400/30 rounded-xl">
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading || !originalUrl}
                className="w-full py-4 bg-gradient-to-r from-aurora-emerald to-aurora-blue text-white font-bold text-lg rounded-xl hover:from-aurora-emerald/80 hover:to-aurora-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-aurora-emerald/25"
              >
                {isLoading ? 'Creating QR Code...' : 'Create QR Code'}
              </button>
            </form>

            {/* QR Codes Grid */}
            {qrCodes.length > 0 && (
              <div className="glass-ultra border border-white/20 rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-aurora-purple to-aurora-blue rounded-lg mr-3"></div>
                  Your QR Codes ({qrCodes.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {qrCodes.map((qr) => (
                    <div key={qr._id} className="glass-frosted rounded-2xl p-6 card-simple">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-white truncate">{qr.name || 'Untitled'}</h4>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setEditingQr(qr)}
                            className="p-2 glass-minimal rounded-lg hover:glass-frosted transition-all text-slate-300 hover:text-white"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(qr._id)}
                            className="p-2 glass-minimal rounded-lg hover:bg-red-500/20 transition-all text-slate-300 hover:text-red-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-center mb-4">
                        <QRCodeSVG 
                          value={qr.shortUrl} 
                          size={150} 
                          fgColor={qr.fgColor || '#000000'} 
                          bgColor={qr.bgColor || '#ffffff'}
                          level="M"
                          includeMargin={true}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-slate-400">Short URL:</p>
                        <p className="text-sm text-white font-mono bg-black/20 px-3 py-2 rounded-lg truncate">{qr.shortUrl}</p>
                        <p className="text-sm text-slate-400">Target:</p>
                        <p className="text-sm text-slate-300 truncate">{qr.originalUrl}</p>
                        <p className="text-xs text-slate-500">Clicks: {qr.clicks || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {editingQr && (
        <EditModal 
          qr={editingQr} 
          onClose={() => setEditingQr(null)} 
          onSave={handleUpdate} 
        />
      )}
    </>
  );
}

export default QrCodeGenerator;
