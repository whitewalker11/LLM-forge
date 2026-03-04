import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


class PhiModel:

    def __init__(self, model_path: str = "models/phi"):
        print("Loading Phi model...")

        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # Load tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_path,
            local_files_only=True
        )

        # Load model (no 4bit for stability first)
        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            device_map="auto"
        )

        self.model.eval()

        print("Phi model loaded ✅")

    # ---------------------------------------------------
    # Generate (Proper Phi Chat Formatting)
    # ---------------------------------------------------
    def generate(self, prompt: str, max_tokens: int = 200):

        # Phi-3 official chat format
        formatted_prompt = (
            f"<|system|>\n"
            f"You are a helpful AI assistant.\n"
            f"<|user|>\n"
            f"{prompt}\n"
            f"<|assistant|>\n"
        )

        # Tokenize properly
        inputs = self.tokenizer(
            formatted_prompt,
            return_tensors="pt"
        )

        input_ids = inputs["input_ids"].to(self.model.device)

        with torch.no_grad():
            outputs = self.model.generate(
                input_ids=input_ids,
                max_new_tokens=max_tokens,
                do_sample=True,
                temperature=0.6,
                top_p=0.9,
                repetition_penalty=1.1
            )

        # Remove prompt part
        generated_tokens = outputs[0][input_ids.shape[-1]:]

        response = self.tokenizer.decode(
            generated_tokens,
            skip_special_tokens=True
        )

        return response.strip()