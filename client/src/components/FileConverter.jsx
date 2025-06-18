import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function FileConverter() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
    setError(null);
    setSuccess(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    multiple: false 
  });

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file first!');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    try {
      const response = await axios.post('http://localhost:3001/convert', formData, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const originalName = file.name.split('.').slice(0, -1).join('.');
      link.setAttribute('download', `${originalName}.${format}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('File converted and download started!');
      setFile(null); // Clear the file after successful conversion
    } catch (err) {
      setError('Error during file conversion. Please try again.');
      console.error('Conversion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto p-4">
      <div
        {...getRootProps()}
        className={`p-12 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 ${
          isDragActive
            ? 'border-purple-500 bg-purple-900 bg-opacity-20'
            : 'border-gray-600 hover:border-purple-400 hover:bg-gray-800'
        }`}
      >
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p className="text-purple-300 text-lg">Drop the file here...</p> :
            <p className="text-gray-400">Drag & drop a file here, or click to select</p>
        }
      </div>
      
      {file && (
        <aside className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
          <h4 className="text-lg font-semibold text-white">Selected File:</h4>
          <p className="text-sm text-gray-300 mt-1">{file.name} - {Math.round(file.size / 1024)} KB</p>
        </aside>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-300">Convert to:</label>
          <select
            id="format"
            name="format"
            value={format}
            onChange={(e) => setFormat(e.target.value.toLowerCase())}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WEBP</option>
            <option value="gif">GIF</option>
          </select>
        </div>
        <button
          onClick={handleConvert}
          disabled={!file || isLoading}
          className="px-8 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
        >
          {isLoading ? 'Converting...' : 'Convert & Download'}
        </button>
      </div>

      {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
      {success && <p className="mt-4 text-green-400 text-center">{success}</p>}
    </section>
  );
}

export default FileConverter;
