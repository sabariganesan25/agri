import os
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from processor import VideoProcessor
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "AgriScan AI Engine",
        "version": "1.2.0",
        "endpoints": ["/ws/stream", "/health"]
    }

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": time.time()}

# Initialize processor globally
processor = VideoProcessor("model/agridrone_best.pt")

# Initialize Gemini if API key present
api_key = os.getenv("GEMINI_API_KEY")
llm_client = genai.Client(api_key=api_key) if api_key else None

def get_llm_advisory(diseases, language="English"):
    if not llm_client:
        return f"LLM API Key missing. Please set GEMINI_API_KEY environment variable. Detected: {', '.join(diseases)}"
        
    prompt = f"""
    You are an expert agricultural advisor watching a live crop stream. The following objects/conditions have been detected right now: {', '.join(diseases)}.
    Provide a structured, short, and actionable observation for the farmer in {language}.
    If it is a healthy crop, assure them it looks good. If it's a disease, provide quick advice. 
    Keep it under 3 sentences. Be highly practical and use simple terms.
    """
    
    try:
        response = llm_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
    except Exception as e:
        print(f"LLM Error: {e}")
        return f"Error fetching observation for {', '.join(diseases)}. Please check your connectivity."


@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connection established")
    
    # Send an initial message to confirm backend is ready
    await websocket.send_json({"status": "ready", "message": "Backend AI Engine Connected"})
    
    language = "English"

    try:
        while True:
            try:
                data = await websocket.receive_text()
                payload = json.loads(data)
                
                # Check for ping
                if payload.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                    continue

                if "language" in payload:
                    language = payload["language"]
                    
                if "frame" in payload:
                    base64_frame = payload["frame"]
                    
                    if not base64_frame or len(base64_frame) < 50:
                        continue # Skip empty frames
                    
                    # Process the frame (YOLO inference)
                    # VideoProcessor will maintain frame skipping internally
                    result = await asyncio.to_thread(processor.process_frame, base64_frame)
                    
                    if result[0] is None:
                        continue
                        
                    processed_frame, detections, trigger_llm, detected_diseases = result
                    
                    advisory_text = None
                    if trigger_llm and detected_diseases:
                        # Fetch LLM conditionally
                        advisory_text = await asyncio.to_thread(get_llm_advisory, detected_diseases, language)
                    
                    response_payload = {
                        "frame": processed_frame,
                        "detections": detections,
                        "debug": f"Processed frame in {self.processor.frame_count}" if hasattr(self, 'processor') else "Analysis complete"
                    }
                    
                    if advisory_text:
                        response_payload["advisory"] = advisory_text
                    
                    await websocket.send_json(response_payload)
                else:
                    await websocket.send_json({"debug": "Frame ignored by processor (skip_frames or empty)"})
            except WebSocketDisconnect:
                print("Client disconnected gracefully.")
                break
            except Exception as e:
                print(f"Skipping bad frame or internal error: {e}")
                await websocket.send_json({"debug": f"error: {str(e)}"})

    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket Setup Error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
