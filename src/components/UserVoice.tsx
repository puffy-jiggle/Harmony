import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';

const UserVoice: React.FC = () => {
  const [audioFile, setAudioFile] = useState<null | File>(null);
  const [audioURL, setAudioURL] = useState<string>('');

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

    const formData = new FormData();
    if (audioFile) {
      formData.append('file', audioFile);
    }

    fetch('http://localhost:8080/api/upload', {
      method: 'POST',
      body: formData,
    }).then(res=>console.log(res))
    .catch(err => console.error('Error occurred', err));
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
      <button className='btn btn-primary' onClick={fileUpload}>upload</button>
    </div>
  );
};

export default UserVoice;
