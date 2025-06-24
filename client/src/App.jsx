import { useState } from 'react';
import FileConverter from './components/FileConverter';
import QrCodeGenerator from './components/QrCodeGenerator';
import WifiQrGenerator from './components/WifiQrGenerator';
import NetworkMonitor from './components/NetworkMonitor';
import Dashboard from './components/Dashboard';
import ThreeBackground from './components/ThreeBackground';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null); // For future login functionality

  const renderPage = () => {
    switch (currentPage) {
      case 'converter':
        return <FileConverter onBack={() => setCurrentPage('dashboard')} />;
      case 'qr':
        return <QrCodeGenerator onBack={() => setCurrentPage('dashboard')} user={user} />;
      case 'wifi':
        return <WifiQrGenerator onBack={() => setCurrentPage('dashboard')} user={user} />;
      case 'network':
        return (
          <div className="min-h-screen flex flex-col w-full">
            <header className="pt-8 pb-6">
              <div className="max-w-6xl mx-auto px-6">
                <button
                  onClick={() => setCurrentPage('dashboard')}
                  className="inline-flex items-center px-6 py-3 text-slate-300 hover:text-white font-medium transition-all glass-minimal rounded-xl hover:glass-frosted mb-8"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
            </header>
            <main className="flex-1 px-6 pb-8">
              <div className="max-w-6xl mx-auto">
                <NetworkMonitor />
              </div>
            </main>
          </div>
        );
      case 'dashboard':
      default:
        return <Dashboard onNavigate={setCurrentPage} user={user} setUser={setUser} />;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Three.js Background */}
      <ThreeBackground />
      
      {/* Main Content */}
      <div className="relative z-30 w-full h-full overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;

