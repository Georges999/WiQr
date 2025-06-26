import React, { useState, useEffect } from 'react';
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
      <div className="glass-ultra border-2 border-white/20 rounded-3xl shadow-2xl w-full max-w-md aurora-glow">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Edit WiFi QR Code</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Name</label>
              <input
                type="text"
                placeholder="WiFi QR Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-aurora-purple focus:ring-2 focus:ring-aurora-purple/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Network Name (SSID)</label>
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
                placeholder="WiFi Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-aurora-emerald focus:ring-2 focus:ring-aurora-emerald/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Security Type</label>
              <select
                value={security}
                onChange={(e) => setSecurity(e.target.value)}
                className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white bg-slate-800/50 focus:border-aurora-purple focus:ring-2 focus:ring-aurora-purple/30 transition-all"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Open (No Password)</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="hidden"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                className="w-5 h-5 text-aurora-blue bg-slate-800 border-slate-600 rounded focus:ring-aurora-blue focus:ring-2"
              />
              <label htmlFor="hidden" className="text-sm text-slate-300">Hidden Network</label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Center Text (Optional)</label>
              <input
                type="text"
                placeholder="WiFi"
                value={centerText}
                onChange={(e) => setCenterText(e.target.value)}
                className="w-full p-4 glass-minimal border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-aurora-emerald focus:ring-2 focus:ring-aurora-emerald/30 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Foreground</label>
                <input 
                  type="color" 
                  value={fgColor} 
                  onChange={(e) => setFgColor(e.target.value)} 
                  className="w-full h-12 rounded-lg border-2 border-slate-600 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Background</label>
                <input 
                  type="color" 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)} 
                  className="w-full h-12 rounded-lg border-2 border-slate-600 cursor-pointer"
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

  // Load WiFi QR codes from localStorage on component mount
  useEffect(() => {
    const savedQrCodes = localStorage.getItem('wiqr-wifi-qr-codes');
    if (savedQrCodes) {
      try {
        setQrCodes(JSON.parse(savedQrCodes));
      } catch (error) {
        console.error('Error loading WiFi QR codes:', error);
      }
    }
  }, []);

  // Save WiFi QR codes to localStorage whenever qrCodes changes
  useEffect(() => {
    localStorage.setItem('wiqr-wifi-qr-codes', JSON.stringify(qrCodes));
  }, [qrCodes]);

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
      
      const newQr = {
        _id: `wifi_qr_${Date.now()}`,
        name: name || `WiFi: ${ssid}`,
        originalUrl: wifiQrString,
        wifiData,
        fgColor,
        bgColor,
        centerText,
        type: 'wifi',
        createdAt: new Date().toISOString()
      };
      
      setQrCodes(prev => [newQr, ...prev]);
      
      // Reset form
      setName('');
      setSsid('');
      setPassword('');
      setSecurity('WPA');
      setHidden(false);
      setFgColor('#000000');
      setBgColor('#ffffff');
      setCenterText('');
    } catch (error) {
      setError('Failed to create WiFi QR code.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setQrCodes(prev => prev.filter(qr => qr._id !== id));
  };

  const handleUpdate = async (id, updatedData) => {
    setQrCodes(prev => prev.map(qr => 
      qr._id === id ? { ...qr, ...updatedData } : qr
    ));
    setEditingQr(null);
  };

  const downloadQRCode = (qr) => {
    // Find the specific QR code card that contains this QR
    const qrCards = document.querySelectorAll('.glass-frosted');
    let targetCard = null;
    
    for (let card of qrCards) {
      const cardText = card.textContent;
      if (cardText.includes(qr.name || 'Untitled') && cardText.includes('Network:')) {
        targetCard = card;
        break;
      }
    }
    
    if (!targetCard) {
      alert('QR code not found. Please try again.');
      return;
    }

    // Find the QR code SVG within this specific card (not the button icons)
    const svgElements = targetCard.querySelectorAll('svg');
    let qrSvg = null;
    
    // Look for the largest SVG (which should be the QR code)
    for (let svg of svgElements) {
      const width = parseInt(svg.getAttribute('width') || '0');
      const height = parseInt(svg.getAttribute('height') || '0');
      // QR code SVGs are typically 150x150 or larger
      if (width >= 100 && height >= 100) {
        qrSvg = svg;
        break;
      }
    }
    
    if (!qrSvg) {
      alert('QR code SVG not found. Please try again.');
      return;
    }

    // Create canvas and convert SVG to PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 512; // High resolution
    canvas.width = size;
    canvas.height = size;

    // Clone the SVG and set it to high resolution
    const svgClone = qrSvg.cloneNode(true);
    svgClone.setAttribute('width', size);
    svgClone.setAttribute('height', size);
    
    // Create SVG data URL
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Create image and draw to canvas
    const img = new Image();
    img.onload = () => {
      // Fill background
      ctx.fillStyle = qr.bgColor || '#ffffff';
      ctx.fillRect(0, 0, size, size);
      
      // Draw QR code
      ctx.drawImage(img, 0, 0, size, size);
      
      // Download the canvas as PNG
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${qr.name || 'wifi-qr-code'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(svgUrl);
      }, 'image/png');
    };
    
    img.onerror = () => {
      alert('Error downloading QR code. Please try taking a screenshot instead.');
      URL.revokeObjectURL(svgUrl);
    };
    
    img.src = svgUrl;
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
                            onClick={() => downloadQRCode(qr)}
                            className="p-2 glass-minimal rounded-lg hover:bg-green-500/20 transition-all text-slate-300 hover:text-green-300"
                            title="Download QR Code"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => setEditingQr(qr)}
                            className="p-2 glass-minimal rounded-lg hover:glass-frosted transition-all text-slate-300 hover:text-white"
                            title="Edit QR Code"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(qr._id)}
                            className="p-2 glass-minimal rounded-lg hover:bg-red-500/20 transition-all text-slate-300 hover:text-red-300"
                            title="Delete QR Code"
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
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    View Source Code
                  </a>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-6 pt-4 text-xs text-slate-400">
                <span>© 2025 WiQr Platform</span>
                <span>•</span>
                <span>Open Source</span>
                <span>•</span>
                <span>Privacy First</span>
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