import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

// WiFi QR code data formatter
const formatWifiQR = (ssid, password, security, hidden) => {
  return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
};

// Modal Component for Editing WiFi QR Codes
function EditWifiModal({ qr, onClose, onSave }) {
  const [name, setName] = useState(qr.name);
  const [ssid, setSsid] = useState(qr.wifiData?.ssid || '');
  const [password, setPassword] = useState(qr.wifiData?.password || '');
  const [security, setSecurity] = useState(qr.wifiData?.security || 'WPA');
  const [hidden, setHidden] = useState(qr.wifiData?.hidden || false);
  const [fgColor, setFgColor] = useState(qr.fgColor || '#000000');
  const [bgColor, setBgColor] = useState(qr.bgColor || '#ffffff');
  const [centerText, setCenterText] = useState(qr.centerText || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!ssid) {
      setError('Network name (SSID) cannot be empty.');
      return;
    }
    
    const wifiData = { ssid, password, security, hidden };
    const wifiString = formatWifiQR(ssid, password, security, hidden);
    
    onSave(qr._id, { 
      name, 
      originalUrl: wifiString,
      wifiData,
      fgColor, 
      bgColor,
      centerText,
      type: 'wifi'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-ultra border-2 border-white/20 rounded-3xl shadow-2xl w-full max-w-2xl aurora-glow max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Edit WiFi QR Code</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Name</label>
              <input
                type="text"
                placeholder="WiFi QR Code Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-aurora-purple focus:ring-2 focus:ring-aurora-purple/30 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Network Name (SSID) *</label>
                <input
                  type="text"
                  placeholder="My WiFi Network"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  required
                  className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-aurora-blue focus:ring-2 focus:ring-aurora-blue/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Password</label>
                <input
                  type="password"
                  placeholder="Network password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-aurora-blue focus:ring-2 focus:ring-aurora-blue/30 transition-all"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Security Type</label>
                <select
                  value={security}
                  onChange={(e) => setSecurity(e.target.value)}
                  className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white bg-slate-800/50 focus:border-aurora-blue focus:ring-2 focus:ring-aurora-blue/30 transition-all"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Open (No Password)</option>
                </select>
              </div>
              <div className="flex items-center space-x-3 pt-8">
                <input
                  type="checkbox"
                  id="hidden"
                  checked={hidden}
                  onChange={(e) => setHidden(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-white/20 bg-glass-minimal checked:bg-aurora-blue checked:border-aurora-blue"
                />
                <label htmlFor="hidden" className="text-sm font-semibold text-slate-300">Hidden Network</label>
              </div>
            </div>
            
            {/* Design Options */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Design Options</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
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
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-300 mb-3">Center Text</label>
                <input
                  type="text"
                  placeholder="WiFi"
                  value={centerText}
                  onChange={(e) => setCenterText(e.target.value)}
                  className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-aurora-purple focus:ring-2 focus:ring-aurora-purple/30 transition-all"
                />
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

// Enhanced QR Code SVG with center text that doesn't interfere with scanning
function EnhancedQRCode({ value, size, fgColor, bgColor, centerText }) {
  return (
    <div className="relative inline-block">
      <QRCodeSVG 
        value={value}
        size={size} 
        fgColor={fgColor} 
        bgColor={bgColor}
        level="H" // High error correction allows for center obstruction
        includeMargin={true}
      />
      {centerText && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            // Position the text in the very center where QR codes have natural redundancy
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: `${size * 0.25}px`, // Limit size to 25% of QR code
            maxHeight: `${size * 0.25}px`,
          }}
        >
          <div 
            className="rounded-lg text-center flex items-center justify-center shadow-lg"
            style={{ 
              backgroundColor: bgColor,
              color: fgColor,
              fontSize: `${Math.min(size * 0.04, centerText.length > 6 ? size * 0.03 : size * 0.045)}px`,
              fontWeight: '700',
              padding: `${size * 0.01}px ${size * 0.015}px`,
              border: `${Math.max(1, size * 0.003)}px solid ${fgColor}`,
              minWidth: `${size * 0.15}px`,
              minHeight: `${size * 0.08}px`,
              maxWidth: `${size * 0.25}px`,
              maxHeight: `${size * 0.12}px`,
              wordBreak: 'break-word',
              lineHeight: '1.1',
              boxShadow: `0 0 ${size * 0.01}px rgba(0,0,0,0.3)`
            }}
          >
            {centerText.length > 8 ? centerText.substring(0, 8) + '...' : centerText}
          </div>
        </div>
      )}
    </div>
  );
}

// WiFi QR Generator Component
function WifiQrGenerator({ onBack }) {
  const [name, setName] = useState('');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [security, setSecurity] = useState('WPA');
  const [hidden, setHidden] = useState(false);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [centerText, setCenterText] = useState('');
  const [qrCodes, setQrCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingQr, setEditingQr] = useState(null);

  const wifiString = ssid ? formatWifiQR(ssid, password, security, hidden) : '';

  useEffect(() => {
    fetchWifiQrCodes();
  }, []);

  const fetchWifiQrCodes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/qr/wifi');
      setQrCodes(response.data);
    } catch {
      // If endpoint doesn't exist yet, fetch all and filter
      try {
        const response = await axios.get('http://localhost:3001/api/qr');
        const wifiCodes = response.data.filter(qr => qr.type === 'wifi' || qr.originalUrl?.startsWith('WIFI:'));
        setQrCodes(wifiCodes);
      } catch (error) {
        setError('Failed to fetch WiFi QR codes.');
        console.error(error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ssid) {
      setError('Please enter a network name (SSID).');
      return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const wifiData = { ssid, password, security, hidden };
      const wifiQrString = formatWifiQR(ssid, password, security, hidden);
      
      await axios.post('http://localhost:3001/api/qr', { 
        name: name || `WiFi: ${ssid}`, 
        originalUrl: wifiQrString,
        wifiData,
        fgColor, 
        bgColor,
        centerText,
        type: 'wifi'
      });
      
      // Reset form
      setName('');
      setSsid('');
      setPassword('');
      setSecurity('WPA');
      setHidden(false);
      setFgColor('#000000');
      setBgColor('#ffffff');
      setCenterText('');
      
      fetchWifiQrCodes();
    } catch (error) {
      setError('Failed to create WiFi QR code.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/qr/${id}`);
      fetchWifiQrCodes();
    } catch (error) {
      setError('Failed to delete WiFi QR code.');
      console.error(error);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await axios.put(`http://localhost:3001/api/qr/${id}`, updatedData);
      setEditingQr(null);
      fetchWifiQrCodes();
    } catch (error) {
      console.error('Failed to update WiFi QR code.', error);
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
              <h1 className="font-display text-page-title mb-4 tracking-tight">WiFi QR Code Generator</h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">Create beautiful WiFi QR codes with custom designs and instant sharing capabilities</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 pb-8">
          <div className="w-full max-w-7xl mx-auto space-y-8">
            {/* Create Form */}
            <div className="glass-ultra rounded-3xl p-10 shadow-xl card-simple liquid-ripple noise-overlay">
              <h3 className="text-3xl font-bold text-white mb-8 flex items-center">
                <div className="w-20 h-20 bg-gradient-to-r from-aurora-emerald to-aurora-purple rounded-3xl flex items-center justify-center text-white mr-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
                Create WiFi QR Code
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xl font-semibold text-slate-300 mb-4">QR Code Name</label>
                      <input
                        type="text"
                        placeholder="My WiFi Network QR"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all text-lg focus:bg-slate-700/80"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xl font-semibold text-slate-300 mb-4">Network Name (SSID) *</label>
                        <input
                          type="text"
                          placeholder="My WiFi Network"
                          value={ssid}
                          onChange={(e) => setSsid(e.target.value)}
                          required
                          className="w-full p-4 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all text-lg focus:bg-slate-700/80"
                        />
                      </div>
                      <div>
                        <label className="block text-xl font-semibold text-slate-300 mb-4">Password</label>
                        <input
                          type="password"
                          placeholder="Network password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full p-4 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all text-lg focus:bg-slate-700/80"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xl font-semibold text-slate-300 mb-4">Security Type</label>
                        <select
                          value={security}
                          onChange={(e) => setSecurity(e.target.value)}
                          className="w-full p-4 bg-slate-800/80 border border-slate-600 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all text-lg focus:bg-slate-700/80"
                        >
                          <option value="WPA">WPA/WPA2</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">Open (No Password)</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-3 pt-12">
                        <input
                          type="checkbox"
                          id="hiddenNetwork"
                          checked={hidden}
                          onChange={(e) => setHidden(e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-800/80 checked:bg-blue-500 checked:border-blue-500"
                        />
                        <label htmlFor="hiddenNetwork" className="text-lg font-semibold text-slate-300">Hidden Network</label>
                      </div>
                    </div>
                    
                    {/* Design Options */}
                    <div className="border-t border-slate-600 pt-6">
                      <h4 className="text-xl font-semibold text-slate-300 mb-4">Design Options</h4>
                      
                      <div className="grid grid-cols-2 gap-6 mb-4">
                        <div>
                          <label className="block text-lg font-semibold text-slate-300 mb-4">Foreground Color</label>
                          <div className="flex items-center space-x-3">
                            <input 
                              type="color" 
                              value={fgColor} 
                              onChange={(e) => setFgColor(e.target.value)} 
                              className="w-12 h-12 rounded-lg border-2 border-slate-600 cursor-pointer"
                              style={{ backgroundColor: fgColor }}
                            />
                            <div className="bg-slate-800/90 px-3 py-2 rounded-lg border border-slate-600 flex-1">
                              <span className="text-sm text-slate-300 font-mono">{fgColor}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-lg font-semibold text-slate-300 mb-4">Background Color</label>
                          <div className="flex items-center space-x-3">
                            <input 
                              type="color" 
                              value={bgColor} 
                              onChange={(e) => setBgColor(e.target.value)} 
                              className="w-12 h-12 rounded-lg border-2 border-slate-600 cursor-pointer"
                              style={{ backgroundColor: bgColor }}
                            />
                            <div className="bg-slate-800/90 px-3 py-2 rounded-lg border border-slate-600 flex-1">
                              <span className="text-sm text-slate-300 font-mono">{bgColor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-lg font-semibold text-slate-300 mb-4">Center Text</label>
                        <input
                          type="text"
                          placeholder="WiFi"
                          value={centerText}
                          onChange={(e) => setCenterText(e.target.value)}
                          className="w-full p-4 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all text-lg focus:bg-slate-700/80"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="glass-frosted rounded-2xl p-8 mb-6">
                      <h4 className="text-xl font-semibold text-white mb-6 text-center">Live Preview</h4>
                      {wifiString ? (
                        <EnhancedQRCode 
                          value={wifiString}
                          size={200} 
                          fgColor={fgColor} 
                          bgColor={bgColor}
                          centerText={centerText}
                        />
                      ) : (
                        <div className="w-[200px] h-[200px] glass-minimal rounded-xl flex items-center justify-center">
                          <p className="text-slate-400 text-center">Enter WiFi details to see preview</p>
                        </div>
                      )}
                    </div>
                    
                    {ssid && (
                      <div className="text-center space-y-2">
                        <p className="text-sm text-slate-400">Network: <span className="text-white font-semibold">{ssid}</span></p>
                        <p className="text-sm text-slate-400">Security: <span className="text-white font-semibold">{security}</span></p>
                        {hidden && <p className="text-sm text-orange-400">Hidden Network</p>}
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-6 glass-minimal border border-red-400/30 rounded-xl">
                    <p className="text-red-300 text-lg">{error}</p>
                  </div>
                )}

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isLoading || !ssid}
                    className="w-full py-5 bg-gradient-to-r from-aurora-emerald to-aurora-purple text-white font-bold text-xl rounded-2xl hover:from-aurora-emerald/80 hover:to-aurora-purple/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-aurora-emerald/25"
                  >
                    {isLoading ? 'Creating WiFi QR Code...' : 'Create WiFi QR Code'}
                  </button>
                </div>
              </form>
            </div>

            {/* WiFi QR Codes Grid */}
            {qrCodes.length > 0 && (
              <div className="glass-ultra border border-white/20 rounded-3xl p-10 shadow-xl">
                <h3 className="text-3xl font-bold text-white mb-8 flex items-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-aurora-purple to-aurora-emerald rounded-3xl flex items-center justify-center text-white mr-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>
                  Your WiFi QR Codes ({qrCodes.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        <EnhancedQRCode 
                          value={qr.originalUrl} 
                          size={150} 
                          fgColor={qr.fgColor || '#000000'} 
                          bgColor={qr.bgColor || '#ffffff'}
                          centerText={qr.centerText}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        {qr.wifiData && (
                          <>
                            <p className="text-sm text-slate-400">Network:</p>
                            <p className="text-sm text-white font-mono bg-black/20 px-3 py-2 rounded-lg truncate">{qr.wifiData.ssid}</p>
                            <p className="text-sm text-slate-400">Security:</p>
                            <p className="text-sm text-slate-300">{qr.wifiData.security}</p>
                            {qr.wifiData.hidden && <p className="text-xs text-orange-400">Hidden Network</p>}
                          </>
                        )}
                        <p className="text-xs text-slate-500">Scans: {qr.clicks || 0}</p>
                      </div>
                    </div>
                  ))}
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

      {editingQr && (
        <EditWifiModal 
          qr={editingQr} 
          onClose={() => setEditingQr(null)} 
          onSave={handleUpdate} 
        />
      )}
    </>
  );
}

export default WifiQrGenerator; 