import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SkillMatching = ({ token }) => {
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // ✅ CENTRALIZED URL
  const API_BASE = 'https://skillswapproject.onrender.com';

  // ✅ 1. SEARCH WITH DEBOUNCE (Corrected Logic)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const params = search ? `?search=${search}` : '';
        const res = await axios.get(`${API_BASE}/api/skills/public${params}`);
        setSkills(res.data);
      } catch (err) {
        console.error("Search Error:", err);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // ✅ 2. FIXED: FOCUS ONLY ONCE (Added [] dependency)
  // This prevents the cursor from "jumping" or losing focus while you type
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []); 

  // ✅ 3. FIXED: REQUEST SWAP (Added Safety Checks)
  const requestSwap = async (skill) => {
    // Check if userId exists as an object or string
    const targetName = skill.userId?.name || 'this user';
    
    if (!window.confirm(`Request swap "${skill.title}" with ${targetName}?`)) return;
    
    try {
      // Get your own skills to propose the swap
      const mySkillsRes = await axios.get(`${API_BASE}/api/skills`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!mySkillsRes.data || mySkillsRes.data.length === 0) {
        alert('⚠️ Please add your own skills first in the Dashboard!');
        navigate('/dashboard');
        return;
      }
      
      // Ensure we use the correct ID format
      const toUserId = skill.userId?._id || skill.userId;

      await axios.post(`${API_BASE}/api/requests`, {
        fromUserId: mySkillsRes.data[0].userId,
        toUserId: toUserId,
        fromSkillId: mySkillsRes.data[0]._id,
        toSkillId: skill._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`✅ SWAP REQUEST SENT to ${targetName}!`);
    } catch (err) {
      console.error("Swap Error:", err.response?.data);
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
      color: 'white', 
      padding: '40px' 
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            padding: '12px 24px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '25px',
            marginBottom: '32px',
            cursor: 'pointer'
          }}
        >
          ← Back to Dashboard
        </button>

        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #00d4ff, #60f0ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '32px'
        }}>
          🔍 Find Skills to Swap
        </h1>

        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search React, Python, Java..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '16px 24px',
            border: '2px solid rgba(0,212,255,0.4)',
            borderRadius: '25px',
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            fontSize: '16px',
            marginBottom: '40px',
            outline: 'none',
            backdropFilter: 'blur(10px)'
          }}
        />

        {loading && skills.length === 0 ? (
          <div style={{ padding: '20px' }}>Loading available skills...</div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '24px' 
          }}>
            {skills.map((skill) => (
              <div key={skill._id} style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '32px',
                border: '1px solid rgba(0,212,255,0.3)',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <img 
                    src={skill.userId?.avatar || `https://ui-avatars.com/api/?name=${skill.userId?.name || 'User'}&background=00d4ff&color=fff`} 
                    alt="User"
                    style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #00d4ff' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: 0 }}>
                      {skill.title}
                    </h3>
                    <p style={{ color: '#00d4ff', fontWeight: '600', margin: '4px 0 0 0' }}>
                      by {skill.userId?.name || 'Anonymous'}
                    </p>
                  </div>
                </div>
                
                <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '20px', lineHeight: '1.6' }}>
                  {skill.description}
                </p>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    background: 'rgba(0,212,255,0.3)',
                    color: '#00d4ff',
                    padding: '8px 16px',
                    borderRadius: '15px',
                    fontWeight: '700',
                    fontSize: '14px'
                  }}>
                    {skill.level}
                  </span>
                  <button
                    onClick={() => requestSwap(skill)}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '20px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    🚀 Request Swap
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && skills.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px', color: 'rgba(255,255,255,0.6)' }}>
            <h3>No matching skills found 😔</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillMatching;