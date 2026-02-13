import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SkillMatching = ({ token }) => {
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // ✅ STANDARDIZED BACKEND URL
  const API_BASE = 'https://skillswap-backend.onrender.com';

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await axios.get(`${API_BASE}/api/skills/public${params}`, {
          timeout: 15000 
        });
        setSkills(res.data);
      } catch (err) {
        console.error('Search error:', err.response?.data || err.message);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, API_BASE]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const requestSwap = async (skill) => {
    const targetUserName = skill.userId?.name || 'User';
    if (!window.confirm(`Request swap "${skill.title}" with ${targetUserName}?`)) return;
    
    try {
      // 1. Get current user's skills to pick one to swap WITH
      const mySkillsRes = await axios.get(`${API_BASE}/api/skills`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });
      
      if (!mySkillsRes.data.length) {
        alert('⚠️ You need to add at least one skill to your profile before swapping!');
        navigate('/dashboard');
        return;
      }
      
      const mySkill = mySkillsRes.data[0];

      // ✅ FIX: Ensure we send IDs, not Objects
      // If userId is populated, we need ._id. If not, it's already the ID.
      const fromId = mySkill.userId?._id || mySkill.userId;
      const toId = skill.userId?._id || skill.userId;

      await axios.post(`${API_BASE}/api/requests`, {
        fromUserId: fromId,
        toUserId: toId,
        fromSkillId: mySkill._id,
        toSkillId: skill._id
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });
      
      alert(`✅ SWAP REQUEST SENT to ${targetUserName}!`);
      navigate('/requests');
    } catch (err) {
      console.error('Request swap error:', err.response?.data || err.message);
      
      if (err.response?.status === 400) {
        alert(err.response.data.message || 'You cannot request a swap with yourself!');
      } else if (err.code === 'ECONNABORTED') {
        alert('Server is taking too long to respond. Try again.');
      } else {
        alert('Swap request failed. Make sure you aren\'t requesting your own skill.');
      }
    }
  };

  if (loading && !skills.length) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a192f'
      }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
      color: 'white', 
      padding: '40px 20px' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={backButtonStyle}
        >
          ← Back to Dashboard
        </button>

        <h1 style={titleStyle}>🔍 Find Skills to Swap</h1>

        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search React, Python, Java..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInputStyle}
        />

        <div style={gridStyle}>
          {skills.map((skill) => (
            <div key={skill._id} style={cardStyle} className="skill-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(skill.userId?.name || 'U')}&background=00d4ff&color=fff`} 
                  alt="User"
                  style={avatarStyle}
                />
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{skill.title}</h3>
                  <p style={{ color: '#00d4ff', fontSize: '14px', margin: '4px 0 0 0' }}>
                    by {skill.userId?.name || 'Community Member'}
                  </p>
                </div>
              </div>
              
              <p style={descriptionStyle}>{skill.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={levelBadgeStyle}>{skill.level}</span>
                <button onClick={() => requestSwap(skill)} style={swapButtonStyle}>
                  🚀 Request Swap
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && skills.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '50px', opacity: 0.7 }}>
            <p fontSize="20px">No skills found matching "{search}"</p>
          </div>
        )}
      </div>

      <style>{`
        .spinner {
          width: 50px; height: 50px;
          border: 5px solid rgba(255,255,255,0.1);
          border-top-color: #00d4ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .skill-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      `}</style>
    </div>
  );
};

// Styles
const titleStyle = {
  textAlign: 'center', fontSize: '36px', marginBottom: '40px',
  background: 'linear-gradient(to right, #00d4ff, #fff)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
};

const searchInputStyle = {
  width: '100%', maxWidth: '600px', display: 'block', margin: '0 auto 50px',
  padding: '15px 25px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '18px', outline: 'none'
};

const gridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px'
};

const cardStyle = {
  background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease'
};

const avatarStyle = { width: '45px', height: '45px', borderRadius: '50%' };
const descriptionStyle = { color: '#ccc', fontSize: '15px', minHeight: '60px', marginBottom: '20px' };
const levelBadgeStyle = { background: 'rgba(0,212,255,0.1)', color: '#00d4ff', padding: '5px 15px', borderRadius: '15px', fontSize: '13px' };
const swapButtonStyle = { background: '#00d4ff', color: '#0a192f', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' };
const backButtonStyle = { background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' };

export default SkillMatching;