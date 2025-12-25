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
      <div className="min-h-screen bg-gradient-to-br from-ethiopian-green via-ethiopian-green/90 to-ethiopian-green flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl border shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white text-center">
            <Link to="/" className="flex items-center gap-3 justify-center mb-6 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Home className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black">Ethio-Home</span>
            </Link>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-ethiopian-green via-ethiopian-green/90 to-ethiopian-green flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white text-center">
          <Link to="/" className="flex items-center gap-3 justify-center mb-6 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Home className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black">Ethio-Home</span>
          </Link>
          
          <div className="verification-status">
            {status === 'success' ? (
              <>
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                  <div className="text-4xl mb-2">🎉</div>
                </div>
                <h2 className="text-2xl font-black mb-2">Email Verified Successfully!</h2>
                <p className="text-white/90 mb-6">{message}</p>
                {verificationResult?.data?.token ? (
                  <div className="px-8 pb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                      <p className="text-white/90 mb-2">
                        Redirecting to your dashboard in <strong className="text-white">{countdown}</strong> seconds...
                      </p>
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-white h-full transition-all duration-1000" 
                          style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const userRole = verificationResult.data.data.user.role;
                        redirectToDashboard(userRole, navigate);
                      }} 
                      className="w-full py-4 bg-white text-ethiopian-green rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      Go to Dashboard Now
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="px-8 pb-8">
                    <Link to="/login" className="block w-full py-4 bg-white text-ethiopian-green rounded-xl font-bold hover:shadow-xl transition-all text-center">
                      Go to Login
                      <ArrowRight className="w-5 h-5 inline ml-2" />
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                  <XCircle className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-2xl font-black mb-2">Verification Failed</h2>
                <p className="text-white/90 mb-6">{message}</p>
                <div className="px-8 pb-8 space-y-3">
                  <Link to="/login" className="block w-full py-4 bg-white text-ethiopian-green rounded-xl font-bold hover:shadow-xl transition-all text-center">
                    <Mail className="w-5 h-5 inline mr-2" />
                    Try Again with Login
                  </Link>
                  <Link to="/signup" className="block w-full py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-all text-center">
                    Create New Account
                  </Link>
                  <p className="text-white/80 text-sm text-center mt-4">
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
