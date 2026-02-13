// client/src/components/Profile.jsx
import React, { useState, useEffect, useCallback} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = ({ token }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // ✅ VERCEL: PRODUCTION BACKEND URL
  const API_BASE = 'https://skillswapproject.onrender.com/api';

  useEffect(() => {
  fetchProfile();
  checkOwnProfile();
}, [fetchProfile, checkOwnProfile]);

 const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/auth/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000 // Vercel timeout for Render cold starts
      });
      setProfile(res.data);
    } catch (err) {
      console.error('Profile fetch error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError('Profile not found or server error');
      }
    } finally {
      setLoading(false);
    }
  }, [userId, token, API_BASE, navigate]);

  const checkOwnProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setIsOwnProfile(res.data._id === userId);
    } catch (err) {
      console.error('Own profile check error:', err);
    }
  }, [token, API_BASE, userId]);

  // 🚀 Edit Profile Handler (Own profile only)
  const handleEditProfile = () => {
    const newBio = prompt('Update your bio (optional):', profile.bio || '');
    const newName = prompt('Update your name:', profile.name);
    
    if (newName && (newBio !== null)) {
      axios.put(`${API_BASE}/auth/profile`, {
        name: newName,
        bio: newBio || ''
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      })
      .then(res => {
        setProfile(res.data);
        alert('✅ Profile updated!');
      })
      .catch(err => {
        console.error('Profile update failed:', err);
        alert('Failed to update profile');
      });
    }
  };

  // 👈 LOADING SCREEN
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '6px solid rgba(255,255,255,0.3)',
          borderTop: '6px solid #00d4ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  // 👈 ERROR SCREEN
  if (error || !profile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: 'clamp(24px, 5vw, 28px)', marginBottom: '16px' }}>👤 Profile Not Found</h2>
          <p style={{ opacity: 0.8, marginBottom: '32px' }}>{error || 'User does not exist'}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
              color: 'white',
              padding: '16px 32px',
              border: 'none',
              borderRadius: '20px',
              fontSize: '18px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,212,255,0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ← Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
      padding: '48px 24px',
      color: 'white'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Back Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '14px 28px',
            borderRadius: '25px',
            cursor: 'pointer',
            marginBottom: '48px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: 'auto'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Dashboard
        </button>

        {/* Profile Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <img 
            src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0d8abc&color=fff&size=128`}
            alt="Profile" 
            style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              border: '4px solid #00d4ff',
              marginBottom: '24px',
              boxShadow: '0 20px 40px rgba(0,212,255,0.3)'
            }} 
          />
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 40px)', margin: '0 0 16px 0', fontWeight: '800' }}>
            {profile.name || 'Unknown User'}
          </h1>
          <p style={{ color: '#00d4ff', fontSize: '20px', margin: '0 0 24px 0', fontWeight: '500' }}>
            {profile.email || 'No email'}
          </p>
          
          {profile.bio && (
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '18px', 
              marginBottom: '32px',
              lineHeight: '1.6',
              fontStyle: 'italic',
              padding: '20px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              borderLeft: '4px solid #00d4ff'
            }}>
              "{profile.bio}"
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '24px', 
          marginBottom: '48px' 
        }}>
          <div style={{
            background: 'rgba(16,185,129,0.2)',
            backdropFilter: 'blur(20px)',
            border: '2px solid #10b981',
            borderRadius: '20px',
            padding: '32px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(16,185,129,0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ fontSize: '48px', color: '#10b981' }}>🏆</div>
            <h3 style={{ color: '#fff', margin: '16px 0 12px 0', fontSize: '18px' }}>Total Swaps</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              {profile.totalSwaps || 0}
            </div>
          </div>

          <div style={{
            background: 'rgba(139,92,246,0.2)',
            backdropFilter: 'blur(20px)',
            border: '2px solid #8b5cf6',
            borderRadius: '20px',
            padding: '32px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(139,92,246,0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ fontSize: '48px', color: '#8b5cf6' }}>📚</div>
            <h3 style={{ color: '#fff', margin: '16px 0 12px 0', fontSize: '18px' }}>Skills Taught</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>
              {profile.skillsTaught || 0}
            </div>
          </div>

          <div style={{
            background: 'rgba(59,130,246,0.2)',
            backdropFilter: 'blur(20px)',
            border: '2px solid #3b82f6',
            borderRadius: '20px',
            padding: '32px',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(59,130,246,0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ fontSize: '48px', color: '#3b82f6' }}>🎯</div>
            <h3 style={{ color: '#fff', margin: '16px 0 12px 0', fontSize: '18px' }}>Skills Learned</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
              {profile.skillsLearned || 0}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ textAlign: 'center', marginBottom: '48px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isOwnProfile && (
            <button 
              onClick={handleEditProfile}
              style={{
                background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                color: 'white',
                padding: '18px 36px',
                border: 'none',
                borderRadius: '25px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0,212,255,0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 40px rgba(0,212,255,0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,212,255,0.4)';
              }}
            >
              ✏️ Edit Profile
            </button>
          )}
          <button 
            onClick={() => navigate('/chatrooms')} 
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              padding: '18px 36px',
              border: 'none',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(59,130,246,0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 40px rgba(59,130,246,0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px rgba(59,130,246,0.4)';
            }}
          >
            💬 Send Message
          </button>
        </div>

        {/* Member Since */}
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '24px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <p style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '16px', 
            margin: 0,
            fontWeight: '500'
          }}>
            Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Unknown'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          div[style*="padding: 48px 24px"] {
            padding: 32px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
