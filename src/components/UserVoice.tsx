// Handle file upload and transformation
const fileUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  setGenStatus('loading');

  try {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    const formData = new FormData();
    if (audioFile) formData.append('file', audioFile);

    const response = await fetch('http://localhost:4040/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Upload response:', responseData);  // Debug log

    if (!responseData.success || !responseData.data) {
      throw new Error('Invalid response format');
    }

    setAudioURL(responseData.data.originalUrl);
    setGenURL(responseData.data.transformedUrl);
    setGenStatus('done');

  } catch (err) {
    console.error('Error:', err);
    setGenStatus('error');
  }
};