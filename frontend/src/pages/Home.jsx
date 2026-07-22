import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, Settings, Download, X, AlertCircle, FileImage, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user, token } = useAuth();
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(80);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [downloadFormat, setDownloadFormat] = useState('zip');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const maxFiles = user ? 20 : 10;

  const handleFiles = (newFiles) => {
    setError('');
    setResult(null);
    const validFiles = Array.from(newFiles).filter(file => file.type.startsWith('image/'));
    validFiles.forEach(file => {
      if (!file.preview) file.preview = URL.createObjectURL(file);
    });
    
    if (files.length + validFiles.length > maxFiles) {
      setError(`Upload limit reached. You can only upload up to ${maxFiles} images.`);
      const allowedCount = maxFiles - files.length;
      setFiles(prev => [...prev, ...validFiles.slice(0, allowedCount)]);
    } else {
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setResult(null);
  };

  const compressImages = async () => {
    if (files.length === 0) return;
    
    setLoading(true);
    setProgress(0);
    setError('');
    setResult(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    formData.append('quality', quality);

    try {
      const isSingleMode = files.length > 1 && downloadFormat === 'single';

      const config = {
        responseType: isSingleMode ? 'json' : 'blob',
        headers: { },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(Math.min(percent, 90));
          }
        }
      };
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      const endpoint = isSingleMode ? '/api/images/compress?zip=false' : '/api/images/compress';
      const res = await axios.post(endpoint, formData, config);
      setProgress(100);

      if (isSingleMode) {
        const data = res.data;
        const totalOriginal = data.totalOriginalSize;
        const totalCompressed = data.totalCompressedSize;
        
        const outputFiles = data.images.map(img => {
           const byteCharacters = atob(img.base64);
           const byteNumbers = new Array(byteCharacters.length);
           for (let i = 0; i < byteCharacters.length; i++) {
               byteNumbers[i] = byteCharacters.charCodeAt(i);
           }
           const byteArray = new Uint8Array(byteNumbers);
           const blob = new Blob([byteArray], {type: img.mimeType});
           const url = window.URL.createObjectURL(blob);
           return {
              url,
              filename: `ByteSquish_compressed_${img.name}`,
              originalSize: img.originalSize,
              compressedSize: img.compressedSize
           };
        });

        setResult({
          isSingleFiles: true,
          files: outputFiles,
          totalOriginal,
          totalCompressed,
          savings: ((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(1)
        });
      } else {
        const totalOriginal = parseInt(res.headers['x-total-original-size'] || res.headers['x-original-size'] || 0);
        const totalCompressed = parseInt(res.headers['x-total-compressed-size'] || res.headers['x-compressed-size'] || 0);
        
        const blob = res.data;
        const url = window.URL.createObjectURL(blob);
        
        setResult({
          isSingleFiles: false,
          url,
          filename: files.length > 1 ? 'ByteSquish_compressed.zip' : `ByteSquish_compressed_${files[0].name}`,
          totalOriginal,
          totalCompressed,
          savings: ((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(1)
        });
      }
      
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data instanceof Blob) {
        // Parse blob error
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          setError(json.error || 'Compression failed');
        } catch(e) {
           setError('Compression failed due to an unknown error.');
        }
      } else {
        setError(err.response?.data?.error || 'Failed to compress images. Ensure server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up pb-20">
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-500 to-sky-400 animate-gradient tracking-tight drop-shadow-sm">
          OPTIMIZE // COMPRESS
        </h1>
        <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto font-tech">
          <span className="text-sky-500">{'>'}</span> SYSTEM.REDUCE_FILE_SIZE(IMAGE)
          <br/>
          Guest users allocated 10 concurrent operations.
        </p>
      </div>

      {!user && (
        <div className="bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800/50 rounded-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(14,165,233,0.1)]">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-sky-500" />
            <p className="text-sm text-sky-900 dark:text-sky-200 font-tech">
              <strong>LIMIT DETECTED:</strong> Authenticate to unlock batch processing (20x).
            </p>
          </div>
          <Link to="/register" className="shrink-0 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-bold transition-all shadow-[0_0_10px_rgba(14,165,233,0.4)]">
            INITIALIZE AUTH
          </Link>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Dropzone + Queue */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="relative overflow-hidden border border-gray-200 dark:border-zinc-700/50 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-10 flex flex-col items-center justify-center min-h-[300px] hover:border-sky-500/50 transition-all cursor-pointer shadow-2xl shadow-black/5"
              onClick={() => fileInputRef.current.click()}
            >
              <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-sky-500/30 rounded-2xl transition-colors"></div>
              {/* Scanline Animation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500/50 shadow-[0_0_15px_#0ea5e9] hidden group-hover:block animate-scan"></div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                accept="image/jpeg,image/png,image/webp" 
                className="hidden" 
                onChange={(e) => handleFiles(e.target.files)}
              />
              <div className="w-20 h-20 bg-sky-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all duration-300 border border-sky-200 dark:border-zinc-700">
                <UploadCloud size={32} className="text-sky-600 dark:text-sky-400" />
              </div>
              <p className="text-lg font-bold text-gray-800 dark:text-zinc-200 mb-2 font-tech tracking-wider">
                AWAITING_DATA_INPUT
              </p>
              <p className="text-sm text-gray-500 dark:text-zinc-500">
                [ Drag & Drop or Click to Browse ]
              </p>
              <div className="absolute bottom-4 right-6 text-xs text-sky-500 font-tech font-bold opacity-60">
                {files.length}/{maxFiles} ALLOCATED
              </div>
            </div>
          </div>

          {/* Queue Section Moved Here */}
          {files.length > 0 && (
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-zinc-800/50 p-6 shadow-xl font-tech text-sm">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="font-bold text-gray-900 dark:text-zinc-200 tracking-wider">QUEUE [{files.length}]</h3>
                <button 
                  onClick={() => {setFiles([]); setResult(null);}}
                  className="text-xs text-red-500 hover:text-red-400 uppercase tracking-widest border border-red-500/30 px-3 py-1 rounded-md bg-red-500/5 transition-colors hover:bg-red-500/20"
                >
                  Abort_All
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map((file, i) => {
                  const compressedFile = result?.isSingleFiles ? result.files[i] : null;
                  return (
                    <div key={i} className={`relative group rounded-lg p-3 border transition-colors ${compressedFile ? 'bg-green-500/5 border-green-500/30' : 'bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 hover:border-sky-500/50'}`}>
                      <button 
                        onClick={() => removeFile(i)}
                        className="absolute -top-2 -right-2 bg-zinc-800 dark:bg-zinc-700 border border-zinc-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-lg z-10"
                      >
                        <X size={14} />
                      </button>
                      <div className="flex flex-col items-center gap-2 text-center relative">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center relative">
                          {file.preview ? (
                            <img src={file.preview} alt={file.name} className={`w-full h-full object-cover ${compressedFile ? 'opacity-70' : ''}`} />
                          ) : (
                            <FileImage className="text-sky-400" size={24} />
                          )}
                          {loading && !compressedFile && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 rounded-md">
                              <Loader2 className="text-sky-400 animate-spin mb-1" size={18} />
                              <span className="text-[10px] font-bold text-sky-400">{progress}%</span>
                            </div>
                          )}
                          {compressedFile && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-[1px] rounded-md z-20">
                              <CheckCircle className="text-green-400 shadow-xl" size={28} />
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full" title={file.name}>
                          {file.name}
                        </span>
                        {compressedFile ? (
                          <div className="flex flex-col items-center w-full">
                            <span className="text-[10px] text-green-500/70 line-through">
                              {formatBytes(file.size)}
                            </span>
                            <span className="text-xs font-bold text-green-500">
                              {formatBytes(compressedFile.compressedSize)}
                            </span>
                            <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded mt-1">
                              -{((file.size - compressedFile.compressedSize) / file.size * 100).toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {formatBytes(file.size)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Settings panel */}
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-zinc-800/50 p-6 shadow-xl relative overflow-hidden">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6 font-tech tracking-wide uppercase text-sm border-b border-gray-100 dark:border-zinc-800 pb-3">
              <Settings size={16} className="text-sky-500" /> Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>Quality</span>
                  <span className="text-sky-600 dark:text-sky-400">{quality}%</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-sky-600"
                />
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-3 font-tech leading-relaxed">
                  // Lower values increase optimization but degrade visual fidelity.
                </p>
              </div>

              {files.length > 1 && (
                <div className="pt-2">
                  <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <span>Output Format</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/50 px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 hover:border-sky-500 transition-colors flex-1 justify-center">
                      <input 
                        type="radio" 
                        name="format" 
                        value="zip"
                        checked={downloadFormat === 'zip'} 
                        onChange={(e) => setDownloadFormat(e.target.value)} 
                        className="accent-sky-500"
                      />
                      <span className="font-tech font-bold text-xs uppercase">.Zip Archive</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-800/50 px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 hover:border-sky-500 transition-colors flex-1 justify-center">
                      <input 
                        type="radio" 
                        name="format" 
                        value="single"
                        checked={downloadFormat === 'single'} 
                        onChange={(e) => setDownloadFormat(e.target.value)} 
                        className="accent-sky-500"
                      />
                      <span className="font-tech font-bold text-xs uppercase">Single Files</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={compressImages}
              disabled={files.length === 0 || loading}
              className="mt-8 w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(14,165,233,0.4)] hover:shadow-[0_0_25px_rgba(14,165,233,0.6)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-tech tracking-widest border border-sky-400/30"
            >
              {loading ? (
                <span className="animate-pulse">EXECUTING...</span>
              ) : (
                <span>RUN_OPTIMIZER</span>
              )}
            </button>
          </div>

          {result && (
            <div className="bg-zinc-950 border border-green-500/30 rounded-2xl p-6 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)] animate-fade-in-up font-tech relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl"></div>
              
              <div className="flex items-center gap-3 mb-6 border-b border-green-500/20 pb-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="font-bold text-sm tracking-widest uppercase">Task.Complete</h3>
              </div>
              
              <div className="space-y-3 mb-8 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-green-500/60">RAW_SIZE:</span>
                  <span className="font-bold">{formatBytes(result.totalOriginal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-500/60">NEW_SIZE:</span>
                  <span className="font-bold text-white">{formatBytes(result.totalCompressed)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-green-500/20 text-green-300">
                  <span className="text-green-500/60">EFFICIENCY:</span>
                  <span className="font-bold text-lg">{result.savings}%</span>
                </div>
              </div>

              {result.isSingleFiles ? (
                <div className="space-y-2 mt-6 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {result.files.map((file, idx) => (
                    <a 
                      key={idx} 
                      href={file.url} 
                      download={file.filename}
                      className="w-full py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-bold transition-all flex justify-between items-center px-4 font-tech tracking-wider"
                    >
                      <span className="truncate max-w-[180px]">{file.filename}</span>
                      <Download size={14} />
                    </a>
                  ))}
                  <button 
                    onClick={() => {
                      result.files.forEach((f, idx) => {
                        setTimeout(() => {
                          const a = document.createElement('a');
                          a.href = f.url;
                          a.download = f.filename;
                          a.click();
                        }, idx * 200);
                      });
                    }} 
                    className="w-full mt-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all flex justify-center items-center gap-2 font-tech tracking-widest border border-green-400/30"
                  >
                    <Download size={16} /> DOWNLOAD_ALL_FILES
                  </button>
                </div>
              ) : (
                <a 
                  href={result.url} 
                  download={result.filename}
                  className="w-full py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl font-bold transition-all flex justify-center items-center gap-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)] mt-6"
                >
                  <Download size={16} /> DOWNLOAD_DATA
                </a>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
