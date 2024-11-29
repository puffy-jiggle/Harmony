import React from "react";
import { Link } from "react-router-dom";

const TestComponent: React.FC = () => {
  return (
    <div className="p-8">
      <h1>Test Component</h1>
      <p>This is the TestComponent route.</p>
      <p className="mt-4">
        <Link to="/" className="btn btn-secondary">Back to Home</Link>
      </p>
    </div>
  );
};

export default TestComponent;


