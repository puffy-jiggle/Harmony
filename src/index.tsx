import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./components/App";
import TestComponent from "./components/TestComponent";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/test" element={<TestComponent />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);


// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import "./index.css";
// import App from "./components/App";
// import TestComponent from "./components/TestComponent";

// const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

// root.render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<App />} />
//         <Route path="/test" element={<TestComponent />} />
//       </Routes>
//     </BrowserRouter>
//   </React.StrictMode>
// );
