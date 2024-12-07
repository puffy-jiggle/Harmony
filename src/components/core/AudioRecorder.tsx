import React, { useState } from 'react';

interface AudioProps {
  setAudioURL: (url: string) => void;
  setAudioFile: (file: File) => void;
}

const AudioRecorder: React.FC<AudioProps> = (props: AudioProps) => {
  const { setAudioURL, setAudioFile } = props;
  //onst { stream, setStream } = useState<null | MediaStream>(null);

  const recordingTimeMS = 8000;

  const wait = (delayInMS: number) => {
    return new Promise((resolve) => setTimeout(resolve, delayInMS));
  };

  const startRecording = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: true,
      })
      .then((stream) => {
        //setStream(selectedStream);

        const recorder = new MediaRecorder(stream);
        // const audioOptions = {
        //   length: 44100*8,
        //   numberOfChannels: 1,
        //   sampleRate: 44100
        // };

        //const audio = new AudioBuffer(audioOptions);

        recorder.ondataavailable = (event) => {
          setAudioURL(URL.createObjectURL(event.data));
          setAudioFile(
            new File([event.data], 'recording.wav', {
              type: 'audio/wav',
            })
          );
        };
        recorder.start();

        wait(recordingTimeMS).then(() => recorder.stop());
      });
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
