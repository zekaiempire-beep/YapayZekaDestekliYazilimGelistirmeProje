import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="decoration-1"></div>
      <div className="decoration-2"></div>
      <div className="decoration-3"></div>
      <div className="decoration-4"></div>
      <div className="decoration-5"></div>
      <div className="auth-card">
        <h1>Giriş Yap</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px', visibility: 'visible', opacity: 1, display: 'block' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontWeight: 600, fontSize: '14px' }}>E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="E-posta adresinizi girin"
              style={{ width: '100%', padding: '12px 15px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff', color: '#2d3748', boxSizing: 'border-box', display: 'block' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px', visibility: 'visible', opacity: 1, display: 'block' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontWeight: 600, fontSize: '14px' }}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Şifrenizi girin"
              style={{ width: '100%', padding: '12px 15px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff', color: '#2d3748', boxSizing: 'border-box', display: 'block' }}
            />
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <p className="auth-link">
          Hesabınız yok mu? <Link to="/register">Kayıt olun</Link>
        </p>
      </div>
    </div>
  );
};
