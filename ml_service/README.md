# ML Service Setup

This directory contains the Python FastAPI service that wraps the music generation model.

## Environment Setup

1. Create a Python virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Download model weights:
   - Download and place the following files in the `model_weights` directory from [here](https://drive.google.com/drive/u/0/folders/1347glwEc-6XWulfU7NGrFrYTvTnjeVJE) and [here](https://drive.google.com/drive/folders/1D6ZR5S6M5yoNXaJm35U2s-Rh6YofHrpQ)
     - clap.rvq.950_no_fusion.pt
     - kmeans_10s_no_fusion.joblib
     - real_semcoarsetosem.transformer.5170.pt
     - coarse.transformer.18000.pt
