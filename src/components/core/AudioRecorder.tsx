import React, { useState } from 'react';

interface AudioProps {
  setAudioURL: (url: string) => void;  // Better typing
  setAudioFile: (file: File) => void;  // Better typing
}

const AudioRecorder: React.FC<AudioProps> = ({ setAudioURL, setAudioFile }) => {
  const recordingTimeMS = 8000;

  const wait = (delayInMS: number) => {
    return new Promise((resolve) => setTimeout(resolve, delayInMS));
  };

  const startRecording = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        const audioUrl = URL.createObjectURL(event.data);
        const audioFile = new File([event.data], 'recording.wav', {
          type: 'audio/wav',
        });
        
        setAudioURL(audioUrl);
        setAudioFile(audioFile);
      };

      recorder.start();
      await wait(recordingTimeMS);
      recorder.stop();
      
      // Clean up stream tracks after recording
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Error recording:', err);
    }
  };

  return (
    <div className='card-actions justify-end m-1'>
      <button className='btn btn-circle btn-error' onClick={startRecording}>
        record
      </button>
    </div>
  );
};

export default AudioRecorder;