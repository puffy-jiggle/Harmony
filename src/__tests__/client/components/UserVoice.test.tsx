// src/__tests__/frontend/UserVoice.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import UserVoice from '../../../components/features/UserVoice';

describe('UserVoice Component', () => {
  it('renders all required elements', () => {
    const { container } = render(<UserVoice />);
    const fileInput = container.querySelector('input[type="file"]');
    const uploadButton = container.querySelector('.btn-primary');
    const recordButton = container.querySelector('.btn-error');
    
    expect(fileInput).toBeTruthy();
    expect(uploadButton).toBeTruthy();
    expect(recordButton).toBeTruthy();
  });
});

// src/__tests__/frontend/UserVoice.test.tsx