import json
from dataclasses import asdict, dataclass
from pathlib import Path
from beartype.typing import Literal, Optional
import torch

@dataclass
class ClapRVQConfig:
    rq_num_quantizers: int
    codebook_size: int
    enable_fusion: bool = False
    rq_ema_decay: float = 0.95
    threshold_ema_dead_code: float = 0.0
    checkpoint_path: Optional[str] = None
    amodel_type: str = 'HTSAT-tiny'

@dataclass
class HubertKmeansConfig:
    model_name: str
    normalize_embeds: bool
    embed_layer: int = 7
    target_sample_hz: int = 16000
    seq_len_multiple_of: int = 320
    codebook_size: int = 1024
    output_hz: int = 50

@dataclass
class EncodecConfig:
    bandwidth: float
    codebook_size: int
    output_hz: int = 75

RelativePositionBiasType = Literal['continuous', 't5', 'none']

@dataclass
class BaseTransformerConfig:
    dim: int = 1024
    depth: int = 6
    heads: int = 8
    attn_dropout: float = 0.0
    ff_dropout: float = 0.1
    use_conv_ff: bool = True
    grad_shrink_alpha: float = 0.1
    non_causal_prefix_size: int = 0
    relative_position_bias_type: RelativePositionBiasType = 'continuous'
    use_memory_efficient_attention: bool = False
    use_absolute_position_embeddings: bool = False

@dataclass
class SemanticConfig(BaseTransformerConfig):
    max_absolute_position_embeddings: int = 12 + 250

@dataclass
class CoarseConfig(BaseTransformerConfig):
    max_absolute_position_embeddings: int = 12 + 100 + 600

@dataclass
class SemcoarsetosemConfig(BaseTransformerConfig):
    max_absolute_position_embeddings: int = 12 + 300 + 900
    dim: int = 1024  # Match checkpoint dimensions
    depth: int = 24  # Match checkpoint layer count 
    heads: int = 16  # Match checkpoint head count

@dataclass
class GlobalConfig:
    semantic_audio_length_seconds: float = 10.0
    coarse_audio_length_seconds: float = 4.0
    fine_audio_length_seconds: float = 2.0
    clap_audio_length_seconds: float = 10.0
    num_coarse_quantizers: int = 3
    num_fine_quantizers: int = 5

@dataclass
class MusicLMModelConfig:
    clap_rvq_cfg: ClapRVQConfig
    hubert_kmeans_cfg: HubertKmeansConfig
    encodec_cfg: EncodecConfig
    semantic_cfg: SemanticConfig
    coarse_cfg: CoarseConfig
    global_cfg: GlobalConfig

def exists(val):
    return val is not None

def load_model(model, path, device='cpu'):
    path = Path(path)
    assert path.exists(), f'checkpoint does not exist at {str(path)}'
    pkg = torch.load(str(path), map_location=device)
    model.load_state_dict(pkg)

def create_clap_quantized_from_config(model_config: MusicLMModelConfig, rvq_path: Optional[str], device, **kwargs):
    from .clap_quantized import create_clap_quantized
    return create_clap_quantized(
        **asdict(model_config.clap_rvq_cfg),
        device=device,
        learn_rvq=False,
        rvq_checkpoint_path=rvq_path,
        **kwargs,
    ).to(device)

def create_hubert_kmeans_from_config(model_config: MusicLMModelConfig, kmeans_path: Optional[str], device, **kwargs):
    from .hf_hubert_kmeans import get_hubert_kmeans
    return get_hubert_kmeans(
        **asdict(model_config.hubert_kmeans_cfg),
        kmeans_path=kmeans_path,
        **kwargs,
    ).to(device)

def create_encodec_from_config(model_config: MusicLMModelConfig, device, **kwargs):
    from .encodec_wrapper import create_encodec_24khz
    return create_encodec_24khz(**asdict(model_config.encodec_cfg), **kwargs).to(device)

def create_semcoarsetosem_transformer_from_config(model_config: MusicLMModelConfig, checkpoint_path: Optional[str], device, **kwargs):
    from .open_musiclm import create_semcoarsetosem_transformer
    transformer = create_semcoarsetosem_transformer(
        **asdict(getattr(model_config, 'semcoarsetosem_cfg', SemcoarsetosemConfig())),
        semantic_codebook_size=model_config.hubert_kmeans_cfg.codebook_size,
        acoustic_codebook_size=model_config.encodec_cfg.codebook_size,
        num_coarse_quantizers=model_config.global_cfg.num_coarse_quantizers,
        **kwargs,
    ).to(device)

    if exists(checkpoint_path):
        load_model(transformer, checkpoint_path, device)
    return transformer

def create_coarse_transformer_from_config(model_config: MusicLMModelConfig, checkpoint_path: Optional[str], device, **kwargs):
    from .open_musiclm import create_coarse_transformer
    transformer = create_coarse_transformer(
        **asdict(model_config.coarse_cfg),
        clap_codebook_size=model_config.clap_rvq_cfg.codebook_size,
        semantic_codebook_size=model_config.hubert_kmeans_cfg.codebook_size,
        acoustic_codebook_size=model_config.encodec_cfg.codebook_size,
        num_clap_quantizers=model_config.clap_rvq_cfg.rq_num_quantizers,
        num_coarse_quantizers=model_config.global_cfg.num_coarse_quantizers,
        **kwargs,
    ).to(device)

    if exists(checkpoint_path):
        load_model(transformer, checkpoint_path)
    return transformer

def load_model_config(config_path: str) -> MusicLMModelConfig:
    with open(config_path, 'r') as f:
        config = json.load(f)
    return MusicLMModelConfig(
        clap_rvq_cfg=ClapRVQConfig(**config['clap_rvq_cfg']),
        hubert_kmeans_cfg=HubertKmeansConfig(**config['hubert_kmeans_cfg']),
        encodec_cfg=EncodecConfig(**config['encodec_cfg']),
        semantic_cfg=SemanticConfig(**config['semantic_cfg']),
        coarse_cfg=CoarseConfig(**config['coarse_cfg']),
        global_cfg=GlobalConfig(**config['global_cfg']),
    )

def my_load_model_config(config_path: str) -> MusicLMModelConfig:
    return load_model_config(config_path)