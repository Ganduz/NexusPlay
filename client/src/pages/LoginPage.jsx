import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGamepad } from 'react-icons/fa';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import '../styles/pages/AuthPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { mergeCart } = useCartStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(e => ({ ...e, [e.target?.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      await login(form);
      await mergeCart();
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fadeInUp">
        <div className="auth-header">
          <FaGamepad className="auth-logo" />
          <h1>Welcome Back</h1>
          <p>Sign in to your NexusPlay account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label><FaEnvelope /> Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" autoComplete="email" />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label><FaLock /> Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" />
            {errors.password && <span className="auth-error">{errors.password}</span>}
          </div>

          <div className="auth-remember-row">
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              /> Remember me
            </label>
          </div>

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
