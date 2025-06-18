import { useState } from 'react';
import Scene from './components/Scene';
import FileConverter from './components/FileConverter';
import QrCodeGenerator from './components/QrCodeGenerator';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('converter');

  return (
    <div className="relative w-screen h-screen bg-gray-900 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <Scene />
      </div>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-start z-10 p-4 text-white">
        <header className="w-full max-w-7xl mx-auto p-4 text-center">
          <h1 className="text-6xl font-bold text-white mb-2" style={{ textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #6a0dad, 0 0 40px #6a0dad' }}>
            WiQr
          </h1>
          <p className="text-xl text-gray-300">Universal Converter & QR Generator</p>
        </header>

        <main className="w-full max-w-7xl mx-auto mt-8 bg-black bg-opacity-50 backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              className={`flex-1 p-4 text-lg font-semibold transition-colors duration-300 ${activeTab === 'converter' ? 'bg-purple-600 text-white' : 'bg-transparent hover:bg-gray-800'}`}
              onClick={() => setActiveTab('converter')}
            >
              File Converter
            </button>
            <button
              className={`flex-1 p-4 text-lg font-semibold transition-colors duration-300 ${activeTab === 'qr' ? 'bg-purple-600 text-white' : 'bg-transparent hover:bg-gray-800'}`}
              onClick={() => setActiveTab('qr')}
            >
              QR Code Generator
            </button>
          </div>
          <div className="p-8">
            {activeTab === 'converter' && <FileConverter />}
            {activeTab === 'qr' && <QrCodeGenerator />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

