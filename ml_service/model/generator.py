import torch
import torchaudio
from pathlib import Path
from einops import rearrange
from torchaudio.functional import resample

from open_musiclm.config import (
    create_clap_quantized_from_config,
    create_coarse_transformer_from_config,
    create_semcoarsetosem_transformer_from_config,
    create_encodec_from_config,
    create_hubert_kmeans_from_config,
    my_load_model_config, load_model_config
)
from open_musiclm.open_musiclm import (
    SemcoarsetosemStage, CoarseStage,
    get_or_compute_clap_token_ids,
    get_or_compute_acoustic_token_ids,
    get_or_compute_semantic_token_ids
)
from open_musiclm.utils import int16_to_float32, float32_to_int16, zero_mean_unit_var_norm

# Set paths
BASE_DIR = Path(".")  # Root of repo
WEIGHTS_DIR = BASE_DIR / "model_weights"
OUTPUT_DIR = BASE_DIR / "generated_music"
OUTPUT_DIR.mkdir(exist_ok=True)

# Load model configs
model_config = load_model_config(BASE_DIR / "open_musiclm/configs/model/musiclm_large_small_context.json")
my_model_config = my_load_model_config(BASE_DIR / "open_musiclm/configs/model/my_musiclm_for_semcoarsetosem.json")

# Model paths
checkpoint_paths = {
    "semcoarsetosem": WEIGHTS_DIR / "real_semcoarsetosem.transformer.5170.pt",
    "coarse": WEIGHTS_DIR / "coarse.transformer.18000.pt",
    "rvq": WEIGHTS_DIR / "clap.rvq.950_no_fusion.pt",
    "kmeans": WEIGHTS_DIR / "kmeans_10s_no_fusion.joblib"
}

def process_audio(audio_path, duration=3):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")
    
    # Initialize models
    clap = create_clap_quantized_from_config(my_model_config, checkpoint_paths["rvq"], device)
    wav2vec = create_hubert_kmeans_from_config(my_model_config, checkpoint_paths["kmeans"], device)
    encodec_wrapper = create_encodec_from_config(my_model_config, device)
    
    # Initialize transformers
    semcoarsetosem_transformer = create_semcoarsetosem_transformer_from_config(
        my_model_config, checkpoint_paths["semcoarsetosem"], device
    )
    coarse_transformer = create_coarse_transformer_from_config(
        model_config, checkpoint_paths["coarse"], device
    )
    
    # Create stages
    semcoarsetosem_stage = SemcoarsetosemStage(
        semcoarsetosem_transformer=semcoarsetosem_transformer,
        neural_codec=encodec_wrapper,
        wav2vec=wav2vec,
    )
    
    coarse_stage = CoarseStage(
        coarse_transformer=coarse_transformer,
        neural_codec=encodec_wrapper,
        wav2vec=wav2vec,
        clap=clap
    )

    # Process input audio
    data, sample_hz = torchaudio.load(audio_path)
    if data.shape[0] > 1:
        data = torch.mean(data, dim=0).unsqueeze(0)

    target_length = int(10 * sample_hz)
    normalized_data = zero_mean_unit_var_norm(data)

    data = data[:, :target_length]
    normalized_data = normalized_data[:, :target_length]
    
    # Prepare audio for models
    audio_for_encodec = resample(data, sample_hz, encodec_wrapper.sample_rate)
    audio_for_wav2vec = resample(normalized_data, sample_hz, wav2vec.target_sample_hz)

    audio_for_encodec = int16_to_float32(float32_to_int16(audio_for_encodec)).to(device)
    audio_for_wav2vec = int16_to_float32(float32_to_int16(audio_for_wav2vec)).to(device)

    # Get token IDs
    vocals_semantic_token_ids = get_or_compute_semantic_token_ids(None, audio_for_wav2vec, wav2vec)
    vocals_coarse_token_ids, _ = get_or_compute_acoustic_token_ids(
        None, None, audio_for_encodec, encodec_wrapper, 
        model_config.global_cfg.num_coarse_quantizers
    )
    
    # Text prompt for generation
    text = ["Solo piano accompaniment with gentle playing"]
    clap_token_ids = get_or_compute_clap_token_ids(None, clap, None, text)

    # Generate semantic IDs
    generated_inst_semantic_ids = semcoarsetosem_stage.generate(
        vocals_semantic_token_ids=vocals_semantic_token_ids,
        vocals_coarse_token_ids=vocals_coarse_token_ids,
        # max_time_steps=200,
        max_time_steps=1,
        temperature=0.95,
    )
    
    # Generate waveform
    generated_wave = coarse_stage.generate(
        clap_token_ids=clap_token_ids,
        semantic_token_ids=generated_inst_semantic_ids.squeeze(2),
        # max_time_steps=duration*75,
        max_time_steps=duration*5,
        reconstruct_wave=True,
        include_eos_in_output=False,
        append_eos_to_conditioning_tokens=True,
        temperature=0.95,
    )

    generated_wave = rearrange(generated_wave, 'b n -> b 1 n').detach().cpu()

    # Save output
    output_name = f"{Path(audio_path).stem}_generated.wav"
    output_path = OUTPUT_DIR / output_name

    # Save accompaniment alone
    torchaudio.save(output_path, generated_wave[0], encodec_wrapper.sample_rate)
    print(f"Generated audio saved to: {output_path}")
    
if __name__ == "__main__":
    # Example usage
    input_path = "input/xiaoxingxing.wav"
    process_audio(input_path)