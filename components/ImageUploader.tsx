import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload, X, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  t: any; // Translation object
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, t }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Attach stream to video element when camera opens and ref becomes available
  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(t.cameraPermissionDenied);
      } else if (err.name === 'NotFoundError') {
        setError(t.cameraNotFound);
      } else {
        setError(t.cameraError);
      }
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1); // Mirror the image
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        onImageSelected(base64);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm transition-all">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-200 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!isCameraOpen ? (
        <div className="flex flex-col gap-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold text-white">{t.uploadTitle}</h3>
            <p className="text-slate-400 text-sm mt-1">{t.uploadDesc}</p>
          </div>

          <button
            onClick={startCamera}
            className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-medium group"
          >
            <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
            {t.takePhoto}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-600"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">{t.or}</span>
            <div className="flex-grow border-t border-slate-600"></div>
          </div>

          <label className="flex items-center justify-center gap-3 w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all cursor-pointer font-medium border border-slate-600 border-dashed hover:border-slate-400">
            <Upload className="w-6 h-6" />
            {t.uploadGallery}
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl bg-black aspect-[3/4] shadow-2xl ring-1 ring-white/10">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <button 
            onClick={stopCamera}
            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-10">
             <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 transition-all active:scale-95 shadow-lg"
            >
              <div className="w-12 h-12 bg-white rounded-full shadow-inner"></div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;