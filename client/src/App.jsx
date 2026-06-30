import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import { scrollToTop } from './utils/helpers';

function App() {
  const { initialize, isLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="loading-page">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:slug" element={<GamePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/checkout" element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          } />
          <Route path="/order-confirmation/:id" element={
            <ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>
          } />
          <Route path="/profile/*" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a2e',
            color: '#f0f0f5',
            border: '1px solid #252540',
            borderRadius: '8px',
            fontFamily: "'Exo 2', sans-serif",
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#1a1a2e' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' },
          },
        }}
      />
    </>
  );
}

export default App;
