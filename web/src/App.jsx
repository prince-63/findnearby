import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FeedPage from './pages/FeedPage';
import BrokerPage from './pages/BrokerPage';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NavigationBar from './components/NavigationBar';

function App() {
  return (
    <BrowserRouter>
      <NavigationBar />

      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/brokers" element={<BrokerPage />} />
        <Route path="/conversations" element={<ChatPage />} />
        <Route path="/conversations/:conversationId" element={<ChatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
