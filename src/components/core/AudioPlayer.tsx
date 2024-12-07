import React, { useEffect } from 'react';

interface AudioProps {
  audioURL: string;
}

const AudioPlayer: React.FC<AudioProps> = (props: AudioProps) => {
  const { audioURL } = props;

  useEffect(() => {
    console.log('AudioPlayer mounted/updated with URL:', audioURL);
  }, [audioURL]);

  return (
    <div className='card shadow-xl bg-base-100 p-4 mt-4'>
      <audio 
        controls 
        className="outline-accent" 
        src={audioURL}
        onError={(e) => console.error('Audio player error:', e)}
        onLoadStart={() => console.log('Audio loading started')}
        onCanPlay={() => console.log('Audio can play')}
      />
    </div>
  );
};

export default AudioPlayer;