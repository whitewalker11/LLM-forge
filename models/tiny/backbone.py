import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig


class TinyModel:

    def __init__(self, model_path="models/tiny"):
        print("Loading Tiny model...")

        self.tokenizer = AutoTokenizer.from_pretrained(model_path)

        quant_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16
        )

        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            quantization_config=quant_config,
            device_map="auto"
        )

        self.model.eval()
        print("Tiny model loaded ✅")

    # def generate(self, prompt: str):

    #     messages = [
    #         {"role": "user", "content": prompt}
    #     ]

    #     # Apply chat template
    #     formatted_prompt = self.tokenizer.apply_chat_template(
    #         messages,
    #         tokenize=False,
    #         add_generation_prompt=True
    #     )

    #     # Now tokenize properly
    #     inputs = self.tokenizer(
    #         formatted_prompt,
    #         return_tensors="pt"
    #     )

    #     input_ids = inputs["input_ids"].to(self.model.device)

    #     with torch.no_grad():
    #         outputs = self.model.generate(
    #             input_ids=input_ids,
    #             max_new_tokens=200,
    #             do_sample=True,
    #             temperature=0.3,
    #             top_p=0.9,
    #             repetition_penalty=1.2
    #         )

    #     generated_tokens = outputs[0][input_ids.shape[-1]:]

    #     response = self.tokenizer.decode(
    #         generated_tokens,
    #         skip_special_tokens=True
    #     )

    #     return response.strip()
    
    def generate(self, prompt: str):

        system_prompt = (
    "You are a helpful and professional AI assistant. "
    "Never use placeholder variables like [USERNAME]. "
    "Always respond naturally as if speaking to a real person."
)   

        formatted_prompt = (
            f"<s>[INST] <<SYS>>\n"
            f"{system_prompt}\n"
            f"<</SYS>>\n\n"
            f"{prompt} [/INST]"
        )

        inputs = self.tokenizer(
            formatted_prompt,
            return_tensors="pt"
        )

        input_ids = inputs["input_ids"].to(self.model.device)

        with torch.no_grad():
            outputs = self.model.generate(
                input_ids=input_ids,
                max_new_tokens=150,
                do_sample=True,
                temperature=0.6,
                top_p=0.9,
                repetition_penalty=1.2
            )

        generated_tokens = outputs[0][input_ids.shape[-1]:]

        return self.tokenizer.decode(
            generated_tokens,
            skip_special_tokens=True
        ).strip()