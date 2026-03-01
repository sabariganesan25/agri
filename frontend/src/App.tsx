import { useState, useEffect, useRef, useCallback } from 'react';
import { Leaf } from 'lucide-react';
import { LiveStream } from './components/LiveStream';
import { AdvisoryPanel } from './components/AdvisoryPanel';

const LANGUAGES = ["English", "Hindi", "Tamil", "Telugu", "Marathi"];

interface Detection {
  class: string;
  confidence: number;
  box: number[];
  metadata: {
    risk: string;
    emoji: string;
    color: number[];
    category: string;
  };
}

function App() {
  const [language, setLanguage] = useState("English");
  const [annotatedFrame, setAnnotatedFrame] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [advisory, setAdvisory] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [stats, setStats] = useState({ sent: 0, received: 0, lastLatency: 0 });

  const wsRef = useRef<WebSocket | null>(null);
  const lastFrameTime = useRef<number>(0);

  // Initialize WebSocket connection
  useEffect(() => {
    let isMounted = true;
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      if (!isMounted) return;

      try {
        // Hardcode the known Render WSS URL to bypass Vercel environment variable bugs for the judges
        const wsUrl = import.meta.env.VITE_WS_URL || 'wss://agriyolo.onrender.com/ws/stream';
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isMounted) {
            ws?.close();
            return;
          }
          console.log("WebSocket Connected");
          setConnectionError(null);
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);

            if (data.frame) {
              setAnnotatedFrame(data.frame);
              setStats(prev => ({
                ...prev,
                received: prev.received + 1,
                lastLatency: Date.now() - lastFrameTime.current
              }));
            }
            if (data.detections) {
              setDetections(data.detections);
            }
            if (data.advisory) {
              setAdvisory(data.advisory);
              // Auto-speak new advisory
              if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(data.advisory);
                window.speechSynthesis.speak(utterance);
              }
            }
          } catch (e) {
            console.error("Error parsing WebSocket message:", e);
          }
        };

        ws.onclose = (event) => {
          if (isMounted) {
            console.log(`WebSocket Disconnected (Code: ${event.code}). Reconnecting in 3s...`);
            clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket Error - Check if backend is running", error);
          setConnectionError(`Connection failed: Cannot reach backend at ${wsUrl}`);
        };

        wsRef.current = ws;
      } catch (err) {
        console.error("WebSocket construction failed:", err);
      }
    };

    // Slight delay before first connection to allow browser to settle
    reconnectTimeout = setTimeout(connect, 500);

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      if (ws) {
        // Prevent onclose handle from firing a reconnect
        ws.onclose = null;
        ws.close();
      }
    };
  }, []);

  // Handle outgoing frames
  const handleFrame = useCallback((base64: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      lastFrameTime.current = Date.now();
      wsRef.current.send(JSON.stringify({
        frame: base64,
        language: language
      }));
      setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
    }
  }, [language]);

  const isHighRisk = detections.some(d => d.metadata.risk === 'HIGH');

  return (
    <>
      <header className="header">
        <h1>
          <Leaf color="var(--color-leaf-light)" />
          AgriScan AI
        </h1>
        <select
          className="language-selector"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </header>

      <main className="main-container">
        <LiveStream
          onFrame={handleFrame}
          annotatedFrame={annotatedFrame}
          isHighRisk={isHighRisk}
          connectionError={connectionError}
          stats={stats}
        />

        <AdvisoryPanel
          detections={detections}
          advisory={advisory}
          language={language}
        />
      </main>
    </>
  );
}

export default App;
