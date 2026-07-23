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
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up pb-20 relative font-tech">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-600/10 blur-[100px] pointer-events-none -z-10 rounded-full mix-blend-screen"></div>

      <div className="text-center space-y-4 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-500 to-sky-400 animate-gradient tracking-tight drop-shadow-sm">
          OPTIMIZE // COMPRESS
        </h1>
        <p className="text-lg text-sky-500/80 max-w-2xl mx-auto font-mono text-sm tracking-widest">
          <span className="text-sky-400">{'>'}</span> SYSTEM.REDUCE_FILE_SIZE(IMAGE)
          <br/>
          GUEST_ALLOCATION: 10 CONCURRENT OPERATIONS.
        </p>
      </div>

      {!user && (
        <div className="bg-sky-950/30 border border-sky-500/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between shadow-[0_0_15px_rgba(14,165,233,0.1)] backdrop-blur-md relative z-10 gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-sky-400 animate-pulse" />
            <p className="text-xs text-sky-200 font-mono tracking-widest">
              <strong className="text-sky-400">LIMIT DETECTED:</strong> AUTHENTICATE TO UNLOCK BATCH PROCESSING (20x).
            </p>
          </div>
          <Link to="/register" className="shrink-0 px-4 py-2 bg-sky-600/20 border border-sky-500/50 hover:bg-sky-600/40 text-sky-400 rounded-lg text-xs font-bold tracking-widest transition-all shadow-[0_0_10px_rgba(14,165,233,0.2)]">
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
        <div className="md:col-span-2 flex flex-col gap-6 relative z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="relative overflow-hidden border border-zinc-800/80 rounded-2xl bg-zinc-950/60 backdrop-blur-xl p-10 flex flex-col items-center justify-center min-h-[300px] hover:border-sky-500/50 transition-all cursor-pointer shadow-[0_0_30px_rgba(56,189,248,0.05)] group"
              onClick={() => fileInputRef.current.click()}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-sky-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity"></div>
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
              <div className="w-20 h-20 bg-sky-950/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all duration-300 border border-sky-500/30">
                <UploadCloud size={32} className="text-sky-400" />
              </div>
              <p className="text-lg font-bold text-sky-100 mb-2 font-mono tracking-widest drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                AWAITING_DATA_INPUT
              </p>
              <p className="text-xs text-sky-500/60 font-mono tracking-widest">
                [ DRAG_AND_DROP_OR_CLICK ]
              </p>
              <div className="absolute bottom-4 right-6 text-[10px] text-sky-500 font-mono font-bold opacity-60 tracking-widest">
                {files.length}/{maxFiles} ALLOCATED
              </div>
            </div>
          </div>

          {/* Queue Section Moved Here */}
          {files.length > 0 && (
            <div className="bg-zinc-950/60 backdrop-blur-xl rounded-2xl border border-sky-900/30 p-6 shadow-[0_0_30px_rgba(56,189,248,0.05)] font-mono text-xs">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-zinc-800/80">
                <h3 className="font-bold text-sky-400 tracking-widest drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]">QUEUE [{files.length}]</h3>
                <button 
                  onClick={() => {setFiles([]); setResult(null);}}
                  className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-widest border border-red-900/50 px-3 py-1.5 rounded bg-red-950/30 transition-all hover:bg-red-900/50 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                >
                  ABORT_ALL
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {files.map((file, i) => {
                  const compressedFile = result?.isSingleFiles ? result.files[i] : null;
                  return (
                    <div key={i} className={`relative group rounded-xl p-3 border transition-all ${compressedFile ? 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-zinc-900/30 border-zinc-800 hover:border-sky-500/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.1)]'}`}>
                      <button 
                        onClick={() => removeFile(i)}
                        className="absolute -top-2 -right-2 bg-zinc-900 border border-zinc-700 text-zinc-400 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-950 hover:text-red-400 hover:border-red-500 shadow-lg z-10"
                      >
                        <X size={12} />
                      </button>
                      <div className="flex flex-col items-center gap-2 text-center relative">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center relative shadow-inner">
                          {file.preview ? (
                            <img src={file.preview} alt={file.name} className={`w-full h-full object-cover ${compressedFile ? 'opacity-50 grayscale' : ''}`} />
                          ) : (
                            <FileImage className="text-sky-500/50" size={24} />
                          )}
                          {loading && !compressedFile && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-20">
                              <Loader2 className="text-sky-400 animate-spin mb-1" size={18} />
                              <span className="text-[10px] font-bold text-sky-400 tracking-widest">{progress}%</span>
                            </div>
                          )}
                          {compressedFile && (
                            <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/50 backdrop-blur-sm z-20">
                              <CheckCircle className="text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" size={24} />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 truncate w-full tracking-wider" title={file.name}>
                          {file.name}
                        </span>
                        {compressedFile ? (
                          <div className="flex flex-col items-center w-full mt-1 border-t border-zinc-800/80 pt-1">
                            <span className="text-[9px] text-zinc-600 line-through">
                              {formatBytes(file.size)}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">
                              {formatBytes(compressedFile.compressedSize)}
                            </span>
                            <span className="text-[9px] text-emerald-500 bg-emerald-950/50 border border-emerald-900/50 px-1 py-0.5 rounded mt-1 tracking-widest">
                              -{((file.size - compressedFile.compressedSize) / file.size * 100).toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-500 mt-1">
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
        <div className="space-y-6 relative z-10">
          <div className="bg-zinc-950/60 backdrop-blur-xl rounded-2xl border border-zinc-800/80 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 blur-2xl rounded-full"></div>
            <h3 className="font-bold text-white flex items-center gap-2 mb-6 font-mono tracking-widest uppercase text-xs border-b border-zinc-800/80 pb-3 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
              <Settings size={14} className="text-sky-500 animate-spin-slow" /> CONFIGURATION
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-[10px] font-bold text-zinc-400 mb-3 font-mono tracking-widest uppercase">
                  <span>COMPRESSION_LEVEL</span>
                  <span className="text-sky-400 border border-sky-900/50 bg-sky-950/30 px-2 py-0.5 rounded">{quality}%</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <p className="text-[9px] text-sky-500/50 mt-3 font-mono tracking-widest leading-relaxed uppercase">
                  // LOWER_VALUES = MAX_OPTIMIZATION, MIN_FIDELITY
                </p>
              </div>

              {files.length > 1 && (
                <div className="pt-2 border-t border-zinc-800/50 mt-4">
                  <label className="flex justify-between text-[10px] font-bold text-zinc-400 mb-3 font-mono tracking-widest uppercase mt-4">
                    <span>OUTPUT_ARCHITECTURE</span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-2 cursor-pointer text-[10px] px-3 py-2.5 rounded-lg border transition-all flex-1 justify-center ${downloadFormat === 'zip' ? 'bg-sky-950/30 border-sky-500/50 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>
                      <input 
                        type="radio" 
                        name="format" 
                        value="zip"
                        checked={downloadFormat === 'zip'} 
                        onChange={(e) => setDownloadFormat(e.target.value)} 
                        className="hidden"
                      />
                      <span className="font-mono font-bold tracking-widest">ARCHIVE_ZIP</span>
                    </label>
                    <label className={`flex items-center gap-2 cursor-pointer text-[10px] px-3 py-2.5 rounded-lg border transition-all flex-1 justify-center ${downloadFormat === 'single' ? 'bg-sky-950/30 border-sky-500/50 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>
                      <input 
                        type="radio" 
                        name="format" 
                        value="single"
                        checked={downloadFormat === 'single'} 
                        onChange={(e) => setDownloadFormat(e.target.value)} 
                        className="hidden"
                      />
                      <span className="font-mono font-bold tracking-widest">SINGLE_FILES</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={compressImages}
              disabled={files.length === 0 || loading}
              className="mt-8 w-full py-4 bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 rounded-xl font-bold shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-[0.2em] border border-sky-500/50 text-xs"
            >
              {loading ? (
                <span className="animate-pulse">EXECUTING...</span>
              ) : (
                <span>RUN_OPTIMIZER</span>
              )}
            </button>
          </div>

          {result && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-fade-in-up font-mono relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl"></div>
              
              <div className="flex items-center gap-3 mb-6 border-b border-emerald-500/30 pb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <h3 className="font-bold text-xs tracking-widest uppercase text-emerald-300 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">TASK.COMPLETE</h3>
              </div>
              
              <div className="space-y-3 mb-8 text-[10px] sm:text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-500/60 tracking-widest">RAW_SIZE:</span>
                  <span className="font-bold text-emerald-100">{formatBytes(result.totalOriginal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-500/60 tracking-widest">NEW_SIZE:</span>
                  <span className="font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">{formatBytes(result.totalCompressed)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-emerald-500/30 text-emerald-300">
                  <span className="text-emerald-500/80 tracking-widest">EFFICIENCY:</span>
                  <span className="font-bold text-base drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">{result.savings}%</span>
                </div>
              </div>

              {result.isSingleFiles ? (
                <div className="space-y-2 mt-6 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {result.files.map((file, idx) => (
                    <a 
                      key={idx} 
                      href={file.url} 
                      download={file.filename}
                      className="w-full py-3 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 hover:border-emerald-500/70 text-emerald-400 rounded-lg text-[10px] font-bold transition-all flex justify-between items-center px-4 tracking-wider hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    >
                      <span className="truncate max-w-[160px]">{file.filename}</span>
                      <Download size={14} className="opacity-70" />
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
                    className="w-full mt-4 py-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all flex justify-center items-center gap-2 tracking-widest border border-emerald-500/50 text-[10px]"
                  >
                    <Download size={14} /> FETCH_ALL_FILES
                  </button>
                </div>
              ) : (
                <a 
                  href={result.url} 
                  download={result.filename}
                  className="w-full py-4 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-400 rounded-xl font-bold transition-all flex justify-center items-center gap-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-6 text-xs tracking-[0.15em]"
                >
                  <Download size={16} /> FETCH_DATA_ARCHIVE
                </a>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
