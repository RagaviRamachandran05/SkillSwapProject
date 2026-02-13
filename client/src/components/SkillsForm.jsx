import { useState } from 'react';
import axios from 'axios';

const SkillsForm = ({ setSkills, token }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', level: 'Beginner'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/skills', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSkills(prev => [res.data, ...prev]);
      setFormData({ title: '', description: '', level: 'Beginner' });
      alert('✅ Skill added!');
    } catch (err) {
      alert('Add failed: ' + (err.response?.data?.message || 'Backend needed'));
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
      <input placeholder="React, Python..." value={formData.title}
        onChange={e => setFormData({...formData, title: e.target.value})}
        style={{
          padding: '18px 24px', background: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(0,212,255,0.4)', borderRadius: '20px',
          color: 'white', fontSize: '16px'
        }} required 
      />
      <textarea placeholder="What can you teach?" value={formData.description}
        onChange={e => setFormData({...formData, description: e.target.value})}
        rows={4} style={{
          padding: '18px 24px', background: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(0,212,255,0.4)', borderRadius: '20px',
          color: 'white', fontSize: '16px', resize: 'vertical'
        }} required 
      />
      <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}
        style={{
          padding: '18px 24px', background: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(0,212,255,0.4)', borderRadius: '20px',
          color: 'white', fontSize: '16px'
        }}>
        <option>Beginner</option><option>Intermediate</option>
        <option>Advanced</option><option>Expert</option>
      </select>
      <button type="submit" disabled={loading} style={{
        padding: '20px', background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
        color: 'white', border: 'none', borderRadius: '24px',
        fontSize: '18px', fontWeight: '700', cursor: 'pointer'
      }}>
        {loading ? '⏳ Adding...' : '➕ Add Skill'}
      </button>
    </form>
  );
};

export default SkillsForm;
