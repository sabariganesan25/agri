import cv2
import numpy as np
import base64
import time
from ultralytics import YOLO
from classes import CLASS_METADATA, CLASS_NAMES

class VideoProcessor:
    def __init__(self, model_path="model/agridrone_best.pt"):
        self.model = YOLO(model_path)
        self.frame_count = 0
        self.skip_frames = 5
        self.last_results = []
        
        # LLM state
        self.last_llm_call = 0
        self.llm_cooldown = 6.0
        self.high_risk_detected = False

    def process_frame(self, base64_frame):
        # Decode base64 frame
        img_data = base64.b64decode(base64_frame.split(',')[1] if ',' in base64_frame else base64_frame)
        np_arr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return None, []

        orig_h, orig_w = frame.shape[:2]
        
        self.frame_count += 1
        
        # Run inference every N frames
        if self.frame_count % self.skip_frames == 0 or not self.last_results:
            # Let YOLO handle native letterbox resizing instead of manual squashing
            results = self.model(frame, conf=0.42, iou=0.45, verbose=False)
            
            boxes = results[0].boxes
            
            current_detections = []
            
            for box in boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                
                # Bounding box is already in native original frame coordinates
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

                class_name = CLASS_NAMES[cls_id] if cls_id < len(CLASS_NAMES) else "unknown"
                metadata = CLASS_METADATA.get(class_name, {"risk": "UNKNOWN", "emoji": "❓", "color": [255, 255, 255]})
                
                current_detections.append({
                    "class": class_name,
                    "confidence": conf,
                    "box": [x1, y1, x2, y2],
                    "metadata": metadata
                })
                
            self.last_results = current_detections

        # Draw the last known results (persistence)
        highest_risk = "LOW"
        detected_diseases = set()
        
        for det in self.last_results:
            x1, y1, x2, y2 = det["box"]
            color = det["metadata"]["color"]
            emoji_conf = f'{det["metadata"].get("emoji", "")} {det["class"]} {det["confidence"]*100:.1f}%'
            risk = det["metadata"].get("risk", "LOW")
            
            if risk == "HIGH":
                highest_risk = "HIGH"
                detected_diseases.add(det["class"])
            elif risk == "MEDIUM" and highest_risk != "HIGH":
                highest_risk = "MEDIUM"
                detected_diseases.add(det["class"])
                
            # Draw rectangle
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            
            # Draw label background
            (w, h), _ = cv2.getTextSize(emoji_conf, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(frame, (x1, y1 - 25), (x1 + w, y1), color, -1)
            
            # Draw text
            # OpenCV doesn't natively draw emojis well, but we pass emoji back in JSON anyway
            # For OpenCV frame, we just draw the text
            cv2.putText(frame, f'{det["class"]} {det["confidence"]*100:.0f}%', (x1, y1 - 5), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Encode frame back to base64
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        encoded_img = base64.b64encode(buffer).decode('utf-8')
        
        # Determine if we should trigger LLM
        trigger_llm = False
        current_time = time.time()
        
        # Trigger LLM if any disease/crop is detected and cooldown has passed
        if len(detected_diseases) > 0 and (current_time - self.last_llm_call) > self.llm_cooldown:
            trigger_llm = True
            self.last_llm_call = current_time

        return f"data:image/jpeg;base64,{encoded_img}", self.last_results, trigger_llm, list(detected_diseases)
