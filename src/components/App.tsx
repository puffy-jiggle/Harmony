import React from "react";
import { Link } from "react-router-dom";
import UserVoice from "./UserVoice"

const App: React.FC = () => {
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Hello My Melody!</h1>
        <button className="btn btn-primary">Primary Button</button>
        <button className="btn btn-secondary">Secondary Button</button>
        <div className="card shadow-xl bg-base-100 p-4 mt-4">
          <h2 className="card-title">DaisyUI Card</h2>
          <p>This is a simple card component using DaisyUI.</p>
        </div>
        <div className="mt-4">
          <Link to="/test" className="btn btn-primary">Go to Test Component</Link>
        </div>
        <UserVoice />
      </div>
    </div>
  );
};

export default App;

