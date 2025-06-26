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
  const [currentStep, setCurrentStep] = useState(1);
  const [rawData, setRawData] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [colorTheme, setColorTheme] = useState('professional');
  const [parsedData, setParsedData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({
    labels: '',
    values: [],
    categories: ''
  });
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

  // Generate chart data using column mapping
  const generateChartData = () => {
    if (!parsedData || !columnMapping.labels) return null;

    const { headers, rows } = parsedData;
    const theme = themes[colorTheme];
    
    const labelColumnIndex = headers.indexOf(columnMapping.labels);
    if (labelColumnIndex === -1) return null;

    if (chartType === 'pie') {
      if (!columnMapping.values.length) return null;
      
      const valueColumnIndex = headers.indexOf(columnMapping.values[0]);
      if (valueColumnIndex === -1) return null;

      const labels = rows.map(row => String(row[labelColumnIndex] || 'Unknown'));
      const values = rows.map(row => {
        const val = row[valueColumnIndex];
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const parsed = parseFloat(val.replace(/,/g, ''));
          return isNaN(parsed) ? 1 : parsed;
        }
        return 1;
      });
      
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
    if (!columnMapping.values.length) return null;

    const labels = rows.map(row => String(row[labelColumnIndex] || 'Unknown'));
    const datasets = columnMapping.values.map((valueColumn, index) => {
      const valueColumnIndex = headers.indexOf(valueColumn);
      if (valueColumnIndex === -1) return null;

      const data = rows.map(row => {
        const val = row[valueColumnIndex];
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const parsed = parseFloat(val.replace(/,/g, ''));
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      });
      
      return {
        label: valueColumn,
        data,
        backgroundColor: chartType === 'line' ? 'transparent' : theme[index % theme.length],
        borderColor: theme[index % theme.length],
        borderWidth: 2,
        fill: chartType === 'line' ? false : true,
        tension: chartType === 'line' ? 0.4 : 0,
        pointBackgroundColor: theme[index % theme.length],
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      };
    }).filter(Boolean);

    return { labels, datasets };
  };

  // Get column type (numeric, text, mixed)
  const getColumnType = (columnName) => {
    if (!parsedData) return 'unknown';
    
    const columnIndex = parsedData.headers.indexOf(columnName);
    if (columnIndex === -1) return 'unknown';
    
    const values = parsedData.rows.map(row => row[columnIndex]);
    const numericValues = values.filter(val => typeof val === 'number' || (!isNaN(parseFloat(val)) && val !== ''));
    
    if (numericValues.length === values.length) return 'numeric';
    if (numericValues.length === 0) return 'text';
    return 'mixed';
  };

  // Auto-suggest column mappings based on data types
  const autoSuggestMapping = () => {
    if (!parsedData) return;

    const { headers } = parsedData;
    const textColumns = headers.filter(h => getColumnType(h) === 'text');
    const numericColumns = headers.filter(h => getColumnType(h) === 'numeric');
    const mixedColumns = headers.filter(h => getColumnType(h) === 'mixed');
    
    // For labels, prefer text columns, then mixed, then first column
    const labelColumn = textColumns[0] || mixedColumns[0] || headers[0];
    
    // For values, prefer numeric columns only
    const valueColumns = chartType === 'pie' 
      ? [numericColumns[0] || headers[1]] 
      : numericColumns.slice(0, 3);
    
    setColumnMapping({
      labels: labelColumn,
      values: valueColumns.filter(Boolean),
      categories: textColumns[1] || ''
    });
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
      layout: {
        padding: 20
      },
      plugins: {
        legend: {
          labels: {
            color: '#1e293b', // Dark slate for visibility on light background
            font: { size: 14, weight: '500' },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          },
          position: 'bottom'
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)', // Dark background
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#3b82f6',
          borderWidth: 1,
          cornerRadius: 8,
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          padding: 12
        },
        title: {
          display: true,
          text: generatedChart ? generatedChart.title : chartTitle,
          color: '#1e293b', // Dark text for light background
          font: { size: 18, weight: 'bold' },
          padding: { top: 10, bottom: 30 }
        }
      },
      scales: currentChartType === 'pie' ? {} : {
        x: {
          grid: { 
            color: 'rgba(148, 163, 184, 0.3)', // Light gray grid
            lineWidth: 1
          },
          ticks: { 
            color: '#334155', // Dark gray text
            font: { size: 12, weight: '500' },
            padding: 8
          },
          border: {
            color: '#64748b',
            width: 2
          }
        },
        y: {
          grid: { 
            color: 'rgba(148, 163, 184, 0.3)',
            lineWidth: 1
          },
          ticks: { 
            color: '#334155',
            font: { size: 12, weight: '500' },
            padding: 8
          },
          border: {
            color: '#64748b',
            width: 2
          },
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
    const chartData = generateChartData();
    if (!chartData) return null;

    const props = {
      ref: chartRef,
      data: chartData,
      options: getChartOptions(generatedChart.type),
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

  // Handle data parsing and auto-move to step 2
  const handleDataChange = (value) => {
    setRawData(value);
    setError('');
    
    if (value.trim()) {
      try {
        const parsed = parseData(value);
        setParsedData(parsed);
        // Auto-move to step 2 and suggest mappings
        setCurrentStep(2);
        setTimeout(() => autoSuggestMapping(), 100);
      } catch (err) {
        setError(err.message);
        setParsedData(null);
        setCurrentStep(1);
      }
    } else {
      setParsedData(null);
      setCurrentStep(1);
    }
  };

  // Handle column mapping changes
  const handleMappingChange = (type, value) => {
    setColumnMapping(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleValueColumnToggle = (column) => {
    setColumnMapping(prev => ({
      ...prev,
      values: prev.values.includes(column) 
        ? prev.values.filter(v => v !== column)
        : [...prev.values, column]
    }));
  };

  const generateChart = () => {
    if (!parsedData || !chartTitle.trim() || !columnMapping.labels) return;
    
    const chart = {
      id: Date.now(),
      title: chartTitle,
      data: { ...parsedData },
      type: chartType,
      theme: colorTheme,
      mapping: { ...columnMapping },
      createdAt: new Date().toISOString(),
      refreshKey: Date.now()
    };
    
    setGeneratedChart(chart);
    setCurrentStep(3);
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
    setColumnMapping(chart.mapping || {
      labels: chart.data.headers[0],
      values: [chart.data.headers[1]],
      categories: ''
    });
    setGeneratedChart(chart);
    setCurrentStep(3);
    
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
            
            {/* Step Indicator */}
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep >= step 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-600 text-slate-400'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-12 h-1 mx-2 transition-all ${
                        currentStep > step 
                          ? 'bg-blue-500' 
                          : 'bg-slate-600'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mt-2 text-sm text-slate-400">
              <div className="flex space-x-16">
                <span className={currentStep >= 1 ? 'text-blue-300' : ''}>Paste Data</span>
                <span className={currentStep >= 2 ? 'text-blue-300' : ''}>Map Columns</span>
                <span className={currentStep >= 3 ? 'text-blue-300' : ''}>Generate Chart</span>
              </div>
            </div>
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

          {/* Step 1: Data Input */}
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
                    placeholder="Employee Data Analysis"
                    className="w-full p-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Data (CSV, JSON, or simple list)
                </label>
                <textarea
                  value={rawData}
                  onChange={(e) => handleDataChange(e.target.value)}
                  placeholder="name,age,department,salary,city&#10;John Smith,28,Engineering,75000,New York&#10;Sarah Johnson,32,Marketing,68000,Los Angeles&#10;..."
                  className="w-full h-48 p-4 bg-slate-800/80 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all font-mono text-sm resize-y"
                />
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-blue-300 font-medium mb-2">💡 Quick Tips:</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• CSV format works best: name,age,salary</li>
                  <li>• Include headers for clear column names</li>
                  <li>• Mix text and numbers freely</li>
                  <li>• Example: departments (text), salaries (numbers)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2: Column Mapping */}
          {currentStep >= 2 && parsedData && (
            <div className="glass-ultra rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">🎯</span>
                Step 2: Choose Your Columns
              </h3>
              
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-300 text-sm mb-2">
                    <strong>Detected {parsedData.headers.length} columns:</strong> {parsedData.headers.join(', ')}
                  </p>
                  <div className="text-xs text-blue-200">
                    <strong>💡 Example:</strong> Use "name" or "department" for labels, "salary" or "age" for values
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Labels Column */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      📊 Labels (X-axis / Categories)
                    </label>
                    <select
                      value={columnMapping.labels}
                      onChange={(e) => handleMappingChange('labels', e.target.value)}
                      className="w-full p-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                    >
                      <option value="">Choose labels column...</option>
                      {parsedData.headers.map(header => (
                        <option key={header} value={header}>
                          {header} ({getColumnType(header)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chart Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      📈 Chart Type
                    </label>
                    <select
                      value={chartType}
                      onChange={(e) => {
                        setChartType(e.target.value);
                        autoSuggestMapping();
                      }}
                      className="w-full p-3 bg-slate-800/80 border border-slate-600 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
                    >
                      <option value="bar">📊 Bar Chart</option>
                      <option value="line">📈 Line Chart</option>
                      <option value="pie">🥧 Pie Chart</option>
                    </select>
                  </div>
                </div>

                {/* Values Columns */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    📏 Values ({chartType === 'pie' ? 'single numeric value for pie slices' : 'numeric Y-axis data'})
                  </label>
                  
                  {/* Show warning if no numeric columns */}
                  {parsedData.headers.filter(h => getColumnType(h) === 'numeric').length === 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ <strong>No numeric columns detected!</strong> Charts need numeric data for values. Make sure your data includes numbers for proper visualization.
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {parsedData.headers.map(header => {
                      const isSelected = columnMapping.values.includes(header);
                      const columnType = getColumnType(header);
                      const isNumeric = columnType === 'numeric';
                      const isDisabled = !isNumeric || (chartType === 'pie' && columnMapping.values.length > 0 && !isSelected);
                      
                      return (
                        <button
                          key={header}
                          onClick={() => {
                            if (isDisabled) return;
                            if (chartType === 'pie') {
                              handleMappingChange('values', [header]);
                            } else {
                              handleValueColumnToggle(header);
                            }
                          }}
                          disabled={isDisabled}
                          className={`p-3 rounded-xl text-sm font-medium transition-all border-2 ${
                            isSelected
                              ? 'bg-blue-500/30 border-blue-400 text-blue-200'
                              : isNumeric
                              ? 'bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50'
                              : 'bg-slate-800/50 border-slate-700 text-slate-400 opacity-50 cursor-not-allowed'
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="font-medium">{header}</div>
                          <div className="text-xs opacity-75">
                            {isNumeric ? '🔢' : '📝'} {columnType}
                            {!isNumeric && <span className="block text-red-400">Not for charts</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {chartType === 'pie' && (
                      <p className="text-sm text-slate-400">
                        💡 Pie charts need exactly one numeric column for slice sizes
                      </p>
                    )}
                    {chartType !== 'pie' && (
                      <p className="text-sm text-slate-400">
                        💡 Select one or more numeric columns to plot on Y-axis
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      ⚡ Only numeric columns (🔢) can be used as values. Text columns (📝) are for labels only.
                    </p>
                  </div>
                </div>

                {/* Color Theme */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    🎨 Color Theme
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(themes).map(([themeName, colors]) => (
                      <button
                        key={themeName}
                        onClick={() => setColorTheme(themeName)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          colorTheme === themeName
                            ? 'border-blue-400 bg-blue-500/20'
                            : 'border-slate-600 bg-slate-700/30 hover:bg-slate-600/30'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex space-x-1">
                            {colors.slice(0, 4).map((color, i) => (
                              <div
                                key={i}
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span className="text-white font-medium capitalize">{themeName}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateChart}
                  disabled={!columnMapping.labels || !columnMapping.values.length || !chartTitle.trim()}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:hover:scale-100"
                >
                  🚀 Generate Chart
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Generated Chart */}
          {currentStep >= 3 && generatedChart && (
            <div className="glass-ultra rounded-3xl p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <span className="text-3xl mr-3">🎉</span>
                  Your Chart: {generatedChart.title}
                </h3>
                
                <div className="flex space-x-3">
                  <button
                    onClick={saveChart}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg font-medium transition-all"
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={downloadChart}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg font-medium transition-all"
                  >
                    📥 Download PNG
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg font-medium transition-all"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
              
                             <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-8 shadow-inner border border-slate-200">
                 <div className="h-96">
                   {renderChart()}
                 </div>
               </div>
              
              <div className="mt-4 text-sm text-slate-400">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <strong>Labels:</strong> {columnMapping.labels}
                  </div>
                  <div>
                    <strong>Values:</strong> {columnMapping.values.join(', ')}
                  </div>
                  <div>
                    <strong>Data Points:</strong> {parsedData.rows.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DataVisualizer; 