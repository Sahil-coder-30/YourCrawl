from sentence_transformers import SentenceTransformer, util


class EmbeddingEngine:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

        self.pattern_prototypes = {                               # Define pattern prototypes 
            "forced_consent": [
                "accept all cookies to continue",
                "agree to everything",
                "continue only if you accept"
            ],
            "urgency": [
                "only few left",
                "limited time offer",
                "hurry up",
                "last chance"
            ],
            "confirmshaming": [
                "no thanks I don’t want this",
                "I hate saving money",
                "I prefer to miss out"
            ],
            "deceptive_labels": [
                "recommended option",
                "best choice",
                "most popular"
            ]
        }

        self.prototype_embeddings = {                                   # Precomputed embeddings
            k: self.model.encode(v, convert_to_tensor=True)
            for k, v in self.pattern_prototypes.items()
        }

    def encode(self, text):
        return self.model.encode(text, convert_to_tensor=True)

    def match(self, text_embedding):
        scores = {}

        for pattern, embeddings in self.prototype_embeddings.items():
            similarity = util.cos_sim(text_embedding, embeddings).max().item()
            scores[pattern] = similarity

        return scores