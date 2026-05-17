import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export const Unauthorized = () => {
  return (
    <div className="error-page">
      <div className="error-content">
        <h1>⛔ 403</h1>
        <h2>Yetkisiz Erişim</h2>
        <p>Bu sayfaya erişim izniniz yok.</p>
        <Link to="/dashboard" className="back-link">
          Panele Dön
        </Link>
      </div>
    </div>
  );
};

export const NotFound = () => {
  return (
    <div className="error-page">
      <div className="error-content">
        <h1>🔍 404</h1>
        <h2>Sayfa Bulunamadı</h2>
        <p>Aradığınız sayfa mevcut değil.</p>
        <Link to="/dashboard" className="back-link">
          Panele Dön
        </Link>
      </div>
    </div>
  );
};
