import { useState, useEffect, useRef } from 'react';
import FileConverter from './components/FileConverter';
import QrCodeGenerator from './components/QrCodeGenerator';
import WifiQrGenerator from './components/WifiQrGenerator';
import DataVisualizer from './components/DataVisualizer';
import Dashboard from './components/Dashboard';
import ThreeBackground from './components/ThreeBackground';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null); // For future login functionality
  const scrollContainerRef = useRef(null);

  // Fix page scroll issue - scroll to top when page changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'converter':
        return <FileConverter onBack={() => setCurrentPage('dashboard')} />;
      case 'qr':
        return <QrCodeGenerator onBack={() => setCurrentPage('dashboard')} user={user} />;
      case 'wifi':
        return <WifiQrGenerator onBack={() => setCurrentPage('dashboard')} user={user} />;
      case 'visualizer':
        return <DataVisualizer onBack={() => setCurrentPage('dashboard')} />;
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
      <div ref={scrollContainerRef} className="relative z-30 w-full h-full overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;

