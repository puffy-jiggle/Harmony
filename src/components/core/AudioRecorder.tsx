import React, { useState } from 'react';

interface AudioProps {
  setAudioURL: (url: string) => void; // Better typing
  setAudioFile: (file: File) => void; // Better typing
}

const AudioRecorder: React.FC<AudioProps> = ({ setAudioURL, setAudioFile }) => {
  const [recordingStatus, setRecStatus] = useState<string>('');

  const recordingTimeMS = 6000;

  const wait = (delayInMS: number) => {
    return new Promise((resolve) => setTimeout(resolve, delayInMS));
  };

  const startRecording = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      setRecStatus('select audio input in your browser');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      let countdown = 3;

      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        const audioUrl = URL.createObjectURL(event.data);
        const audioFile = new File([event.data], 'recording.wav', {
          type: 'audio/wav',
        });

        setAudioURL(audioUrl);
        setAudioFile(audioFile);
      };
      setRecStatus(`Recording in ${countdown}`);
      const countdownInterval = setInterval(() => {
        countdown--;
        setRecStatus(`Recording in ${countdown}`);
      }, 1000);
      await wait(3000);
      clearInterval(countdownInterval);
      countdown = 0;
      setRecStatus(`Recording for ${countdown} seconds`);

      recorder.start();
      const countupInterval = setInterval(() => {
        countdown++;
        setRecStatus(`Recording for ${countdown} seconds`);
      }, 1000);
      await wait(recordingTimeMS);
      recorder.stop();
      clearInterval(countupInterval);
      setRecStatus(`Recording for ${++countdown} seconds`);

      // Clean up stream tracks after recording
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error('Error recording:', err);
    }
  };

  return (
    <>
      <div className='card-actions  m-1'>
        <button className='btn btn-circle btn-error' onClick={startRecording}>
          record
        </button>
        {
          <div className='chat chat-start'>
            <div className='chat-bubble chat-bubble-error'>
              {recordingStatus}
            </div>
          </div>
        }
      </div>
    </>
  );
};

export default AudioRecorder;
