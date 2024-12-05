import sys
from pathlib import Path
import torch
import torchaudio
from einops import rearrange
from torchaudio.functional import resample
from datetime import datetime

project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

print("Loading MusicLM modules...")
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

class MusicGenerator:
    def __init__(self):
        print("\nInitializing MusicGenerator...")
        self.base_dir = project_root
        self.weights_dir = self.base_dir / "model_weights"
        self.input_dir = self.base_dir / "input"
        self.output_dir = self.base_dir / "output"
        self.output_dir.mkdir(exist_ok=True)
        # self.input_dir.mkdir(exist_ok=True)

        self.model_config = load_model_config(
            self.base_dir / "open_musiclm/configs/model/musiclm_large_small_context.json"
        )
        self.my_model_config = my_load_model_config(
            self.base_dir / "open_musiclm/configs/model/my_musiclm_for_semcoarsetosem.json"
        )

        self.checkpoint_paths = {
            "kmeans": self.weights_dir / "kmeans_10s_no_fusion.joblib",
            "clap": self.weights_dir / "clap.rvq.950_no_fusion.pt",  
            "semcoarsetosem": self.weights_dir / "real_semcoarsetosem.transformer.5170.pt",
            "coarse": self.weights_dir / "coarse.transformer.18000.pt",
        }

        self.device = 'cpu'
        print(f"Using device: {self.device}")
        self._initialize_models()

    def _initialize_models(self):
        """Initialize all required models and stages"""
        print("\nLoading models:")       
        self.wav2vec = create_hubert_kmeans_from_config(
            self.my_model_config, self.checkpoint_paths["kmeans"], self.device
        )
        
        self.encodec_wrapper = create_encodec_from_config(
            self.my_model_config, self.device
        )

        self.clap = create_clap_quantized_from_config(
            self.my_model_config, self.checkpoint_paths["clap"], self.device
        )

        self.semcoarsetosem_transformer = create_semcoarsetosem_transformer_from_config(
            self.my_model_config, self.checkpoint_paths["semcoarsetosem"], self.device
        )
        self.coarse_transformer = create_coarse_transformer_from_config(
            self.model_config, self.checkpoint_paths["coarse"], self.device
        )

        self.semcoarsetosem_stage = SemcoarsetosemStage(
            semcoarsetosem_transformer=self.semcoarsetosem_transformer,
            neural_codec=self.encodec_wrapper,
            wav2vec=self.wav2vec,
        )
        self.coarse_stage = CoarseStage(
            coarse_transformer=self.coarse_transformer,
            neural_codec=self.encodec_wrapper,
            wav2vec=self.wav2vec,
            clap=self.clap
        )
        print("Models loaded successfully")
# need revision
    def get_input_audio_file(self):
        """Find the first WAV file in the input directory"""
        for file in self.input_dir.iterdir():
            if file.suffix.lower() == '.wav':
                return file
        raise FileNotFoundError(f"No WAV files found in {self.input_dir}")
