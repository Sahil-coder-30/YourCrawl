import re

class TextCleaner:
    def clean(self, texts):
        cleaned = []

        for t in texts:
            text = t["text"].lower()
            text = re.sub(r'[^a-z0-9\s]', '', text)

            cleaned.append({
                **t,
                "cleaned_text": text
            })

        return cleaned