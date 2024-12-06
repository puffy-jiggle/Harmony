import React, { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

const UserVoice: React.FC = () => {
  const [audioFile, setAudioFile] = useState<null | File>(null);
  const [audioURL, setAudioURL] = useState<string>('');
  const [generationStatus, setGenStatus] = useState<string | null>(null);
  const [genURL, setGenURL] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Check login status on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('jwtToken');
      console.log('Current token:', token); // Debug log
      if (token) {
        try {
          // Optional: Basic token validation
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            console.log('Invalid token structure');
            localStorage.removeItem('jwtToken');
            setIsLoggedIn(false);
            return;
          }
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Token validation error:', error);
          setIsLoggedIn(false);
        }
      } else {
        console.log('No token found');
        setIsLoggedIn(false);
      }
    };
    // Check login status and set up interval
    checkLoginStatus();
    const interval = setInterval(checkLoginStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

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
  
      // Make sure to include Authorization header
      const response = await fetch('http://localhost:4040/api/save-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add this line
        },
        body: JSON.stringify({
          originalUrl: audioURL,
          transformedUrl: genURL
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save audio');
      }
  
      const result = await response.json();
      console.log('Save successful:', result);
      // Maybe add some user feedback here
      // setSuccessMessage('Audio saved successfully!');
  
    } catch (error) {
      console.error('Error saving audio:', error);
      // Maybe add some user feedback here
      // setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  console.log(audioFile);

  const fileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      console.log(e.target.value);
      setAudioFile(e.target.files[0]);
      setAudioURL(URL.createObjectURL(e.target.files[0]));
    }
  };

const fileUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  setGenStatus('loading');

  try {
    const formData = new FormData();
    if (audioFile) formData.append('file', audioFile);

    const response = await fetch('http://localhost:4040/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setGenURL(url);
    setGenStatus('done');

  } catch (err) {
    console.error('Error:', err);
    setGenStatus('error');
  }
};

  return (
    <div className='card shadow-xl bg-base-100 p-4 mt-4'>
      {(() => {
        console.log('Render state:', { isLoggedIn, generationStatus });
        return null;
      })()}   
      <h2 className='card-title'>Your Voice</h2>
      <input
        type='file'
        className='file-input file-input-bordered file-input-secondary w-full max-w-xs m-1'
        onChange={fileSelect}
      />
      <div className='card-actions justify-end m-1'>
        <button className='btn btn-circle btn-error'>record</button>
      </div>
      <AudioPlayer audioURL={audioURL} />
      <button className='btn btn-primary' onClick={fileUpload}>
        upload
      </button>
      {generationStatus ? (
        <h2 className='card-title'>Your accompAInament</h2>
      ) : null}
      {generationStatus === 'done' ? (
        <>
          <AudioPlayer audioURL={genURL} />
          {isLoggedIn && generationStatus === 'done' && (
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