#   duration=5, time_steps_factor=75, semantic_steps=200, temperature=0.95
    def process_audio(self, audio_path=None, duration=3, time_steps_factor=5, semantic_steps=2, temperature=0.95, prompt=None):
        # need to double check doc strings with inference.py
        # how to process if only vocal input
        """
        Process audio file and generate accompaniment
        
        Args:
            audio_path (str or Path, optional): Path to input audio file. If None, uses first audio file in input directory
            duration (int): Duration of generated accompaniment in seconds
            time_steps_factor (int): Multiplier for time steps calculation (duration * time_steps_factor)
            semantic_steps (int): Number of semantic generation steps
            temperature (float): Temperature for generation (0.0 to 1.0). Higher values = more creative/random
            prompt (str, optional): Text prompt for generation. 
        """
        if audio_path is None:
            audio_path = self.get_input_audio_file()
        else:
            audio_path = Path(audio_path)
            if not audio_path.is_absolute():
                audio_path = self.base_dir / audio_path

        print(f"\nProcessing audio file: {audio_path}")
        print(f"Generation parameters:")
        print(f"  Duration: {duration} seconds")
        print(f"  Time steps factor: {time_steps_factor}")
        print(f"  Semantic steps: {semantic_steps}")
        print(f"  Temperature: {temperature}")

        print("\nLoading and preprocessing audio...")
        # Load the audio file - returns a tensor of shape [channels, samples] and the sample rate
        data, sample_hz = torchaudio.load(audio_path)

        # If audio has multiple channels (stereo), convert to mono by averaging channels
        if data.shape[0] > 1:
            data = torch.mean(data, dim=0).unsqueeze(0)  # Average channels and add back channel dimension

        # Calculate target length (10 seconds worth of samples)
        target_length = int(10 * sample_hz)

        # Normalize the data to have zero mean and unit variance
        normalized_data = zero_mean_unit_var_norm(data)

        # Trim both original and normalized data to target length (10 seconds)
        data = data[:, :target_length]
        normalized_data = normalized_data[:, :target_length]

        # Resample audio to match the required sample rates for different models
        audio_for_encodec = resample(data, sample_hz, self.encodec_wrapper.sample_rate)
        audio_for_wav2vec = resample(normalized_data, sample_hz, self.wav2vec.target_sample_hz)

        # Convert audio to int16, then back to float32 (this quantizes the audio)
        # This step helps standardize the audio format and reduce potential artifacts
        # Then move the tensor to the specified device (CPU or GPU)
        audio_for_encodec = int16_to_float32(float32_to_int16(audio_for_encodec)).to(self.device)
        audio_for_wav2vec = int16_to_float32(float32_to_int16(audio_for_wav2vec)).to(self.device)

        print("Generating token IDs...")
        vocals_semantic_token_ids = get_or_compute_semantic_token_ids(
            None, audio_for_wav2vec, self.wav2vec
        )
        vocals_coarse_token_ids, _ = get_or_compute_acoustic_token_ids(
            None, None, audio_for_encodec, self.encodec_wrapper, 
            self.model_config.global_cfg.num_coarse_quantizers
        )

        if prompt is None:
            prompt = ["Diverse kinds of instrument and richness"]
        elif isinstance(prompt, str):
            prompt = [prompt]
        print(f"Using prompt: {prompt[0]}")
            
        clap_token_ids = get_or_compute_clap_token_ids(None, self.clap, None, prompt)

        print("Generating semantic IDs...")
        generated_inst_semantic_ids = self.semcoarsetosem_stage.generate(
            vocals_semantic_token_ids=vocals_semantic_token_ids,
            vocals_coarse_token_ids=vocals_coarse_token_ids,
            max_time_steps=semantic_steps,
            temperature=temperature,
        )

        print("Generating waveform...")
        generated_wave = self.coarse_stage.generate(
            clap_token_ids=clap_token_ids,
            semantic_token_ids=generated_inst_semantic_ids.squeeze(2),
            max_time_steps=duration * time_steps_factor,
            reconstruct_wave=True,
            include_eos_in_output=False,
            append_eos_to_conditioning_tokens=True,
            temperature=temperature,
        )

        generated_wave = rearrange(generated_wave, 'b n -> b 1 n').detach().cpu()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_name = f"{audio_path.stem}_{timestamp}_generated.wav"
        output_path = self.output_dir / output_name

        print("\nSaving generated audio...")
        torchaudio.save(output_path, generated_wave[0], self.encodec_wrapper.sample_rate)
        print(f"Generated audio saved to: {output_path}")
        return output_path

def main():
    try:
        # Adjustable parameters
        params = {
            'duration': 3,              # Duration in seconds
            'time_steps_factor': 5,     # Multiplier for time steps (duration * time_steps_factor)
            'semantic_steps': 1,        # Number of semantic generation steps
            'temperature': 0.95,        # Temperature for generation (0.0 to 1.0)
            'prompt': "Solo piano accompaniment with gentle playing"
        }

        generator = MusicGenerator()
        generator.process_audio(**params)

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 