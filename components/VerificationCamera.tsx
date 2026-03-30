import React, { useState, useRef, useEffect } from 'react';
import { ItemCategory } from '../types';
import { PHOTO_GUIDES, GHOST_PATHS, PhotoStep } from '../utils/PhotoRequirements';

interface VerificationCameraProps {
  category: ItemCategory;
  onPhotosCaptured: (photos: { id: string, blob: Blob }[]) => void;
  onClose: () => void;
}

export const VerificationCamera: React.FC<VerificationCameraProps> = ({ category, onPhotosCaptured, onClose }) => {
  const steps = PHOTO_GUIDES[category] || PHOTO_GUIDES[ItemCategory.OTHER];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<{ id: string, blob: Blob }[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentStep: PhotoStep = steps[currentStepIndex];
  const progress = ((currentStepIndex) / steps.length) * 100;

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, 
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access denied", err);
        setPermissionError(true);
      }
    };
    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw frame
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const newPhotos = [...capturedPhotos, { id: currentStep.id, blob }];
          setCapturedPhotos(newPhotos);

          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
          } else {
            // Finished
            onPhotosCaptured(newPhotos);
          }
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const GhostOverlay = ({ type }: { type: string }) => {
    const path = GHOST_PATHS[type as keyof typeof GHOST_PATHS] || GHOST_PATHS.generic;
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
         <svg viewBox="0 0 24 24" className="w-64 h-64 text-white fill-none stroke-current stroke-[0.5]">
            <path d={path} />
         </svg>
      </div>
    );
  };

  if (permissionError) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-6 z-50">
        <div className="text-4xl mb-4">🚫</div>
        <h2 className="text-xl font-bold mb-2">Camera Access Required</h2>
        <p className="text-center text-gray-400 mb-6">We need your camera to verify the item condition.</p>
        <button onClick={onClose} className="bg-gray-800 px-6 py-3 rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top Bar: Progress & Instruction */}
      <div className="absolute top-0 left-0 w-full p-6 pt-12 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex justify-between items-start mb-4">
           <button onClick={onClose} className="text-white text-shadow">✕ Cancel</button>
           <span className="text-white font-bold text-shadow">{currentStepIndex + 1} / {steps.length}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-700 rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{currentStep.label}</h2>
            <p className="text-gray-200 text-sm drop-shadow-md bg-black/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                {currentStep.description}
            </p>
        </div>
      </div>

      {/* Video Feed */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute min-w-full min-h-full object-cover"
        />
        
        {/* The Ghost Overlay */}
        <GhostOverlay type={currentStep.overlayType} />
        
        {/* Grid Lines for Professional Feel */}
        <div className="absolute inset-0 border border-white/10 grid grid-cols-3 grid-rows-3 pointer-events-none">
            {[...Array(9)].map((_, i) => <div key={i} className="border border-white/10" />)}
        </div>
      </div>

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full p-8 pb-12 bg-gradient-to-t from-black/90 to-transparent flex justify-center items-center">
         <button 
            onClick={handleCapture}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform group"
         >
            <div className="w-16 h-16 bg-white rounded-full group-active:bg-primary transition-colors"></div>
         </button>
      </div>
    </div>
  );
};