from fastapi import FastAPI, File, UploadFile  
from fastapi.responses import FileResponse     # For sending files back to client
from pathlib import Path  # For handling file paths
import shutil  # For file operations
from model.generator import MusicGenerator  

app = FastAPI()

# Initialize the ML model
# This happens once when the server starts
generator = MusicGenerator()

@app.post("/generate")  # Define POST endpoint at /generate
async def generate_music(audio_file: UploadFile = File(...)):  # Expect file upload
    # Save the uploaded file to input directory
    # Note: This uses the directory structure expected by generator.py
    input_path = Path("input") / audio_file.filename
    with input_path.open("wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)
    
    # Run the generation process
    # This calls your ML model to generate new audio
    output_path = generator.process_audio()
    
    # Return the generated file to the client
    return FileResponse(
        path=output_path,
        media_type="audio/wav",
        headers={"Content-Disposition": f"attachment; filename={output_path.name}"}
    )

# Run the server if this file is run directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)