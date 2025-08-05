import { Home, CheckCircle, XCircle, Mail, ArrowRight, PartyPopper } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { redirectToDashboard } from '../utils/dashboardRedirect';

const EmailVerification = () => {
  const { t } = useLanguage();
  const { login, verifyEmail } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const performVerification = async () => {
      if (!userId) {
        setStatus('error');
        setMessage('Invalid verification link. Please use the link again or create a new account.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await verifyEmail(userId);
        setVerificationResult(result);
        console.log('result', result.success);
        
        if (result.success) {
          setStatus('success');
          setMessage('Email verified successfully! Welcome to Ethio-Home!');
          
          // Auto-login the user if verification was successful
          if (result.data?.token) {
            // Start countdown for redirect
            const timer = setInterval(() => {
              setCountdown((prev) => {
                if (prev <= 1) {
                  clearInterval(timer);
                  // Redirect to role-specific dashboard
                  const userRole = result.data.data.user.role;
                  redirectToDashboard(userRole, navigate);
                }
                return prev - 1;
              });
            }, 1000);
            
            // Cleanup function
            return () => clearInterval(timer);
          } else {
            // If no token but verification was successful, redirect to login
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          }
        } else {
          setStatus('error');
          setMessage('Verification Failed. Please use the link again or create a new account.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('Verification Failed. Please use the link again or create a new account.');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [userId, navigate, verifyEmail]);

  // Cleanup countdown timer when component unmounts
  useEffect(() => {
    return () => {
      // This will run when component unmounts
      // The countdown timer is already cleaned up in the verification effect
    };
  }, []);

  if (loading) {
    return (
      <div className="email-verification-container">
        <div className="verification-card">
          <div className="verification-header">
            <Link to="/" className="auth-logo">
              <div className="auth-logo-icon">
                <Home style={{ width: "24px", height: "24px", color: "white" }} />
              </div>
              <span className="auth-logo-text">Ethio-Home</span>
            </Link>
            
            <div className="loading-spinner">
              <div className="spinner"></div>
              <h2>Verifying your email...</h2>
              <p>Please wait while we verify your email address.</p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-verification-container">
      <div className="verification-card">
        <div className="verification-header">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">
              <Home style={{ width: "24px", height: "24px", color: "white" }} />
            </div>
            <span className="auth-logo-text">Ethio-Home</span>
          </Link>
          
          <div className="verification-status">
            {status === 'success' ? (
              <>
                <div className="success-animation">
                  <div className="status-icon success">
                    <CheckCircle style={{ width: "64px", height: "64px" }} />
                  </div>
                  <div className="celebration-icon">
                    <PartyPopper style={{ width: "32px", height: "32px" }} />
                  </div>
                </div>
                <h2 className="success-title">🎉 Email Verified Successfully! 🎉</h2>
                <p className="success-message">{message}</p>
                {verificationResult?.data?.token ? (
                  <div className="verification-actions">
                    <div className="success-info">
                      <p className="redirect-message">
                        You will be automatically redirected to your dashboard in <strong>{countdown}</strong> seconds...
                      </p>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="action-buttons">
                      <button 
                        onClick={() => {
                          // Redirect to role-specific dashboard
                          const userRole = verificationResult.data.data.user.role;
                          redirectToDashboard(userRole, navigate);
                        }} 
                        className="btn btn-primary"
                      >
                        Go to Dashboard Now
                        <ArrowRight style={{ width: "16px", height: "16px" }} />
                      </button>
                      <p className="manual-redirect">
                        Or wait for automatic redirect...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="verification-actions">
                    <Link to="/login" className="btn btn-primary">
                      Go to Login
                      <ArrowRight style={{ width: "16px", height: "16px" }} />
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="status-icon error">
                  <XCircle style={{ width: "64px", height: "64px" }} />
                </div>
                <h2 className="error-title">Verification Failed</h2>
                <p className="error-message">{message}</p>
                <div className="verification-actions">
                  <Link to="/login" className="btn btn-primary">
                    <Mail style={{ width: "16px", height: "16px" }} />
                    Try Again with Login
                  </Link>
                  <Link to="/signup" className="btn btn-secondary">
                    Create New Account
                  </Link>
                  <p className="error-help">
                    If you continue to have issues, please contact our support team.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
