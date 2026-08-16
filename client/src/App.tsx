import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { BrowseBooks } from "./pages/BrowseBooks";
import { Library } from "./pages/Library";
import { ReadingPlan } from "./pages/ReadingPlan";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-primary">
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/library" replace />} />
          <Route path="/browse" element={<BrowseBooks />} />
          <Route path="/library" element={<Library />} />
          <Route path="/plan" element={<ReadingPlan />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
