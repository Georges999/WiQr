import { useState } from 'react';
import FileConverter from './components/FileConverter';
import QrCodeGenerator from './components/QrCodeGenerator';
import WifiQrGenerator from './components/WifiQrGenerator';
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

