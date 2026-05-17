import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız oldu');
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
        <h1>Kayıt Ol</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px', visibility: 'visible', opacity: 1, display: 'block' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontWeight: 600, fontSize: '14px' }}>Ad</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Adınızı girin"
              style={{ width: '100%', padding: '12px 15px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff', color: '#2d3748', boxSizing: 'border-box', display: 'block' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px', visibility: 'visible', opacity: 1, display: 'block' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontWeight: 600, fontSize: '14px' }}>Soyadı</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Soyadınızı girin"
              style={{ width: '100%', padding: '12px 15px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff', color: '#2d3748', boxSizing: 'border-box', display: 'block' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px', visibility: 'visible', opacity: 1, display: 'block' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontWeight: 600, fontSize: '14px' }}>E-posta</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="E-posta adresinizi girin"
              style={{ width: '100%', padding: '12px 15px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff', color: '#2d3748', boxSizing: 'border-box', display: 'block' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px', visibility: 'visible', opacity: 1, display: 'block' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontWeight: 600, fontSize: '14px' }}>Şifre</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Şifrenizi girin (en az 6 karakter)"
              style={{ width: '100%', padding: '12px 15px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff', color: '#2d3748', boxSizing: 'border-box', display: 'block' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px', visibility: 'visible', opacity: 1, display: 'block' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontWeight: 600, fontSize: '14px' }}>Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '12px 15px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#ffffff', color: '#2d3748', boxSizing: 'border-box', display: 'block' }}
            >
              <option value="student">Öğrenci</option>
              <option value="staff">Personel</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>
        <p className="auth-link">
          Zaten hesabınız var mı? <Link to="/login">Giriş yapın</Link>
        </p>
      </div>
    </div>
  );
};
