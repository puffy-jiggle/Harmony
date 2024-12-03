// src/__tests__/frontend/AudioPlayer.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import AudioPlayer from '../../components/AudioPlayer';

describe('AudioPlayer Component', () => {
  it('renders audio element with correct source', () => {
    const testUrl = 'test-audio.mp3';
    const { container } = render(<AudioPlayer audioURL={testUrl} />);
    const audioElement = container.querySelector('audio');
    expect(audioElement).toBeTruthy();
    expect(audioElement?.getAttribute('src')).toBe(testUrl);
  });
});

// src/__tests__/frontend/AudioPlayer.test.tsx