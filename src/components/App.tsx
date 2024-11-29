import React from "react";
import { Link } from "react-router-dom"; // Import Link for client-side navigation
import UserVoice from "./UserVoice"

/**
 * App Component - Main landing page of the Harmony application
 * 
 * This component demonstrates the integration of:
 * - TailwindCSS for utility-first styling
 * - DaisyUI for pre-built components and themes
 * - React Router for navigation
 * 
 * Styling Notes:
 * - Uses Tailwind's flexbox and spacing utilities
 * - Implements DaisyUI's button and card components
 * - Responsive by default through Tailwind classes
 */
const App: React.FC = () => {
  return (
    // Container div with full viewport height and centered content
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      {/* Content wrapper with centered text alignment */}
      <div className="text-center">
        {/* Main heading with Tailwind's typography and spacing classes */}
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Hello My Melody!</h1>
        
        {/* DaisyUI button examples showing different styles */}
        <button className="btn btn-primary">Primary Button</button>
        <button className="btn btn-secondary">Secondary Button</button>
        
        {/* DaisyUI card component with custom styling */}
        <div className="card shadow-xl bg-base-100 p-4 mt-4">
          <h2 className="card-title">DaisyUI Card</h2>
          <p>This is a simple card component using DaisyUI.</p>
        </div>

        {/* Navigation section using React Router's Link component */}
        <div className="mt-4">
          {/* Link wraps the button for client-side routing to /test */}
          <Link to="/test" className="btn btn-primary">Go to Test Component</Link>
        </div>
        <UserVoice />
      </div>
    </div>
  );
};

export default App;

/**
 * Usage Notes:
 * - This component is rendered at both '/' and '/app' routes
 * - Demonstrates basic DaisyUI components: buttons and cards
 * - Shows how to combine Tailwind utilities with DaisyUI components
 * 
 * Development Tips:
 * - Add new routes in index.tsx
 * - Tailwind classes can be customized in tailwind.config.js
 * - DaisyUI theme can be modified in the same config file
 */