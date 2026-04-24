import easyocr

class TextExtractor:
    def __init__(self):
        self.reader = easyocr.Reader(['en'])

    def extract(self, image_path):
        results = self.reader.readtext(image_path)

        texts = []
        for (bbox, text, confidence) in results:
            texts.append({
                "text": text,
                "confidence": confidence,
                "bbox": bbox
            })

        return texts