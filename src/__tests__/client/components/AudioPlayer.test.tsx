// src/__tests__/client/components/AudioPlayer.test.tsx
import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import AudioPlayer from '../../../components/core/AudioPlayer';

describe('AudioPlayer Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<AudioPlayer audioURL="test.mp3" />);
    const audioElement = container.querySelector('audio');
    expect(audioElement).toBeInTheDocument();
  });
});

