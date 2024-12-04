import React from 'react';

interface AudioProps {
  audioURL: string,
}

const AudioPlayer: React.FC<AudioProps> = (props: AudioProps) => {
  const {audioURL} = props
  console.log(audioURL)
  return (
    <div className='card shadow-xl bg-base-100 p-4 mt-4'>
      <audio controls className="outline-accent" src={audioURL}></audio>
    </div>
  );
};

export default AudioPlayer;


