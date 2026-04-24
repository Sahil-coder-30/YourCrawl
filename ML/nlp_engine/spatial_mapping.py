class SpatialMapper:
    def __init__(self, iou_threshold=0.3):
        self.iou_threshold = iou_threshold

    def compute_iou(self, boxA, boxB):
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2])
        yB = min(boxA[3], boxB[3])

        interArea = max(0, xB - xA) * max(0, yB - yA)

        boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
        boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

        union = boxAArea + boxBArea - interArea + 1e-6

        return interArea / union

    def map_text_to_elements(self, texts, elements):
        mappings = []

        for t in texts:
            best_match = None
            best_score = 0

            for el in elements:
                score = self.compute_iou(t["bbox"], el["bbox"])

                if score > best_score:
                    best_score = score
                    best_match = el

            if best_score > self.iou_threshold:
                mappings.append({
                    "text": t,
                    "element": best_match,
                    "iou": best_score
                })

        return mappings