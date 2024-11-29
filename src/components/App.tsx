import React from "react";
import { Link } from "react-router-dom";

const App: React.FC = () => {
  return (
    <div className="p-8">
      <h1>Welcome to HarmonyMaker</h1>
      <p className="mt-4">
        <Link to="/test" className="btn btn-primary">Go to Test Component</Link>
      </p>
    </div>
  );
};

export default App;


// import React from "react";
// import { useEffect } from "react";
// import TestComponent from "./TestComponent"; // Import your TestComponent

// const App: React.FC = () => {
//   useEffect(() => {
//     console.log("App component mounted"); // Example useEffect for future functionality
//   }, []);

//   return (
//     <div>
//       <h1>Welcome to HarmonyMaker</h1>
//       <TestComponent /> {/* Render TestComponent here */}
//     </div>
//   );
// };

// export default App;
