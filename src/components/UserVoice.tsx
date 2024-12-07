import React, { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

interface UploadResponse {
  success: boolean;
  data: {
    originalUrl: string;
    transformedUrl: string;
  };
}

const UserVoice: React.FC = () => {
  // State management
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string>('');
  const [generationStatus, setGenStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [genURL, setGenURL] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Check login status on mount
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    setIsLoggedIn(!!token);
  }, []);

  // Handle file selection
  const fileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setAudioURL(URL.createObjectURL(file));
    }
  };

  // Handle file upload and transformation
  const fileUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setGenStatus('loading');

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token || !audioFile) {
        console.error('No token or file found');
        setGenStatus('error');
        return;
      }

      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fetch('http://localhost:4040/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data: UploadResponse = await response.json();
      console.log('Upload response:', data);

      if (!data.success || !data.data) {
        throw new Error('Invalid server response');
      }

      setAudioURL(data.data.originalUrl);
      setGenURL(data.data.transformedUrl);
      setGenStatus('done');

    } catch (err) {
      console.error('Error:', err);
      setGenStatus('error');
    }
  };

  // Save audio pair
  const saveGeneratedAudio = async () => {
    if (!audioURL || !genURL) {
      console.error('No audio URLs to save');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('http://localhost:4040/api/save-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          originalUrl: audioURL,
          transformedUrl: genURL
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save audio');
      }

      console.log('Audio saved successfully');
    } catch (error) {
      console.error('Error saving audio:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='card shadow-xl bg-base-100 p-4 mt-4'>
      <h2 className='card-title'>Your Voice</h2>
      <input
        type='file'
        accept="audio/*"
        className='file-input file-input-bordered file-input-secondary w-full max-w-xs m-1'
        onChange={fileSelect}
      />
      <div className='card-actions justify-end m-1'>
        <button className='btn btn-circle btn-error'>record</button>
      </div>
      <AudioPlayer audioURL={audioURL} />
      <button
        className='btn btn-primary'
        onClick={fileUpload}
        disabled={!audioFile || generationStatus === 'loading'}
      >
        {generationStatus === 'loading' ? 'Processing...' : 'Upload'}
      </button>
      {generationStatus !== 'idle' && (
        <h2 className='card-title'>Your accompAInament</h2>
      )}
      {generationStatus === 'done' ? (
        <>
          <AudioPlayer audioURL={genURL} />
          {isLoggedIn && (
            <button 
              className={`btn btn-secondary mt-2 ${isSaving ? 'loading' : ''}`}
              onClick={saveGeneratedAudio}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save this version'}
            </button>
          )}
        </>
      ) : generationStatus === 'loading' ? (
        <span className='loading loading-bars loading-lg'></span>
      ) : null}
    </div>
  );
};

export default UserVoice;