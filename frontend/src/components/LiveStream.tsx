import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

interface LiveStreamProps {
  onFrame: (base64: string) => void;
  annotatedFrame: string | null;
  isHighRisk: boolean;
}

export const LiveStream: React.FC<LiveStreamProps> = ({ onFrame, annotatedFrame, isHighRisk }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Enforce rear camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback to any camera if environment facing fails
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (e) {
        console.error("Fallback camera failed:", e);
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let interval: number;
    if (streamActive) {
      interval = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          // Only draw if video is actually playing, has dimensions, and is ready
          if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              // Send JPEG base64 to backend
              const base64 = canvas.toDataURL('image/jpeg', 0.6);
              onFrame(base64);
            }
          }
        }
      }, 450) as unknown as number; // Capture every ~450ms
    }
    return () => clearInterval(interval);
  }, [streamActive, onFrame]);

  return (
    <div className="video-section">
      <div className="video-header">
        <div className="scan-status">
          <div className="scan-pulse"></div>
          {streamActive ? "Live Scanning Active" : "Initializing Camera..."}
        </div>
        <button className="btn" onClick={startCamera}>
          <RefreshCw size={16} /> Reconnect
        </button>
      </div>

      <div className="video-container">
        {/* Hidden canvas for extraction and hidden video for capturing */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Local Video Stream (Hidden visually, used only for capture) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '100%', height: '100%' }}
        />

        {/* Annotated Overlay from YOLO Processed Frame (Main Display) */}
        {annotatedFrame ? (
          <img src={annotatedFrame} alt="Live Analyzing..." className="live-video" />
        ) : (
          <div style={{ color: 'var(--color-bg)', opacity: 0.5 }}>Initializing Video Stream...</div>
        )}

        {/* High Risk Alert Flash */}
        {isHighRisk && <div className="alert-flash"></div>}
      </div>

      <div className="controls-row">
        <span style={{ color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
          <Camera size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          Rear Camera - Continuous Stream
        </span>
      </div>
    </div>
  );
};
