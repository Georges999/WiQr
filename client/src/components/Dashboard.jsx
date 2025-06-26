import React, { useState, useEffect } from 'react';

// Professional animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Professional easing function
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easeOutCubic));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span className="animate-counter font-display text-display">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function Dashboard({ onNavigate }) {
  const features = [
    {
      id: 'converter',
      title: 'File Converter',
      description: 'Transform images between formats with enterprise-grade quality and precision(supports pdf to word!)',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-indigo-600',
      category: 'Transform'
    },
    {
      id: 'qr',
      title: 'URL QR Generator',
      description: 'Create dynamic, trackable QR codes with advanced analytics and custom branding',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75H16.5v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75H16.5v-.75z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-600',
      category: 'Generate'
    },
    {
      id: 'wifi',
      title: 'WiFi QR Generator',
      description: 'Generate instant WiFi sharing QR codes with custom designs and network configurations',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      gradient: 'from-violet-500 to-purple-600',
      category: 'Generate'
    },
    {
      id: 'visualizer',
      title: 'Data Visualizer',
      description: 'Create beautiful charts for presentations! Perfect for students - paste data, pick chart, download',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      gradient: 'from-cyan-500 to-blue-600',
      category: 'Create'
    },
    {
      id: 'analytics',
      title: 'Analytics Hub',
      description: 'Comprehensive insights and performance metrics for all your digital assets',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-600',
      category: 'Analyze',
      comingSoon: true
    },
    {
      id: 'api',
      title: 'Developer API',
      description: 'Powerful REST API for seamless integration into your applications and workflows',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-600',
      category: 'Integrate',
      comingSoon: true
    }
  ];

  const stats = [
    { value: 1247892, label: 'Files Converted', suffix: '+', description: 'Processed this month' },
    { value: 84563, label: 'QR Codes Generated', suffix: '+', description: 'Active campaigns' },
    { value: 99.97, label: 'Service Uptime', suffix: '%', description: 'Last 30 days' }
  ];

  return (
    <div className="w-full h-full flex flex-col" style={{ margin: 0, padding: 0 }}>
      {/* Professional Header */}
      <header className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center animate-fade-in">
            <h1 className="font-display text-page-title mb-6">
              WiQr by G.G.
            </h1>
            
            <p className="text-subtitle max-w-4xl mx-auto mb-12">
              Digital tools for everyone! Anyone can use this for free no sign up, no ads, no tracking, no nothing!
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="badge badge-success">
                <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Trusted by 50,000+ users
              </div>
              <div className="badge badge-info">
                <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                100% Free to use
              </div>
              <div className="badge badge-warning">
                <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Lightning fast
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Security & Privacy Notice */}
          <section className="mb-16">
            <div className="glass-ultra border border-emerald-400/20 rounded-3xl p-8 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-400/10 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h3 className="text-2xl font-bold text-white"> Your Privacy is Our Priority</h3>
                      <div className="inline-flex items-center px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-emerald-300 text-sm font-semibold">100% Local Processing</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-slate-300">No database storage - everything processed locally</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-slate-300">Files processed on-device and immediately deleted</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-slate-300">Zero data collection or tracking</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="text-slate-300">Transparent - check our API at <code className="text-blue-300 bg-slate-800/50 px-2 py-1 rounded">localhost:3001</code></span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="text-slate-300">Open-source architecture you can trust</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-slate-300">Lightning-fast processing without cloud dependency</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Feature Grid */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="font-heading text-title mb-4">Powerful Tools</h2>
              <p className="text-body max-w-2xl mx-auto">
                Everything you need to transform, generate, and optimize your digital content
              </p>
            </div>
            
            <div className="grid-auto-fit">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  onClick={() => !feature.comingSoon && onNavigate(feature.id)}
                  className={`glass-panel p-8 ${
                    feature.comingSoon ? 'cursor-not-allowed opacity-60' : 'cursor-pointer card-interactive'
                  } animate-slide-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {feature.comingSoon && (
                    <div className="flex justify-between items-start mb-6">
                      <span className="badge badge-warning">Coming Soon</span>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className={`icon-container icon-lg bg-gradient-to-r ${feature.gradient} text-white`}>
                        {feature.icon}
                      </div>
                      <span className="badge badge-info text-xs">{feature.category}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-heading text-title">
                        {feature.title}
                      </h3>
                      
                      <p className="text-body leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    
                    {!feature.comingSoon && (
                      <div className="pt-4">
                        <button className="btn btn-primary btn-lg w-full">
                          Get Started
                          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* All Systems Operational Badge */}
          <section className="mb-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 glass-subtle px-8 py-4 rounded-full">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-base font-semibold text-emerald-300">All systems operational</span>
              </div>
            </div>
          </section>

          {/* Subtle Platform Statistics */}
          <section className="mb-12">
            <div className="flex flex-wrap items-center justify-center gap-8 text-center">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-stats-subtle mb-1">
                    <AnimatedCounter 
                      end={stat.value} 
                      duration={2000 + index * 200} 
                      suffix={stat.suffix}
                    />
                  </div>
                  <div className="text-xs text-neutral-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
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
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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
  );
}

export default Dashboard; 