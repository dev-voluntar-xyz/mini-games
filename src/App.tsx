import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import AddGame from './pages/AddGame';
import EditGame from './pages/EditGame';
import GamePlayer from './pages/GamePlayer';
import Settings from './pages/Settings';
import Store from './pages/Store';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 pb-20 sm:pb-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddGame />} />
          <Route path="/store" element={<Store />} />
          <Route path="/game/:id/edit" element={<EditGame />} />
          <Route path="/game/:id" element={<GamePlayer />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Navigation />
    </div>
  );
}

export default App;
