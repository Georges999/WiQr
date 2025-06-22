import React from 'react';

function Dashboard({ onNavigate }) {
  const features = [
    {
      id: 'converter',
      title: 'File Converter',
      description: 'Transform images between formats with professional quality',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-blue-500/80 to-indigo-600/80',
      shadowColor: 'glow-ocean'
    },
    {
      id: 'qr',
      title: 'QR Generator',
      description: 'Create dynamic, trackable QR codes with custom styling',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      gradient: 'from-emerald-500/80 to-teal-600/80',
      shadowColor: 'glow-matte'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Track performance and usage statistics',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-purple-500/80 to-pink-600/80',
      shadowColor: 'shadow-purple-500/25',
      comingSoon: true
    },
    {
      id: 'api',
      title: 'API Access',
      description: 'Integrate WiQr into your applications',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      gradient: 'from-orange-500/80 to-red-600/80',
      shadowColor: 'shadow-orange-500/25',
      comingSoon: true
    }
  ];

  return (
    <div className="w-full h-full flex flex-col no-border" style={{ margin: 0, padding: 0 }}>
      {/* Header */}
      <header className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center fade-in-scale">
            <h1 className="text-7xl md:text-8xl font-black text-white mb-6 tracking-tight">
              WiQr
            </h1>
            <p className="text-2xl md:text-3xl text-slate-300 font-light max-w-4xl mx-auto leading-relaxed mb-8">
              Professional digital transformation tools for modern workflows
            </p>
            <div className="flex items-center justify-center space-x-6">
              <div className="glass-minimal px-6 py-3 rounded-full">
                <span className="text-emerald-400 font-semibold">✨ Trusted by 10,000+ users</span>
              </div>
              <div className="glass-minimal px-6 py-3 rounded-full">
                <span className="text-blue-400 font-semibold">🚀 100% Free to use</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-7xl">
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                onClick={() => !feature.comingSoon && onNavigate(feature.id)}
                className={`relative group ${
                  feature.comingSoon ? 'cursor-not-allowed' : 'cursor-pointer'
                } card-simple liquid-ripple noise-overlay`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`glass-ultra rounded-3xl p-10 ${feature.shadowColor} ${
                  feature.comingSoon ? 'opacity-60' : ''
                } transition-all duration-500`}>
                  {feature.comingSoon && (
                    <div className="absolute top-6 right-6 glass-minimal px-4 py-2 rounded-full">
                      <span className="text-slate-400 text-sm font-semibold">Coming Soon</span>
                    </div>
                  )}
                  
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center text-white mb-8 organic-blob`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-300 text-xl leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  
                  {!feature.comingSoon && (
                    <div className={`inline-flex items-center px-8 py-4 bg-gradient-to-r ${feature.gradient} text-white font-bold rounded-2xl magnetic transition-all duration-300`}>
                      Get Started
                      <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: '1M+', label: 'Files Converted' },
              { value: '50K+', label: 'QR Codes Generated' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="text-center p-8 glass-frosted rounded-3xl breathe noise-overlay"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-4xl font-black text-white mb-3">{stat.value}</div>
                <div className="text-slate-300 text-lg font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-lg mb-2">
            Built with ❤️ by{' '}
            <a 
              href="https://georges-ghazal.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-aurora-blue hover:text-aurora-purple transition-colors font-semibold"
            >
              Georges Ghazal (G.G.)
            </a>
          </p>
          <p className="text-slate-500">
            Professional digital transformation tools for modern workflows
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard; 