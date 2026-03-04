from models.tiny.backbone import TinyModel
from models.phi.backbone import PhiModel
from models.qwen.backbone import QwenModel
from models.mistral.backbone import MistralModel
from models.gemma.backbone import GemmaModel

_loaded_model = None
_loaded_model_name = None


def get_model(model_name: str):

    global _loaded_model, _loaded_model_name

    if _loaded_model_name == model_name:
        return _loaded_model

    if model_name == "tiny":
        from models.tiny.backbone import TinyModel
        _loaded_model = TinyModel()

    elif model_name == "phi":
        from models.phi.backbone import PhiModel
        _loaded_model = PhiModel()

    elif model_name == "qwen":
        _loaded_model = QwenModel()
        
        
    elif model_name == "mistral":
        _loaded_model = MistralModel()

    elif model_name == "gemma":
        _loaded_model = GemmaModel()

    else:
        raise ValueError("Unknown model")

    _loaded_model_name = model_name
    return _loaded_model