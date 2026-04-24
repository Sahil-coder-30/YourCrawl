#This file can be used for detecting misdirections, hidden actions, 
# intrusive ui and pop up detections, advanced detections enables explainability

import cv2
from ultralytics import YOLO

class UIDetector:
    def __init__(self, model_path="D:\Honey\Fun\sightline_project\yolo26s.pt"):         #constructor for loading the model
        self.model = YOLO(model_path)
        self.LABEL_MAP = {                              #label mapping
            0: "button",
            1: "checkbox",
            2: "text",
            3: "image",
            4: "popup"
        }

    def detect(self, image_path):                                           #function for detections
        results = self.model(image_path)

        detections = []
        for r in results:
            for box in r.boxes:
                class_id = int(box.cls)

                detections.append( {
                    "label": self.LABEL_MAP.get(class_id, "unknown"),
                    "confidence": float(box.conf),
                    "bbox": box.xyxy.tolist()[0]
                    } 
                )

        return detections 
    
    def extract_features(image, bbox, image_area):                                   #function to extract features
    
        x1, y1, x2, y2 = map(int, bbox)
        crop = image[y1:y2, x1:x2]

        if crop.size == 0:
            return {
                "area": 0,
                "relative_area": 0,
                "color": [0, 0, 0],
                "brightness": 0,
                "position": {"x_center": 0, "y_center": 0}
            }

        area = (x2 - x1) * (y2 - y1)                              #absolute area

        relative_area = area / image_area if image_area != 0 else 0                  #normalized area

        mean_color = crop.mean(axis=(0, 1))                                   #color features
        brightness = sum(mean_color) / 3

        x_center = (x1 + x2) / 2                                   #positional features
        y_center = (y1 + y2) / 2

        return {
            "area": area,
            "relative_area": relative_area,
            "color": mean_color.tolist(),
            "brightness": brightness,
            "position": {
                "x_center": x_center,
                "y_center": y_center
            }
        }

    

class CVPreprocessor:                                                 #class for cv preocessing pipeline
    def __init__(self):
        self.detector = UIDetector()

    def process(self, image_path):
        image = cv2.imread(image_path)

        image_area = image.shape[0] * image.shape[1]                      #total image area

        detections = self.detector.detect(image_path)

        elements = []

        for det in detections:
            features = UIDetector.extract_features(
                image,
                det["bbox"],
                image_area
            )

            elements.append({
                **det,
                **features
            })

        return elements, image_area
    

"""
                                    Final output format
[
  {
    "label": "button",
    "confidence": 0.94,
    "bbox": [120, 400, 360, 480],

    "area": 19200,
    "relative_area": 0.08,

    "color": [210.5, 180.2, 75.3],
    "brightness": 155.3,

    "position": {
      "x_center": 240,
      "y_center": 440
    }
  },
  {
    "label": "popup",
    "confidence": 0.97,
    "bbox": [50, 100, 750, 900],

    "area": 560000,
    "relative_area": 0.72,

    "color": [240.1, 240.5, 240.2],
    "brightness": 240.2,

    "position": {
      "x_center": 400,
      "y_center": 500
    }
  },
  {
    "label": "checkbox",
    "confidence": 0.89,
    "bbox": [130, 500, 160, 530],

    "area": 900,
    "relative_area": 0.003,

    "color": [120.0, 120.0, 120.0],
    "brightness": 120.0,

    "position": {
      "x_center": 145,
      "y_center": 515
    }
  }
]

"""