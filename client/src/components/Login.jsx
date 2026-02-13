import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setToken }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // ✅ VERCEL-OPTIMIZED: Timeout + Headers for Render backend
      const res = await axios.post('https://skillswapproject.onrender.com/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000 // 15s timeout (Render cold starts)
      });
      
      console.log('✅ LOGIN SUCCESS:', res.data.token ? 'Token received!' : 'NO TOKEN!');
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.log('❌ LOGIN ERROR:', err.response?.data || err.message);
      
      // ✅ VERCEL-SPECIFIC ERROR HANDLING
      if (err.code === 'ECONNABORTED') {
        setError('Server slow. Please try again.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Wait 30 seconds.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Backend waking up...');
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 50%, #00d4ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated cyan particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          width: '18px',
          height: '18px',
          background: 'rgba(0,212,255,0.4)',
          borderRadius: '50%',
          animation: 'float 7s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '70%',
          right: '10%',
          width: '22px',
          height: '22px',
          background: 'rgba(96,240,255,0.3)',
          borderRadius: '50%',
          animation: 'float 9s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '25%',
          left: '80%',
          width: '16px',
          height: '16px',
          background: 'rgba(0,212,255,0.5)',
          borderRadius: '50%',
          animation: 'float 5s ease-in-out infinite'
        }} />
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(30px)',
        borderRadius: '32px',
        border: '1px solid rgba(0,212,255,0.3)',
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 32px 64px rgba(0,212,255,0.2)',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '40px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #00d4ff, #60f0ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
            letterSpacing: '-0.02em'
          }}>
            SkillSwap
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.8)', 
            fontSize: '18px', 
            fontWeight: '500' 
          }}>
            Welcome back to skill exchange
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.2)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: '16px',
            marginBottom: '24px',
            fontSize: '14px',
            backdropFilter: 'blur(10px)'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Email */}
          <div>
            <label style={{ 
              display: 'block', 
              color: 'rgba(255,255,255,0.9)', 
              fontWeight: '600', 
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}  // ✅ VERCEL: Prevent double-submit
              style={{
                width: '100%',
                padding: '18px 24px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(0,212,255,0.4)',
                borderRadius: '20px',
                color: 'white',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => !loading && (e.target.style.borderColor = 'rgba(0,212,255,0.8)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(0,212,255,0.4)')}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ 
              display: 'block', 
              color: 'rgba(255,255,255,0.9)', 
              fontWeight: '600', 
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}  // ✅ VERCEL: Prevent double-submit
              style={{
                width: '100%',
                padding: '18px 24px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(0,212,255,0.4)',
                borderRadius: '20px',
                color: 'white',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => !loading && (e.target.style.borderColor = 'rgba(0,212,255,0.8)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(0,212,255,0.4)')}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '20px',
              background: loading 
                ? 'rgba(0,212,255,0.6)' 
                : 'linear-gradient(135deg, #00d4ff, #0099cc)',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 12px 32px rgba(0,212,255,0.4)'
            }}
          >
            {loading ? (
              <>
                <span style={{ marginRight: '12px' }}>⏳</span>
                Signing In...
              </>
            ) : (
              <>
                <span style={{ marginRight: '12px' }}>🔑</span>
                Sign In
              </>
            )}
          </button>
        </form>

        <style>{`
          @keyframes float { 
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @media (max-width: 768px) {
            div[style*="padding: 48px"] {
              padding: 32px 24px;
              margin: 16px;
            }
            h1[style*="fontSize: 40px"] {
              font-size: 32px;
            }
          }
        `}</style>

        {/* Register Link */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px', 
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Need an account?{' '}
            <Link 
              to="/register" 
              style={{
                color: '#60f0ff',
                fontWeight: '700',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              Create Account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
