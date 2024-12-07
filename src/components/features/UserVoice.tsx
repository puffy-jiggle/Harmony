import React, { useState, useEffect } from 'react';
import AudioPlayer from '../core/AudioPlayer';
import AudioRecorder from '../core/AudioRecorder';

interface UploadResponse {
  success: boolean;
  data: {
    originalUrl: string;
    transformedUrl: string;
  };
}

const UserVoice: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transformedFile, setTransformedFile] = useState<File | null>(null);
  const [localAudioURL, setLocalAudioURL] = useState<string>('');
  const [localTransformedURL, setLocalTransformedURL] = useState<string>('');
  const [generationStatus, setGenStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    setIsLoggedIn(!!token);
  }, []);

  // Handle manual file selection
  const fileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setLocalAudioURL(URL.createObjectURL(file));
    }
  };

  // Handle file upload and transformation
  const fileUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setGenStatus('loading');

    try {
      if (!audioFile) {
        console.error('No audio file available to upload.');
        return;
      }

      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch('http://localhost:4040/api/transform', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transform failed with status: ${response.status}`);
      }

      const blob = await response.blob();
      const transformedURL = URL.createObjectURL(blob);
      setLocalTransformedURL(transformedURL);
      setTransformedFile(new File([blob], 'transformed.wav', { type: 'audio/wav' }));
      setGenStatus('done');
    } catch (err) {
      console.error('Error transforming audio:', err);
      setGenStatus('error');
    }
  };

  // Save the audio pair to the backend
  const saveAudio = async () => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('User is not authenticated.');
      }

      const formData = new FormData();
      if (!audioFile) throw new Error('Original audio file is missing.');
      formData.append('originalFile', audioFile);

      if (!localTransformedURL) throw new Error('Transformed audio URL is missing.');
      const transformedBlob = await fetch(localTransformedURL).then((r) => r.blob());
      const transformedFile = new File([transformedBlob], 'transformed.wav', { type: 'audio/wav' });
      formData.append('transformedFile', transformedFile);

      const uploadResponse = await fetch('http://localhost:4040/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed.');
      }

      const uploadData = await uploadResponse.json();
      const { originalUrl, transformedUrl } = uploadData.data;

      const saveResponse = await fetch('http://localhost:4040/api/save-audio', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl, transformedUrl }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save audio.');
      }

      console.log('Audio saved successfully.');
    } catch (error) {
      console.error('Error saving audio:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card shadow-xl bg-base-100 p-4 mt-4">
      <h2 className="card-title">Your Voice</h2>
      {/* File input for manual uploads */}
      <input
        type="file"
        accept="audio/*"
        className="file-input file-input-bordered file-input-secondary w-full max-w-xs m-1"
        onChange={fileSelect}
      />

      {/* Audio recorder for live recordings */}
      <AudioRecorder setAudioURL={setLocalAudioURL} setAudioFile={setAudioFile} />

      {/* Show original audio player when available */}
      {localAudioURL && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Original Audio:</h3>
          <AudioPlayer audioURL={localAudioURL} />
        </div>
      )}

      {/* Upload and transform button */}
      <button
        className="btn btn-primary mt-2"
        onClick={fileUpload}
        disabled={!audioFile || generationStatus === 'loading'}
      >
        {generationStatus === 'loading' ? 'Processing...' : 'Upload'}
      </button>

      {/* Show loading state */}
      {generationStatus === 'loading' && (
        <div>
          <h2 className="card-title">Your accompAInament is being prepared...</h2>
          <span className="loading loading-bars loading-lg"></span>
        </div>
      )}

      {/* Show audio players after processing */}
      {generationStatus === 'done' && (
        <>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Original Audio:</h3>
            <AudioPlayer audioURL={localAudioURL} />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Transformed Audio:</h3>
            <AudioPlayer audioURL={localTransformedURL} />
          </div>
          {/* Save button for logged-in users */}
          {isLoggedIn && (
            <button
              className={`btn btn-secondary mt-4 ${isSaving ? 'loading' : ''}`}
              onClick={saveAudio}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save this version'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default UserVoice;
