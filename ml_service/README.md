# ML Service

This service provides an API wrapper around the music accompaniment generation model, built with FastAPI and Python.

## Setup Instructions

### 1. Environment Setup

Create and activate a Python virtual environment:

```bash
cd ml_service
python3 -m venv venv
source venv/bin/activate  
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

For VS Code users:
```json
// Add to .vscode/settings.json under Harmony directory
{
    "python.defaultInterpreterPath": "./ml_service/venv/bin/python"
}
```

### 3. Download Model Weights

Download the following model weights and place them in their respective directories:

In `model_weights/`:
- clap.rvq.950_no_fusion.pt
- kmeans_10s_no_fusion.joblib
- real_semcoarsetosem.transformer.5170.pt
- coarse.transformer.18000.pt

In `open_musiclm/laion_clap/`:
- 630k-audioset-best.pt

Download links:
- [Weights set 1](https://drive.google.com/drive/u/0/folders/1347glwEc-6XWulfU7NGrFrYTvTnjeVJE)
- [Weights set 2](https://drive.google.com/drive/folders/1D6ZR5S6M5yoNXaJm35U2s-Rh6YofHrpQ)

## Running the Service

Start the FastAPI development server:

```bash
cd ml_service
uvicorn api.main:app --reload --port 8000
```

The service will be available at `http://localhost:8000`

## API Documentation

Once the service is running, view the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`