import React, { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';
import AudioRecorder from './AudioRecorder';

const UserVoice: React.FC = () => {
  const [audioFile, setAudioFile] = useState<null | File>(null);
  const [audioURL, setAudioURL] = useState<string>('');
  const [generationStatus, setGenStatus] = useState<string | null>(null);
  const [genURL, setGenURL] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Check login status on component mount
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    setIsLoggedIn(!!token);
  }, []);

  // Handle file selection
  const fileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAudioFile(e.target.files[0]);
      setAudioURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handle file upload and transformation
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

  // Save the audio pair
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          originalUrl: audioURL,
          transformedUrl: genURL,
        }),
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
        className='file-input file-input-bordered file-input-secondary w-full max-w-xs m-1'
        onChange={fileSelect}
      />
      <AudioRecorder setAudioURL={setAudioURL} setAudioFile={setAudioFile} />
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
