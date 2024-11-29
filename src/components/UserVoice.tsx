import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';

const UserVoice: React.FC = () => {
  const [audioURL, setAudioURL] = useState<string>('');

  return (
    <div className='card shadow-xl bg-base-100 p-4 mt-4'>
      <h2 className='card-title'>Your Voice</h2>
      <input
        type='file'
        className='file-input file-input-bordered file-input-secondary w-full max-w-xs m-1'
        onChange={(e) =>
          e.target.files
            ? setAudioURL(URL.createObjectURL(e.target.files[0]))
            : 'no files'
        }
      />
      <div className='card-actions justify-end m-1'>
        <button className='btn btn-circle btn-error'>record</button>
      </div>
      <AudioPlayer audioURL={audioURL} />
      <button className="btn btn-primary">upload</button>
    </div>
  );
};

export default UserVoice;
