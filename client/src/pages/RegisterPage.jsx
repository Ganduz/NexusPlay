import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUser, FaGamepad } from 'react-icons/fa';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';
import '../styles/pages/AuthPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const { mergeCart } = useCartStore();
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.username) newErrors.username = 'Username is required';
    else if (form.username.length < 3) newErrors.username = 'Min 3 characters';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setIsLoading(true);
    try {
      await register({ email: form.email, username: form.username, password: form.password });
      await mergeCart();
      toast.success('Account created!');
      navigate('/', { replace: true });
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
          <h1>Create Account</h1>
          <p>Join the NexusPlay community</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label><FaEnvelope /> Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label><FaUser /> Username</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Choose a username" />
            {errors.username && <span className="auth-error">{errors.username}</span>}
          </div>

          <div className="auth-field">
            <label><FaLock /> Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" />
            {errors.password && <span className="auth-error">{errors.password}</span>}
          </div>

          <div className="auth-field">
            <label><FaLock /> Confirm Password</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
            {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
