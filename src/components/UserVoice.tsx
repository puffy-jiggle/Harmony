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
  // File state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  // URL states
  const [localAudioURL, setLocalAudioURL] = useState<string>('');
  const [supabaseAudioURL, setSupabaseAudioURL] = useState<string>('');
  const [transformedURL, setTransformedURL] = useState<string>('');
  
  // UI states
  const [generationStatus, setGenStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    setIsLoggedIn(!!token);
    console.log('Login status:', !!token);
  }, []);

  const fileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('File selected:', file.name);
      setAudioFile(file);
      const localURL = URL.createObjectURL(file);
      setLocalAudioURL(localURL);
      console.log('Local URL created:', localURL);
    }
  };

  const fileUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setGenStatus('loading');
    console.log('Starting file upload process...');

    try {
      const token = localStorage.getItem('jwtToken');
      if (!token || !audioFile) {
        console.error('No token or file found');
        setGenStatus('error');
        return;
      }

      const formData = new FormData();
      formData.append('file', audioFile);

      console.log('Sending file to server...');
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
      console.log('Server response:', data);

      if (!data.success || !data.data) {
        throw new Error('Invalid server response');
      }

      setSupabaseAudioURL(data.data.originalUrl);
      setTransformedURL(data.data.transformedUrl);
      console.log('URLs updated:', {
        original: data.data.originalUrl,
        transformed: data.data.transformedUrl
      });

      setGenStatus('done');
    } catch (err) {
      console.error('Upload error:', err);
      setGenStatus('error');
    }
  };

  const saveAudio = async () => {
    if (!supabaseAudioURL || !transformedURL) {
      console.error('No URLs to save');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('Not authenticated');
      }

      console.log('Saving audio pair...');
      const response = await fetch('http://localhost:4040/api/save-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          originalUrl: supabaseAudioURL,
          transformedUrl: transformedURL
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
    <div className="card shadow-xl bg-base-100 p-4 mt-4">
      <h2 className="card-title">Your Voice</h2>
      <input
        type="file"
        accept="audio/*"
        className="file-input file-input-bordered file-input-secondary w-full max-w-xs m-1"
        onChange={fileSelect}
      />
      <button
        className="btn btn-primary"
        onClick={fileUpload}
        disabled={!audioFile || generationStatus === 'loading'}
      >
        {generationStatus === 'loading' ? 'Processing...' : 'Upload'}
      </button>

      {generationStatus === 'loading' && (
        <div>
          <h2 className="card-title">Your accompAInament is being prepared...</h2>
          <span className="loading loading-bars loading-lg"></span>
        </div>
      )}

      {generationStatus === 'done' && (
        <>
          <h3>Original Audio:</h3>
          <AudioPlayer audioURL={localAudioURL || supabaseAudioURL} />
          
          <h3>Transformed Audio:</h3>
          <AudioPlayer audioURL={transformedURL} />
          
          {isLoggedIn && (
            <button 
              className={`btn btn-secondary mt-2 ${isSaving ? 'loading' : ''}`}
              onClick={saveAudio}
              disabled={isSaving || !transformedURL}
              title={!isLoggedIn ? 'Log in to save audio' : ''}
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