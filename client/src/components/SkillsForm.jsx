import { useState } from 'react';
import axios from 'axios';

const SkillsForm = ({ setSkills, token }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', level: 'Beginner'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ VERCEL: PRODUCTION BACKEND URL
  const API_BASE = 'https://skillswap-backend.onrender.com/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${API_BASE}/skills`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000 // Vercel timeout for Render cold starts
      });
      setSkills(prev => [res.data, ...prev]);
      setFormData({ title: '', description: '', level: 'Beginner' });
      
      // ✅ Better UX: Success message instead of alert
      setError('✅ Skill added successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('SkillsForm error:', err.response?.data || err.message);
      
      // ✅ VERCEL-SPECIFIC ERROR HANDLING
      if (err.code === 'ECONNABORTED') {
        setError('Server slow. Please try again.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Wait 30 seconds.');
      } else {
        setError(err.response?.data?.message || 'Failed to add skill');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'rgba(255,255,255,0.12)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '32px',
      border: '1px solid rgba(0,212,255,0.3)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Error/Success Message */}
      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center',
          background: error.startsWith('✅') 
            ? 'rgba(34,197,94,0.3)' 
            : 'rgba(239,68,68,0.3)',
          border: `1px solid ${error.startsWith('✅') ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'}`,
          color: error.startsWith('✅') ? '#86efac' : '#fca5a5'
        }}>
          {error}
        </div>
      )}

      <input 
        placeholder="React, Python, Node.js..." 
        value={formData.title}
        onChange={e => setFormData({...formData, title: e.target.value})}
        disabled={loading}
        style={{
          padding: '18px 24px', 
          background: 'rgba(255,255,255,0.15)',
          border: loading ? '2px solid rgba(0,212,255,0.4)' : '2px solid rgba(0,212,255,0.4)', 
          borderRadius: '20px',
          color: 'white', 
          fontSize: '16px',
          transition: 'all 0.3s ease'
        }} 
        required 
      />
      
      <textarea 
        placeholder="What can you teach about this skill? (e.g., 'Build full-stack apps with React')" 
        value={formData.description}
        onChange={e => setFormData({...formData, description: e.target.value})}
        rows={4} 
        disabled={loading}
        style={{
          padding: '18px 24px', 
          background: 'rgba(255,255,255,0.15)',
          border: loading ? '2px solid rgba(0,212,255,0.4)' : '2px solid rgba(0,212,255,0.4)', 
          borderRadius: '20px',
          color: 'white', 
          fontSize: '16px', 
          resize: 'vertical',
          transition: 'all 0.3s ease'
        }} 
        required 
      />
      
      <select 
        value={formData.level} 
        onChange={e => setFormData({...formData, level: e.target.value})}
        disabled={loading}
        style={{
          padding: '18px 24px', 
          background: 'rgba(255,255,255,0.15)',
          border: loading ? '2px solid rgba(0,212,255,0.4)' : '2px solid rgba(0,212,255,0.4)', 
          borderRadius: '20px',
          color: 'white', 
          fontSize: '16px',
          transition: 'all 0.3s ease'
        }}
      >
        <option value="Beginner">🥚 Beginner</option>
        <option value="Intermediate">🥚🥚 Intermediate</option>
        <option value="Advanced">🥚🥚🥚 Advanced</option>
        <option value="Expert">🥚🥚🥚🥚 Expert</option>
      </select>
      
      <button 
        type="submit" 
        disabled={loading} 
        style={{
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
          boxShadow: loading ? 'none' : '0 8px 24px rgba(0,212,255,0.4)',
          transition: 'all 0.3s ease'
        }}
      >
        {loading ? (
          <>
            <span style={{ marginRight: '12px' }}>⏳</span>
            Adding Skill...
          </>
        ) : (
          <>
            <span style={{ marginRight: '12px' }}>➕</span>
            Add Skill
          </>
        )}
      </button>
    </form>
  );
};

export default SkillsForm;
