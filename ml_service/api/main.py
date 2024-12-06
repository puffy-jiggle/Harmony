from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse
from pathlib import Path
import shutil
import uuid
from typing import Optional
from model.generator import MusicGenerator

app = FastAPI()
generator = MusicGenerator()

def cleanup_temp_files(temp_dir: Path):
    """Clean up temporary files after response has been sent"""
    if temp_dir.exists():
        shutil.rmtree(temp_dir)

@app.post("/generate")
async def generate_music(
    background_tasks: BackgroundTasks,
    audio_file: UploadFile = File(...),
    semantic_steps: int = Form(2),  # Changed to non-Optional
    duration: Optional[int] = Form(3),
    time_steps_factor: Optional[int] = Form(5),
    temperature: Optional[float] = Form(0.95),
    prompt: Optional[str] = Form("Diverse kinds of instrument and richness"),
    save_for_eval: Optional[bool] = Form(False)
):
    request_id = str(uuid.uuid4())
    temp_dir = Path("temp") / request_id
    
    try:
        # Create temporary directories
        input_dir = temp_dir / "input"
        output_dir = temp_dir / "output"
        input_dir.mkdir(parents=True)
        output_dir.mkdir(parents=True)
        
        # Save uploaded file
        input_path = input_dir / audio_file.filename
        with input_path.open("wb") as input_file:
            shutil.copyfileobj(audio_file.file, input_file)
        
        # Process the audio
        output_path = generator.process_audio(
            audio_path=input_path,
            output_dir=output_dir,
            request_id=request_id,
            semantic_steps=semantic_steps,
            duration=duration,
            time_steps_factor=time_steps_factor,
            temperature=temperature,
            prompt=prompt,
            save_for_eval=save_for_eval,
        )
        
        # Add cleanup task to background tasks
        background_tasks.add_task(cleanup_temp_files, temp_dir)
        
        # Return the generated file
        return FileResponse(
            path=output_path,
            media_type="audio/wav",
            headers={"Content-Disposition": f"attachment; filename={output_path.name}"}
        )
            
    except Exception as e:
        # Clean up if anything goes wrong
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        raise HTTPException(status_code=500, detail=str(e))

