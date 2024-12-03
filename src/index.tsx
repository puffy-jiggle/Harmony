import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Core routing components
import App from "./components/App";
import TestComponent from "./components/TestComponent";

/**
 * Main Application Entry Point
 * 
 * This file sets up:
 * - React DOM rendering
 * - Client-side routing configuration
 * - Application component structure
 * 
 * Routing Structure:
 * - '/'    -> App component (home page)
 * - '/app' -> App component (alternate route)
 * - '/test' -> TestComponent (test/demo page)
 */

// Create root element for React rendering
// TypeScript assertion ensures root element exists in index.html
const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

// Render the application
root.render(
  // StrictMode enables additional development checks and warnings
  <React.StrictMode>
    {/* BrowserRouter enables client-side routing */}
    <BrowserRouter>
      {/* Routes component groups all route definitions */}
      <Routes>
        {/* Individual route definitions */}
        <Route path="/" element={<App />} />          {/* Home route */}
        <Route path="/test" element={<TestComponent />} />  {/* Test route */}
        <Route path="/app" element={<App />} />       {/* Alternate App route */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

/**
 * Development Notes:
 * 
 * Adding New Routes:
 * 1. Import your component at the top
 * 2. Add a new <Route> element inside <Routes>
 * 3. Define the path and element props
 * 
 * Example:
 * <Route path="/new-feature" element={<NewFeature />} />
 * 
 * Important Considerations:
 * - All routes must be defined within the <Routes> component
 * - The 'path' prop defines the URL path
 * - The 'element' prop takes a JSX element to render
 * - Update the server.ts catch-all route if adding new API endpoints
 * 
 * Webpack Dev Server:
 * - Routes are accessible through port 3033
 * - Example: http://localhost:3033/test
 * 
 * Express Server:
 * - API routes are handled on port 8080
 * - Example: http://localhost:8080/api/test
 */

