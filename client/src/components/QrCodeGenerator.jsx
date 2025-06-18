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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Edit QR Code</h2>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
          />
          <input
            type="url"
            placeholder="https://example.com"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
            className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <label htmlFor="editFgColor" className="mr-2 text-white">Foreground:</label>
              <input type="color" id="editFgColor" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-12 h-10 p-1 bg-gray-700 border border-gray-600 rounded-md"/>
            </div>
            <div className="flex items-center">
              <label htmlFor="editBgColor" className="mr-2 text-white">Background:</label>
              <input type="color" id="editBgColor" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-10 p-1 bg-gray-700 border border-gray-600 rounded-md"/>
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-red-400 text-center">{error}</p>}

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function QrCodeGenerator() {
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
      <section className="w-full max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-800 bg-opacity-50 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Create a New QR Code</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
            />
            <input
              type="url"
              placeholder="https://example.com"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <label htmlFor="fgColor" className="mr-2 text-white">Foreground:</label>
              <input type="color" id="fgColor" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-12 h-10 p-1 bg-gray-700 border border-gray-600 rounded-md"/>
            </div>
            <div className="flex items-center">
              <label htmlFor="bgColor" className="mr-2 text-white">Background:</label>
              <input type="color" id="bgColor" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-10 p-1 bg-gray-700 border border-gray-600 rounded-md"/>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:bg-gray-500 transition-all duration-300 shadow-lg"
          >
            {isLoading ? 'Generating...' : 'Generate QR Code'}
          </button>
          {error && <p className="mt-2 text-red-400 text-center">{error}</p>}
        </form>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Your QR Codes</h2>
          {qrCodes.length === 0 ? (
            <p className="text-gray-400">No QR codes generated yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrCodes.map((qr) => (
                <div key={qr._id} className="bg-gray-800 p-4 rounded-lg shadow-lg text-center flex flex-col justify-between">
                  <div>
                    <QRCodeSVG
                      value={`http://localhost:3001/${qr.shortUrl}`}
                      size={128}
                      bgColor={qr.bgColor || '#ffffff'}
                      fgColor={qr.fgColor || '#000000'}
                      level="L"
                      includeMargin={true}
                      className="mx-auto"
                    />
                    <h3 className="text-lg font-semibold text-white mt-4 break-all">{qr.name}</h3>
                    <a 
                      href={`http://localhost:3001/${qr.shortUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors break-all"
                    >
                      {`http://localhost:3001/${qr.shortUrl}`}
                    </a>
                    <p className="text-sm text-gray-400">Clicks: {qr.clicks}</p>
                  </div>
                  <div className="mt-2 flex justify-center items-center gap-2">
                    <button 
                      onClick={() => setEditingQr(qr)}
                      className="px-3 py-1 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(qr._id)}
                      className="px-3 py-1 bg-red-600 text-white font-semibold text-xs rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
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
