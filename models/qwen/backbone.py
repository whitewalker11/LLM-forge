import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

class QwenModel:

    def __init__(self):

        print("Loading Qwen model...")

        self.tokenizer = AutoTokenizer.from_pretrained(
            "models/qwen",
            trust_remote_code=True,
            use_fast=False,
            local_files_only=True
        )

        self.model = AutoModelForCausalLM.from_pretrained(
            "models/qwen",
            trust_remote_code=True,
            device_map="auto",
            torch_dtype=torch.float16,
            local_files_only=True
        )

        self.model.eval()

        print("Qwen model loaded ✅")

    def generate(self, prompt):

        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]

        text = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        inputs = self.tokenizer(text, return_tensors="pt")
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