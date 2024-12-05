import React, { useState, useEffect } from 'react';
import AudioPlayer from './AudioPlayer';

const UserVoice: React.FC = () => {
  const [audioFile, setAudioFile] = useState<null | File>(null);
  const [audioURL, setAudioURL] = useState<string>('');
  const [generationStatus, setGenStatus] = useState<string | null>(null);
  const [genURL, setGenURL] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Check login status on component mount
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    setIsLoggedIn(!!token);
  }, []);

  const saveGeneratedAudio = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
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

      // Show success message or update UI
      alert('Audio saved successfully!');
    } catch (error) {
      console.error('Error saving audio:', error);
      alert('Failed to save audio');
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

  const fileUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setGenStatus('loading');

    const formData = new FormData();
    if (audioFile) {
      formData.append('file', audioFile);
    }

    fetch('http://localhost:4040/api/upload', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.blob())
      .then((blob) => {
        setGenURL(URL.createObjectURL(blob));
        console.log(genURL)
        setGenStatus('done');
      })
      .catch((err) => console.error('Error occurred', err));
  };

  return (
    <div className='card shadow-xl bg-base-100 p-4 mt-4'>
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
          {isLoggedIn && (
            <button 
              className='btn btn-secondary mt-2'
              onClick={saveGeneratedAudio}
            >
              Save this version
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
