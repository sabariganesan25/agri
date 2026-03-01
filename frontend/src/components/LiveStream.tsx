import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

interface LiveStreamProps {
  onFrame: (base64: string) => void;
  annotatedFrame: string | null;
  isHighRisk: boolean;
  connectionError?: string | null;
  stats: { sent: number; received: number; lastLatency: number; status: string };
}

export const LiveStream: React.FC<LiveStreamProps> = ({ onFrame, annotatedFrame, isHighRisk, connectionError, stats }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Enforce rear camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Explicitly call play to ensure browser doesn't throttle background video
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Play failed:", e));
          setStreamActive(true);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback to any camera if environment facing fails
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Play failed:", e));
            setStreamActive(true);
          };
        }
      } catch (e) {
        console.error("Fallback camera failed:", e);
      }
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      // Store ref value to ensure cleanup accesses the correct moment in time
      const videoElement = videoRef.current;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
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
            if (!videoReady) setVideoReady(true);

            // Performance Optimization: Shrink frame for cloud processing
            const maxDimension = 640;
            const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
            canvas.width = video.videoWidth * scale;
            canvas.height = video.videoHeight * scale;

            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              // Send JPEG base64 to backend
              // Default to a 0.5 quality to save WebSocket bandwidth on Vercel/Render
              const base64 = canvas.toDataURL('image/jpeg', 0.5);
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

        {/* Local Video Stream (Visible at 0.02 opacity to prevent browser background throttling) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ position: 'absolute', opacity: 0.02, pointerEvents: 'none', width: '100%', height: '100%' }}
        />

        {/* Annotated Overlay from YOLO Processed Frame (Main Display) */}
        {annotatedFrame ? (
          <img src={annotatedFrame} alt="Live Analyzing..." className="live-video" />
        ) : (
          <div style={{ color: 'var(--color-bg)', opacity: 0.8, textAlign: 'center', padding: '2rem' }}>
            {connectionError ? (
              <span style={{ color: 'var(--color-risk-high)' }}>⚠ {connectionError}</span>
            ) : videoReady ? (
              "Waiting for AI Analysis..."
            ) : (
              "Initializing Video Stream..."
            )}
          </div>
        )}

        {/* High Risk Alert Flash */}
        {isHighRisk && <div className="alert-flash"></div>}

        {/* Debug Telemetry Overlay */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: stats.status === 'CONNECTED' ? '#00ff00' : '#ffff00',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace',
          zIndex: 10,
          pointerEvents: 'none',
          lineHeight: '1.4'
        }}>
          <div>STATUS: {stats.status}</div>
          <div>SNT: {stats.sent} | RCV: {stats.received}</div>
          <div>LAT: {stats.lastLatency}ms</div>
          <div>{annotatedFrame ? "AI ACTIVE" : "WAITING..."}</div>
        </div>
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
