import classifier
import spatial_mapping


class NLPAnalyzer:
    def __init__(self):
        self.classifier = classifier.BERTDarkPatternClassifier()
        self.mapper = spatial_mapping.SpatialMapper()

    def analyze(self, texts, elements):
        # Step 1: classify text
        text_patterns = self.classifier.classify(texts)

        # Step 2: spatial mapping
        mappings = self.mapper.map_text_to_elements(texts, elements)

        results = []

        for tp in text_patterns:
            for m in mappings:
                if tp["bbox"] == m["text"]["bbox"]:
                    results.append({
                        "pattern": tp["pattern"],
                        "confidence": tp["confidence"],
                        "severity": min(1.0, tp["confidence"] + 0.2),
                        "evidence": {
                            "text": tp["evidence"]["text"],
                            "ui_element": m["element"]["label"],
                            "position": m["element"]["position"]
                        },
                        "source": "nlp+spatial"
                    })

        return results
    

"""                                                      Sample Output from nlp core
[
  {
    "pattern": "forced_consent",
    "confidence": 0.91,
    "severity": 1.0,
    "evidence": {
      "text": "Accept all cookies",
      "ui_element": "button",
      "position": {
        "x_center": 0.55,
        "y_center": 0.68
      }
    },
    "source": "nlp+spatial"
  }
]
"""