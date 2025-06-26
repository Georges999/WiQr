import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function DataVisualizer({ onBack }) {
  const [rawData, setRawData] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [colorTheme, setColorTheme] = useState('professional');
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [generatedChart, setGeneratedChart] = useState(null);
  const [savedCharts, setSavedCharts] = useState([]);
  const [chartTitle, setChartTitle] = useState('');
  const chartRef = useRef(null);
  // Color themes
  const themes = {
    professional: ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
    vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'],
    minimal: ['#6B7280', '#9CA3AF', '#4B5563', '#374151', '#1F2937', '#111827']
  };

  // Smart data parsing - supports multiple formats
  const parseData = (input) => {
    if (!input.trim()) return null;
    
    try {
      // Try to parse as JSON first
      if (input.trim().startsWith('[') || input.trim().startsWith('{')) {
        const jsonData = JSON.parse(input);
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          const headers = Object.keys(jsonData[0]);
          const rows = jsonData.map(item => 
            headers.map(h => {
              const value = item[h];
              // Keep numbers as numbers, strings as strings
              return value;
            })
          );
          console.log('JSON parsed:', { headers, rows }); // Debug log
          return { headers, rows };
        }
      }

      // Parse as CSV/TSV with flexible separators
      const lines = input.trim().split(/\r?\n/);
      if (lines.length < 1) {
        throw new Error('Need at least 1 line of data');
      }

      // Auto-detect separator
      const firstLine = lines[0];
      const separators = [',', '\t', ';', '|'];
      let separator = ',';
      let maxColumns = 0;
      
      for (const sep of separators) {
        const columns = firstLine.split(sep).length;
        if (columns > maxColumns) {
          maxColumns = columns;
          separator = sep;
        }
      }

      // If only one line, treat as simple labels
      if (lines.length === 1) {
        const labels = firstLine.split(separator).map(item => item.trim());
        return {
          headers: ['Category', 'Value'],
          rows: labels.map((label, index) => [label, index + 1])
        };
      }

             // Parse with detected separator
       const allRows = lines.map(line => 
         line.split(separator).map(cell => {
           const trimmed = cell.trim().replace(/^["']|["']$/g, ''); // Remove quotes
           // Better number parsing
           if (trimmed === '') return '';
           const num = parseFloat(trimmed.replace(/,/g, '')); // Remove commas from numbers
           return isNaN(num) ? trimmed : num;
         })
       );

      // Auto-detect if first row is headers
      const firstRow = allRows[0];
      const hasStringHeaders = firstRow.some(cell => isNaN(parseFloat(cell)) && typeof cell === 'string');
      
      if (hasStringHeaders) {
        // First row is headers
        return {
          headers: firstRow,
          rows: allRows.slice(1)
        };
      } else {
        // No headers, generate them
        const numCols = firstRow.length;
        const headers = numCols === 2 ? ['Category', 'Value'] : 
                       Array.from({length: numCols}, (_, i) => `Column ${i + 1}`);
        return {
          headers,
          rows: allRows
        };
      }
    } catch {
      throw new Error('Could not parse data. Try CSV format, JSON array, or simple list of values.');
    }
  };

  // Generate chart data for Chart.js
  const generateChartData = (useChartData = null) => {
    // Use provided chart data or current parsed data
    const dataToUse = useChartData || parsedData;
    if (!dataToUse) return null;

    const { headers, rows } = dataToUse;
    const theme = themes[colorTheme];
    
    console.log('Generating chart with data:', { headers, rows, chartType }); // Debug log
    
    if (chartType === 'pie') {
      const labels = rows.map(row => String(row[0] || 'Unknown'));
      const values = rows.map((row, index) => {
        const val = row[1];
        console.log(`Row ${index}:`, row, 'Value extracted:', val, 'Type:', typeof val);
        
        // Handle different value types
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const parsed = parseFloat(val.replace(/,/g, ''));
          return isNaN(parsed) ? 1 : parsed;
        }
        return 1; // Default fallback
      });
      
      console.log('Pie chart - Labels:', labels, 'Values:', values);
      
      return {
        labels,
        datasets: [{
          data: values,
          backgroundColor: theme,
          borderColor: '#ffffff',
          borderWidth: 2,
        }]
      };
    }



    // For bar and line charts
    const labels = rows.map(row => String(row[0] || 'Unknown'));
    const datasets = headers.slice(1).map((header, index) => {
      const data = rows.map((row, rowIndex) => {
        const val = row[index + 1];
        console.log(`Bar/Line Row ${rowIndex}, Col ${index + 1}:`, val, 'Type:', typeof val);
        
        // Handle different value types
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const parsed = parseFloat(val.replace(/,/g, ''));
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0; // Default fallback
      });
      
      console.log(`Dataset "${header}":`, data);
      
      return {
        label: header,
        data,
        backgroundColor: chartType === 'line' ? 'transparent' : theme[index % theme.length],
        borderColor: theme[index % theme.length],
        borderWidth: 2,
        fill: chartType === 'line' ? false : true,
        tension: chartType === 'line' ? 0.4 : 0,
        pointBackgroundColor: theme[index % theme.length],
        pointBorderColor: '#ffffff',
        pointRadius: chartType === 'line' ? 4 : 0,
      };
    });

    return { labels, datasets };
  };

  // Chart options
  const getChartOptions = (chartTypeOverride = null) => {
    const currentChartType = chartTypeOverride || (generatedChart ? generatedChart.type : chartType);
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500,
      },
      plugins: {
        legend: {
          labels: {
            color: '#ffffff',
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
        },
        title: {
          display: true,
          text: generatedChart ? generatedChart.title : chartTitle,
          color: '#ffffff',
          font: { size: 16, weight: 'bold' }
        }
      },
      scales: currentChartType === 'pie' ? {} : {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#ffffff' }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: { color: '#ffffff' },
          beginAtZero: true
        }
      }
    };
  };

  // Render actual chart
  const renderChart = () => {
    if (!generatedChart) {
      return (
        <div className="h-full flex items-center justify-center text-slate-400">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>Generate your chart to see it here!</p>
          </div>
        </div>
      );
    }

    // Use the data from the generated chart, not current parsedData
    const chartData = generateChartData(generatedChart.data);
    if (!chartData) return null;

    const props = {
      ref: chartRef,
      data: chartData,
      options: getChartOptions(generatedChart.type),
      height: 300,
      key: generatedChart.refreshKey // Force re-render when chart changes
    };

    switch (generatedChart.type) {
      case 'line':
        return <Line {...props} />;
      case 'pie':
        return <Pie {...props} />;
      default:
        return <Bar {...props} />;
    }
  };

  // Load saved charts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wiqr-saved-charts');
    if (saved) {
      setSavedCharts(JSON.parse(saved));
    }
  }, []);

  const handleDataChange = (value) => {
    setRawData(value);
    setError('');
    
    if (value.trim()) {
      try {
        const parsed = parseData(value);
        console.log('Parsed data:', parsed); // Debug log
        setParsedData(parsed);
      } catch (err) {
        console.error('Parse error:', err); // Debug log
        setError(err.message);
        setParsedData(null);
      }
    } else {
      setParsedData(null);
    }
  };

  const generateChart = () => {
    if (!parsedData || !chartTitle.trim()) return;
    
    // Force a fresh chart generation with current data
    const chart = {
      id: Date.now(),
      title: chartTitle,
      data: { ...parsedData }, // Create a fresh copy
      type: chartType,
      theme: colorTheme,
      createdAt: new Date().toISOString(),
      // Add a refresh key to force re-render
      refreshKey: Date.now()
    };
    
    setGeneratedChart(chart);
  };

  const saveChart = () => {
    if (!generatedChart) return;
    
    const newSavedCharts = [...savedCharts, generatedChart];
    setSavedCharts(newSavedCharts);
    localStorage.setItem('wiqr-saved-charts', JSON.stringify(newSavedCharts));
  };

  const loadChart = (chart) => {
    setChartTitle(chart.title);
    setParsedData(chart.data);
    setChartType(chart.type);
    setColorTheme(chart.theme);
    setGeneratedChart(chart);
    
    // Reconstruct raw data from parsed data
    const headers = chart.data.headers.join(',');
    const rows = chart.data.rows.map(row => row.join(',')).join('\n');
    setRawData(headers + '\n' + rows);
  };

  const deleteChart = (chartId) => {
    const newSavedCharts = savedCharts.filter(chart => chart.id !== chartId);
    setSavedCharts(newSavedCharts);
    localStorage.setItem('wiqr-saved-charts', JSON.stringify(newSavedCharts));
  };

  // Download chart as PNG
  const downloadChart = () => {
    if (!chartRef.current) return;
    
    const canvas = chartRef.current.canvas;
    const link = document.createElement('a');
    link.download = `${chartTitle || 'chart'}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };



  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header */}
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
          
          <div className="text-center">
            <h1 className="font-display text-page-title mb-4">Data Visualizer</h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Perfect for students! Paste your data, pick a chart, download for presentations 📊
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Saved Charts */}
          {savedCharts.length > 0 && (
            <div className="glass-ultra rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">📚</span>
                Your Saved Charts ({savedCharts.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCharts.map((chart) => (
                  <div key={chart.id} className="glass-minimal rounded-xl p-4 border border-white/20">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-white truncate">{chart.title}</h4>
                      <button
                        onClick={() => deleteChart(chart.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="text-sm text-slate-400 mb-3">
                      <div>{chart.type} chart • {chart.theme} theme</div>
                      <div>{chart.data.rows.length} rows of data</div>
                      <div className="text-xs mt-1">
                        {new Date(chart.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => loadChart(chart)}
                      className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-all"
                    >
                      Load Chart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Input */}
          <div className="glass-ultra rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">📋</span>
              Step 1: Paste Your Data
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Chart Title</label>
                  <input
                    type="text"
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    placeholder="My Awesome Chart"
                    className="w-full p-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      const csvData = 'Category,Value\nApples,23\nBananas,17\nOranges,31\nGrapes,12';
                      setRawData(csvData);
                      handleDataChange(csvData);
                    }}
                    className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm transition-all"
                  >
                    📊 Sample CSV
                  </button>
                  <button
                    onClick={() => {
                      const jsonData = '[{"product":"Laptops","sales":45},{"product":"Phones","sales":67},{"product":"Tablets","sales":23}]';
                      setRawData(jsonData);
                      handleDataChange(jsonData);
                    }}
                    className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm transition-all"
                  >
                    🔗 Sample JSON
                  </button>
                  <button
                    onClick={() => {
                      const listData = 'Red, Blue, Green, Yellow, Purple';
                      setRawData(listData);
                      handleDataChange(listData);
                    }}
                    className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm transition-all"
                  >
                    📝 Simple List
                  </button>
                </div>

                <textarea
                  value={rawData}
                  onChange={(e) => handleDataChange(e.target.value)}
                  placeholder="📋 Flexible data input! Try any format:

🗂️ CSV/TSV: Category,Values
Math,85
Science,92

🔗 JSON Array: Click sample buttons above

📝 Simple list: Red, Blue, Green, Yellow

📊 Numbers only: 10,25,30,15,40

Auto-detects your format!"
                  className="w-full h-48 p-4 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all resize-none font-mono text-sm"
                />
              </div>
              
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
                  {error}
                </div>
              )}
              
              <div className="text-sm text-slate-400">
                💡 <strong>Tips:</strong> Separate columns with commas or tabs. First row should be headers.
              </div>
            </div>
          </div>

          {/* Chart Selection */}
          <div className="glass-ultra rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">📊</span>
              Step 2: Choose Chart Type
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: 'bar', icon: '📊', name: 'Bar Chart', desc: 'Compare values' },
                { type: 'line', icon: '📈', name: 'Line Chart', desc: 'Show trends' },
                { type: 'pie', icon: '🥧', name: 'Pie Chart', desc: 'Show parts' }
              ].map(({ type, icon, name, desc }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`p-6 rounded-xl text-center transition-all ${
                    chartType === type
                      ? 'bg-blue-500/30 border-2 border-blue-400 text-white'
                      : 'glass-minimal border border-white/20 text-slate-300 hover:glass-frosted hover:text-white'
                  }`}
                >
                  <div className="text-4xl mb-2">{icon}</div>
                  <div className="font-bold text-lg">{name}</div>
                  <div className="text-sm opacity-80">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Themes */}
          <div className="glass-ultra rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">🎨</span>
              Step 3: Pick Colors
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(themes).map(([themeKey, colors]) => (
                <button
                  key={themeKey}
                  onClick={() => setColorTheme(themeKey)}
                  className={`p-6 rounded-xl text-center transition-all ${
                    colorTheme === themeKey
                      ? 'bg-blue-500/30 border-2 border-blue-400'
                      : 'glass-minimal border border-white/20 hover:glass-frosted'
                  }`}
                >
                  <div className="flex justify-center space-x-2 mb-3">
                    {colors.slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="font-bold text-white capitalize">{themeKey}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Chart */}
          {parsedData && (
            <div className="glass-ultra rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">⚡</span>
                Step 4: Generate Your Chart
              </h3>
              
              <div className="text-center space-y-6">
                <div className="text-slate-300">
                  Ready to create your chart with {parsedData.rows.length} data rows!
                  <div className="text-sm mt-2 text-slate-400">
                    Data preview: {parsedData.headers.join(', ')}
                  </div>
                </div>
                
                <button
                  onClick={generateChart}
                  disabled={!chartTitle.trim()}
                  className={`px-12 py-4 rounded-xl font-bold text-lg transition-all ${
                    chartTitle.trim()
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="mr-2">🚀</span>
                  Generate Chart
                </button>
                
                {!chartTitle.trim() && (
                  <p className="text-sm text-slate-400">Please enter a chart title first</p>
                )}
              </div>
            </div>
          )}

          {/* Chart Preview */}
          {generatedChart && (
            <div className="glass-ultra rounded-3xl p-8 shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <span className="text-3xl mr-3">📊</span>
                  {generatedChart.title}
                </h3>
                <button
                  onClick={saveChart}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center"
                >
                  <span className="mr-2">💾</span>
                  Save Chart
                </button>
              </div>
              
              <div className="h-80 bg-slate-800/50 rounded-xl p-4 mb-8">
                {renderChart()}
              </div>
              
              {/* Download Options */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={downloadChart}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center"
                >
                  <span className="mr-2">🖼️</span>
                  Download PNG
                </button>
                
                <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold opacity-50 cursor-not-allowed flex items-center justify-center">
                  <span className="mr-2">🎬</span>
                  Download GIF (Coming Soon)
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DataVisualizer; 