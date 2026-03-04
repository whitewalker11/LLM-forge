import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

class GemmaModel:

    def __init__(self):

        print("Loading Gemma model...")

        self.tokenizer = AutoTokenizer.from_pretrained(
            "models/gemma",
            trust_remote_code=True,
            local_files_only=True
        )

        self.model = AutoModelForCausalLM.from_pretrained(
            "models/gemma",
            trust_remote_code=True,
            device_map="auto",
            torch_dtype=torch.float16,
            local_files_only=True
        )

        self.model.eval()

        print("Gemma model loaded ✅")

    def generate(self, prompt):

        inputs = self.tokenizer(prompt, return_tensors="pt")
        input_ids = inputs["input_ids"].to(self.model.device)

        with torch.no_grad():
            outputs = self.model.generate(
                input_ids=input_ids,
                max_new_tokens=200,
                do_sample=True,
                temperature=0.7,
                top_p=0.9
            )

        generated_tokens = outputs[0][input_ids.shape[-1]:]

        return self.tokenizer.decode(
            generated_tokens,
            skip_special_tokens=True
        )