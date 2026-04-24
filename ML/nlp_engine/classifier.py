from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F


class BERTDarkPatternClassifier:
    def __init__(self, model_name="distilbert-base-uncased"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=4)

        self.label_map = {                                       # Label mapping
            0: "normal",
            1: "forced_consent",
            2: "urgency",
            3: "confirmshaming"
        }

    def predict(self, text):
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)

        with torch.no_grad():
            outputs = self.model(**inputs)

        probs = F.softmax(outputs.logits, dim=1)
        confidence, pred = torch.max(probs, dim=1)

        return {
            "pattern": self.label_map[pred.item()],
            "confidence": float(confidence.item())
        }

    def classify(self, texts):
        results = []

        for t in texts:
            text = t["cleaned_text"]

            if not text.strip():
                continue

            pred = self.predict(text)

            if pred["pattern"] != "normal":
                results.append({
                    "pattern": pred["pattern"],
                    "confidence": round(pred["confidence"], 2),
                    "evidence": {
                        "text": t["text"]
                    },
                    "bbox": t["bbox"]                                                        # needed for spatial mapping
                })

        return results