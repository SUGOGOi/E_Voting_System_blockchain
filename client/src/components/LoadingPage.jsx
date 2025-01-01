import React from 'react';
import '../styles/loadingPage.css';

const LoadingPage = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Please wait...</p>
    </div>
  );
};

export default LoadingPage;
