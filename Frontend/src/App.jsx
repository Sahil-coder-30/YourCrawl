import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import Landing from "./pages/Landing/Landing";
import Dashboard from "./pages/Dashboard/Dashboard";
import Config from "./pages/Config/Config";
import Analysis from "./pages/Analysis/Analysis";
import Roadmap from "./pages/Roadmap/Roadmap";
import Compliance from "./pages/Compliance/Compliance";
import Audits from "./pages/Audits/Audits";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/config" element={<Config />} />
          <Route path="/audits" element={<Audits />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </div>
  );
}

export default App;
