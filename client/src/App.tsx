import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { BrowseBooks } from './pages/BrowseBooks';
import { Library } from './pages/Library';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-primary">
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/library" replace />} />
          <Route path="/browse" element={<BrowseBooks />} />
           <Route path="/library" element={<Library />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;