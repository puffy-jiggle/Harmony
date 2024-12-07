import React from "react";
import { Link } from "react-router-dom";
import UserVoice from "../features/UserVoice";
import Navigation from "../core/Navigation";

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
    <div className="bg-base-200 min-h-screen flex flex-col">
      {/* Navigation bar */}
      <Navigation />

      {/* Main content container with centered content */}
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          {/* Main heading with Tailwind's typography and spacing classes */}
          <h1 className="text-4xl font-bold text-primary mb-4">Create Your Harmony</h1>
          
          {/* Main recording interface */}
          <UserVoice />

          {/* Sample navigation button */}
          <div className="mt-4">
            <Link to="/test" className="btn btn-secondary">
              Try Test Component
            </Link>
          </div>
        </div>
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