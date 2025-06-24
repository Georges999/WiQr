import React, { useState, useEffect } from 'react';

function NetworkMonitor() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastScan, setLastScan] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const performScan = async () => {
    setLoading(true);
    try {
      // For simplicity, using mock data to demonstrate the UI
      // In production, this would call a real network scanning API
      const mockDevices = [
        {
          ip: '192.168.1.1',
          hostname: 'Router',
          mac: '00:14:D1:12:34:56',
          type: 'Router',
          icon: '📡',
          color: 'from-orange-500 to-orange-600',
          isActive: true,
          lastSeen: new Date()
        },
        {
          ip: '192.168.1.105',
          hostname: 'Georges-iPhone',
          mac: 'A4:D1:D2:88:99:AA',
          type: 'Phone',
          icon: '📱',
          color: 'from-blue-500 to-blue-600',
          isActive: true,
          lastSeen: new Date()
        },
        {
          ip: '192.168.1.112',
          hostname: 'MacBook-Pro',
          mac: '88:66:5A:12:34:56',
          type: 'Laptop',
          icon: '💻',
          color: 'from-gray-500 to-gray-600',
          isActive: true,
          lastSeen: new Date()
        },
        {
          ip: '192.168.1.123',
          hostname: 'Samsung-TV',
          mac: '34:56:78:90:AB:CD',
          type: 'TV/Streaming',
          icon: '📺',
          color: 'from-purple-500 to-purple-600',
          isActive: true,
          lastSeen: new Date()
        },
        {
          ip: '192.168.1.89',
          hostname: 'Friend-Phone',
          mac: 'FF:EE:DD:CC:BB:AA',
          type: 'Phone',
          icon: '📱',
          color: 'from-green-500 to-green-600',
          isActive: Math.random() > 0.4,
          lastSeen: new Date(Date.now() - Math.random() * 3600000)
        },
        {
          ip: '192.168.1.67',
          hostname: 'Unknown-Device',
          mac: 'AA:BB:CC:DD:EE:FF',
          type: 'Unknown Device',
          icon: '❓',
          color: 'from-slate-500 to-slate-600',
          isActive: Math.random() > 0.5,
          lastSeen: new Date(Date.now() - Math.random() * 7200000)
        }
      ];
      
      setDevices(mockDevices);
      setLastScan(new Date());
    } catch {
      console.error('Network scan failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial scan
    performScan();
    
    // Auto refresh every 30 seconds if enabled
    const interval = autoRefresh ? setInterval(performScan, 30000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const activeDevices = devices.filter(device => device.isActive);
  const inactiveDevices = devices.filter(device => !device.isActive);

  return (
    <div className="glass-ultra rounded-3xl p-8 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Network Monitor</h3>
            <p className="text-slate-400">
              {loading ? 'Scanning network...' : `${activeDevices.length} devices connected`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              autoRefresh 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
            }`}
          >
            {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
          </button>
          
          <button
            onClick={performScan}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? '⏳' : '🔍 Scan'}
          </button>
        </div>
      </div>

      {lastScan && (
        <div className="mb-6 text-sm text-slate-400 text-center">
          Last updated: {lastScan.toLocaleTimeString()}
        </div>
      )}

      {/* Active Devices */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-emerald-300 flex items-center">
          <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
          Connected Now ({activeDevices.length})
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeDevices.map((device) => (
            <div key={device.ip} className="glass-frosted rounded-2xl p-4 hover:glass-ultra transition-all">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${device.color} rounded-xl flex items-center justify-center text-lg`}>
                  {device.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-white truncate">{device.hostname}</h5>
                  <p className="text-sm text-slate-400">{device.type}</p>
                </div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              
              <div className="space-y-1 text-xs text-slate-400">
                <div>IP: <span className="text-slate-300 font-mono">{device.ip}</span></div>
                <div>MAC: <span className="text-slate-300 font-mono">{device.mac.substring(0, 8)}...</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Seen */}
      {inactiveDevices.length > 0 && (
        <div className="mt-8 space-y-4">
          <h4 className="text-lg font-semibold text-slate-400 flex items-center">
            <div className="w-3 h-3 bg-slate-500 rounded-full mr-3"></div>
            Recently Seen ({inactiveDevices.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {inactiveDevices.map((device) => (
              <div key={device.ip} className="glass-minimal rounded-xl p-3 opacity-60">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-8 h-8 bg-gradient-to-r ${device.color} rounded-lg flex items-center justify-center text-sm opacity-70`}>
                    {device.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h6 className="text-sm font-medium text-slate-300 truncate">{device.hostname}</h6>
                    <p className="text-xs text-slate-500">{device.ip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {devices.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.563M15.719 9a4 4 0 00-7.438 0" />
            </svg>
          </div>
          <p className="text-slate-400">No devices found on your network</p>
        </div>
      )}
    </div>
  );
}

export default NetworkMonitor; 