import { Volume2, AlertTriangle, Info } from 'lucide-react';

interface Detection {
    class: string;
    confidence: number;
    metadata: {
        risk: string;
        emoji: string;
        category: string;
    };
}

interface AdvisoryPanelProps {
    detections: Detection[];
    advisory: string | null;
    language: string;
}

export const AdvisoryPanel: React.FC<AdvisoryPanelProps> = ({ detections, advisory, language }) => {

    const speakAdvisory = () => {
        if (!advisory) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // stop current speaking
            const utterance = new SpeechSynthesisUtterance(advisory);

            // Attempt to map language string to standard lang codes
            switch (language) {
                case "Hindi": utterance.lang = "hi-IN"; break;
                case "Tamil": utterance.lang = "ta-IN"; break;
                case "Telugu": utterance.lang = "te-IN"; break;
                case "Marathi": utterance.lang = "mr-IN"; break;
                default: utterance.lang = "en-US";
            }

            window.speechSynthesis.speak(utterance);
        } else {
            alert("Text-to-speech is not supported in this browser.");
        }
    };

    const highRiskCount = detections.filter(d => d.metadata.risk === 'HIGH').length;

    return (
        <div className="side-panel">
            <div className="panel-card">
                <h2 className="panel-title">Real-Time Detections</h2>

                <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                    <div className="stat-item">
                        <div className="stat-value">{detections.length}</div>
                        <div className="stat-label">Objects tracked</div>
                    </div>
                    <div className="stat-item" style={{ backgroundColor: highRiskCount > 0 ? '#FFEBEE' : 'var(--color-bg)' }}>
                        <div className="stat-value" style={{ color: highRiskCount > 0 ? 'var(--color-risk-high)' : 'inherit' }}>
                            {highRiskCount}
                        </div>
                        <div className="stat-label">High Risk</div>
                    </div>
                </div>

                {detections.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem 0' }}>
                        <Info size={24} style={{ margin: '0 auto', marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p>Scanning field area...</p>
                    </div>
                ) : (
                    <div className="detections-list">
                        {detections.map((det, idx) => (
                            <div key={idx} className={`detection-item risk-${det.metadata.risk}`}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{det.metadata.emoji}</span>
                                    <div>
                                        <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                            {det.class.replace(/_/g, ' ')}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                                            {det.metadata.category}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontWeight: 700,
                                        color: det.metadata.risk === 'HIGH' ? 'var(--color-risk-high)'
                                            : det.metadata.risk === 'MEDIUM' ? 'var(--color-risk-medium)'
                                                : 'var(--color-risk-low)'
                                    }}>
                                        {det.metadata.risk} RISK
                                    </div>
                                    <div style={{ fontSize: '0.875rem' }}>
                                        {(det.confidence * 100).toFixed(1)}% conf
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="panel-card" style={{ flex: 1 }}>
                <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={20} color="var(--color-amber)" />
                    AI Field Advisory
                </h2>

                {advisory ? (
                    <div>
                        <div className="advisory-text">
                            {advisory}
                        </div>
                        <button className="speaker-btn" onClick={speakAdvisory}>
                            <Volume2 size={18} /> Speak Advisory
                        </button>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem 0' }}>
                        <p>Waiting for high-risk detection to generate advisory...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
