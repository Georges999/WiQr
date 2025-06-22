import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

// Modal Component for Editing
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit QR Code</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
              <input
                type="text"
                placeholder="QR Code Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Foreground</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={fgColor} 
                    onChange={(e) => setFgColor(e.target.value)} 
                    className="w-12 h-12 rounded-lg border-2 border-slate-200 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600">{fgColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Background</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)} 
                    className="w-12 h-12 rounded-lg border-2 border-slate-200 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8">
            <button 
              onClick={onClose} 
              className="px-6 py-3 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25"
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
      <div className="min-h-screen flex flex-col">
        {/* Header with Back Button */}
        <header className="pt-8 pb-6">
          <div className="max-w-6xl mx-auto px-6">
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors mb-6"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">QR Code Generator</h1>
              <p className="text-xl text-slate-600">Create dynamic, trackable QR codes with custom styling</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 pb-8">
          <div className="w-full max-w-6xl mx-auto space-y-8">
            {/* Create Form */}
            <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Create New QR Code</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-lg font-bold text-slate-800 mb-2">Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="My QR Code"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-lg font-bold text-slate-800 mb-2">URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
                <div>
                  <label className="block text-lg font-bold text-slate-800 mb-2">Foreground Color</label>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="color" 
                      value={fgColor} 
                      onChange={(e) => setFgColor(e.target.value)} 
                      className="w-16 h-12 rounded-lg border-2 border-slate-200 cursor-pointer"
                    />
                    <span className="text-sm text-slate-600 font-mono">{fgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-lg font-bold text-slate-800 mb-2">Background Color</label>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="color" 
                      value={bgColor} 
                      onChange={(e) => setBgColor(e.target.value)} 
                      className="w-16 h-12 rounded-lg border-2 border-slate-200 cursor-pointer"
                    />
                    <span className="text-sm text-slate-600 font-mono">{bgColor}</span>
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full px-8 py-5 rounded-2xl font-bold text-lg text-white transition-all duration-300 shadow-xl transform ${
                      isLoading
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      'Generate QR Code'
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-red-700 font-semibold text-lg">{error}</p>
                  </div>
                </div>
              )}
            </form>

            {/* QR Codes Grid */}
            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-6">Your QR Codes</h3>
              {qrCodes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-xl font-semibold">No QR codes generated yet.</p>
                  <p className="text-slate-400 text-lg">Create your first QR code above!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {qrCodes.map((qr) => (
                    <div key={qr._id} className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                      <div className="text-center space-y-4">
                        <div className="bg-white rounded-2xl p-4 shadow-inner">
                          <QRCodeSVG
                            value={`http://localhost:3001/${qr.shortUrl}`}
                            size={160}
                            bgColor={qr.bgColor || '#ffffff'}
                            fgColor={qr.fgColor || '#000000'}
                            level="L"
                            includeMargin={true}
                            className="mx-auto"
                          />
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-slate-800 text-xl truncate">{qr.name || 'Untitled'}</h4>
                          <a 
                            href={`http://localhost:3001/${qr.shortUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 font-medium break-all"
                          >
                            /{qr.shortUrl}
                          </a>
                          <p className="text-slate-500 font-medium mt-1">{qr.clicks} clicks</p>
                        </div>
                        
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingQr(qr)}
                            className="flex-1 px-4 py-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(qr._id)}
                            className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
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
