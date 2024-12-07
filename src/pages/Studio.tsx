import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AudioPair } from '../server/types';
import AudioPlayer from '../components/core/AudioPlayer';
import Navigation from '../components/core/Navigation';

/**
 * Studio Component - User's personal studio page
 * 
 * Features:
 * - Displays user's saved harmonies in a responsive grid
 * - Maintains consistent styling with main application
 * - Implements loading states and error handling
 * 
 * Styling Notes:
 * - Uses DaisyUI card components
 * - Implements responsive grid layout
 * - Maintains consistent theme with main application
 */
const Studio = () => {
  const [audioPairs, setAudioPairs] = useState<AudioPair[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAudio = async () => {
      try {
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        const response = await fetch(`http://localhost:4040/api/audio/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch audio');
        
        const data = await response.json();
        setAudioPairs(data.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAudio();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navigation />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <h2 className="text-xl font-semibold mb-4">Loading your harmonies...</h2>
          <span className="loading loading-bars loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">
          Your Harmony Studio
        </h1>
        
        {audioPairs.length === 0 ? (
          <div className="card bg-base-100 shadow-xl max-w-md mx-auto">
            <div className="card-body text-center">
              <h2 className="card-title justify-center">No harmonies yet</h2>
              <p>Start creating your first harmony!</p>
              <div className="card-actions justify-center mt-4">
                <button 
                  onClick={() => navigate('/')} 
                  className="btn btn-primary"
                >
                  Create New Harmony
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audioPairs.map((pair) => (
              <div key={pair.original_id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Harmony #{pair.original_id}</h2>
                  <p className="text-sm opacity-70">
                    {new Date(pair.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="space-y-4 mt-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Original</h3>
                      <AudioPlayer audioURL={pair.original_url} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Harmony</h3>
                      <AudioPlayer audioURL={pair.transformed_url} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Studio;

/**
 * Usage Notes:
 * - Requires authentication to access
 * - Displays saved harmonies in a responsive grid
 * - Maintains consistent styling with main application
 * 
 * Development Tips:
 * - Grid layout can be customized in tailwind.config.js
 * - Audio player styling matches main application theme
 */