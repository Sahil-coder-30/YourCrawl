class UIAnalyzer:
    def __init__(self, config=None):                              #Initialize analyzer with configurable thresholds
        
        self.config = config or {
            "misdirection_ratio": 2.0,
            "brightness_diff_threshold": 30,
            "low_brightness_threshold": 120,
            "popup_area_ratio": 0.6,
            "edge_position_threshold": 0.8
        }

    
    def detect_misdirection(self, elements):
        patterns = []

        buttons = [el for el in elements if el["label"] == "button"]

        if len(buttons) < 2:
            return patterns

        buttons = sorted(buttons, key=lambda x: x["relative_area"], reverse=True)

        primary = buttons[0]
        secondary = buttons[-1]

        size_ratio = primary["relative_area"] / (secondary["relative_area"] + 1e-6)
        brightness_diff = primary["brightness"] - secondary["brightness"]

        if size_ratio > self.config["misdirection_ratio"] and brightness_diff > self.config["brightness_diff_threshold"]:
            patterns.append({
                "pattern": "misdirection",
                "confidence": 0.85,
                "severity": min(1.0, size_ratio / 3),
                "evidence": {
                    "size_ratio": round(size_ratio, 2),
                    "brightness_diff": round(brightness_diff, 2),
                    "primary_position": primary["position"],
                    "secondary_position": secondary["position"]
                }
            })

        return patterns

    
    def detect_hidden_action(self, elements):
        patterns = []

        if not elements:
            return patterns

        avg_brightness = sum(el["brightness"] for el in elements) / len(elements)

        for el in elements:
            is_low_visibility = el["brightness"] < (avg_brightness - 20)

            is_edge_position = (
                el["position"]["y_center"] > self.config["edge_position_threshold"]
                or el["position"]["x_center"] > self.config["edge_position_threshold"]
            )

            if el["label"] == "button" and is_low_visibility and is_edge_position:
                patterns.append({
                    "pattern": "hidden_action",
                    "confidence": 0.8,
                    "severity": 0.7,
                    "evidence": {
                        "brightness": el["brightness"],
                        "avg_brightness": round(avg_brightness, 2),
                        "position": el["position"]
                    }
                })

        return patterns

    
    def detect_intrusive_popup(self, elements):
        patterns = []

        for el in elements:
            if el["label"] == "popup" and el["relative_area"] > self.config["popup_area_ratio"]:
                patterns.append({
                    "pattern": "intrusive_popup",
                    "confidence": 0.9,
                    "severity": min(1.0, el["relative_area"]),
                    "evidence": {
                        "relative_area": round(el["relative_area"], 2),
                        "position": el["position"]
                    }
                })

        return patterns

    
    def detect_visual_dominance(self, elements):
        patterns = []

        buttons = [el for el in elements if el["label"] == "button"]

        if len(buttons) < 2:
            return patterns

        buttons = sorted(buttons, key=lambda x: x["relative_area"], reverse=True)

        primary = buttons[0]
        others = buttons[1:]

        for el in others:
            size_ratio = primary["relative_area"] / (el["relative_area"] + 1e-6)
            brightness_diff = primary["brightness"] - el["brightness"]

            if size_ratio > 1.5 and brightness_diff > 20:
                patterns.append({
                    "pattern": "visual_dominance",
                    "confidence": 0.8,
                    "severity": min(1.0, size_ratio / 2),
                    "evidence": {
                        "dominant_element": primary["position"],
                        "suppressed_element": el["position"],
                        "size_ratio": round(size_ratio, 2),
                        "brightness_diff": round(brightness_diff, 2)
                    }
                })

        return patterns

    
    def analyze(self, elements, image_area=None):
        """
        Run all CV-based detections
        """
        patterns = []

        detectors = [
            self.detect_misdirection,
            self.detect_hidden_action,
            self.detect_intrusive_popup,
            self.detect_visual_dominance
        ]

        for detector in detectors:
            results = detector(elements)
            if results:
                for res in results:
                    res["source"] = "cv"
                    patterns.append(res)

        return patterns 
    


"""
[                                                  Output Format
  {
    "pattern": "misdirection",
    "confidence": 0.85,
    "severity": 0.92,
    "evidence": {
      "size_ratio": 2.8,
      "brightness_diff": 48.5,
      "primary_position": {
        "x_center": 0.52,
        "y_center": 0.65
      },
      "secondary_position": {
        "x_center": 0.15,
        "y_center": 0.92
      }
    },
    "source": "cv"
  },
  {
    "pattern": "hidden_action",
    "confidence": 0.8,
    "severity": 0.7,
    "evidence": {
      "brightness": 95.2,
      "avg_brightness": 142.6,
      "position": {
        "x_center": 0.12,
        "y_center": 0.94
      }
    },
    "source": "cv"
  },
  {
    "pattern": "intrusive_popup",
    "confidence": 0.9,
    "severity": 0.78,
    "evidence": {
      "relative_area": 0.78,
      "position": {
        "x_center": 0.5,
        "y_center": 0.5
      }
    },
    "source": "cv"
  },
  {
    "pattern": "visual_dominance",
    "confidence": 0.8,
    "severity": 0.76,
    "evidence": {
      "dominant_element": {
        "x_center": 0.55,
        "y_center": 0.68
      },
      "suppressed_element": {
        "x_center": 0.2,
        "y_center": 0.88
      },
      "size_ratio": 1.9,
      "brightness_diff": 32.4
    },
    "source": "cv"
  }
]
"""