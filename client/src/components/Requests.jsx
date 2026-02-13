import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Requests = ({ token }) => {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  //const [totalRequests, setTotalRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');

  // ✅ VERCEL: PRODUCTION BACKEND URL
  const API_BASE = 'https://skillswapproject.onrender.com/api';

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests,refreshKey, token]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/requests/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000 // Vercel timeout for Render cold starts
      });
      setSentRequests(res.data.sentRequests || []);
      setReceivedRequests(res.data.receivedRequests || []);
    } catch (err) {
      console.error('Requests fetch error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   // ✅ CALCULATE after BOTH states update!
  //   setTotalRequests(sentRequests.length + receivedRequests.length);
  // }, [sentRequests, receivedRequests]);

  // ✅ PERFECT Accept with Popup
  const handleAccept = async (requestId, fromUserName) => {
    try {
      const res = await axios.put(`${API_BASE}/requests/${requestId}/status`, {
        status: 'accepted'
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      console.log('✅ Accepted! Chat created:', res.data.chatRoomId);
      
      // 🎉 CHAT CREATED POPUP
      alert(`🎉 Chat created with ${fromUserName}!\n\n💬 Go to ChatRooms tab to start messaging 👈`);
      
      setRefreshKey(prev => prev + 1); // Refresh list
    } catch (err) {
      console.error('Accept error:', err.response?.data || err.message);
      
      if (err.code === 'ECONNABORTED') {
        alert('Server slow. Please try again.');
      } else {
        alert('Failed to accept request');
      }
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.put(`${API_BASE}/requests/${requestId}/status`, 
        { status: 'rejected' }, 
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      setRefreshKey(prev => prev + 1);
      alert('❌ Request rejected');
    } catch (err) {
      console.error('Reject error:', err);
      if (err.code === 'ECONNABORTED') {
        alert('Server slow. Please try again.');
      } else {
        alert('Failed to reject');
      }
    }
  };

  // ✅ STATUS BADGES
  const renderStatusBadge = (status) => {
    switch(status) {
      case 'accepted':
        return (
          <span style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '25px',
            fontSize: '13px',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
          }}>
            ✅ ACCEPTED
          </span>
        );
      case 'rejected':
        return (
          <span style={{
            background: 'rgba(239,68,68,0.2)',
            color: '#f87171',
            padding: '8px 16px',
            borderRadius: '25px',
            fontSize: '13px',
            fontWeight: '700',
            border: '1px solid rgba(239,68,68,0.5)'
          }}>
            ❌ REJECTED
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
        color: 'white', 
        padding: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
      color: 'white', 
      padding: '48px 24px' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '48px' 
        }}>
          <h1 style={{ 
            fontSize: 'clamp(28px, 5vw, 36px)', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #00d4ff, #60f0ff)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            📋 Requests & Status ({sentRequests.length + receivedRequests.length})
          </h1>
          <Link to="/dashboard" style={{ 
            background: 'rgba(255,255,255,0.2)', 
            color: 'white', 
            padding: '14px 28px', 
            borderRadius: '30px', 
            textDecoration: 'none',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
            e.target.style.transform = 'translateY(0)';
          }}
          >
            ← Dashboard
          </Link>
        </div>

        {/* TABS */}
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '30px', 
          padding: '32px', 
          marginBottom: '40px',
          border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('requests')} style={{
              padding: '16px 40px',
              background: activeTab === 'requests' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: activeTab === 'requests' ? '0 8px 25px rgba(16,185,129,0.4)' : 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => activeTab !== 'requests' && (e.target.style.background = 'rgba(255,255,255,0.25)')}
            onMouseOut={(e) => activeTab !== 'requests' && (e.target.style.background = 'rgba(255,255,255,0.15)')}
            >
              📋 Requests ({receivedRequests.filter(r => r.status === 'pending').length})
            </button>
            <button onClick={() => setActiveTab('sent')} style={{
              padding: '16px 40px',
              background: activeTab === 'sent' ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: activeTab === 'sent' ? '0 8px 25px rgba(16,185,129,0.4)' : 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => activeTab !== 'sent' && (e.target.style.background = 'rgba(255,255,255,0.25)')}
            onMouseOut={(e) => activeTab !== 'sent' && (e.target.style.background = 'rgba(255,255,255,0.15)')}
            >
              📤 Sent ({sentRequests.length})
            </button>
          </div>

          {/* REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div>
              <h3 style={{ 
                fontSize: 'clamp(24px, 4vw, 28px)', 
                marginBottom: '32px', 
                color: '#00d4ff',
                background: 'linear-gradient(135deg, #00d4ff, #60f0ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                📥 Incoming Requests ({receivedRequests.filter(r => r.status === 'pending').length})
              </h3>
              {receivedRequests.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '80px 40px', 
                  color: 'rgba(255,255,255,0.6)' 
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '24px' }}>📨</div>
                  <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>No incoming requests</h3>
                  <p style={{ fontSize: '16px' }}>Share your skills to get swap requests!</p>
                </div>
              ) : (
                receivedRequests.map(request => (
                  <div key={request._id} style={{
                    background: 'rgba(255,255,255,0.12)',
                    padding: '32px',
                    borderRadius: '25px',
                    marginBottom: '24px',
                    border: `3px solid ${
                      request.status === 'accepted' ? '#10b981' : 
                      request.status === 'rejected' ? '#ef4444' : 
                      'rgba(255,255,255,0.3)'
                    }`,
                    backdropFilter: 'blur(15px)',
                    transition: 'all 0.3s ease',
                    cursor: request.status !== 'pending' ? 'default' : 'pointer'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '20px'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ 
                          margin: '0 0 12px 0', 
                          fontSize: '24px', 
                          color: '#fff',
                          fontWeight: '700'
                        }}>
                          {request.fromUser?.name} wants to swap
                        </h4>
                        <p style={{ 
                          color: 'rgba(255,255,255,0.9)', 
                          margin: '0 0 16px 0',
                          fontSize: '18px'
                        }}>
                          {request.fromSkill?.title} ↔ {request.toSkill?.title}
                        </p>
                        {renderStatusBadge(request.status)}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {request.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleAccept(request._id, request.fromUser?.name)}
                              style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                padding: '16px 32px',
                                border: 'none',
                                borderRadius: '30px',
                                fontWeight: '700',
                                fontSize: '16px',
                                cursor: 'pointer',
                                boxShadow: '0 8px 25px rgba(16,185,129,0.4)',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 12px 35px rgba(16,185,129,0.5)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 8px 25px rgba(16,185,129,0.4)';
                              }}
                            >
                              ✅ Accept
                            </button>
                            <button 
                              onClick={() => handleReject(request._id)}
                              style={{
                                background: 'rgba(239,68,68,0.2)',
                                color: '#f87171',
                                padding: '16px 32px',
                                border: '2px solid rgba(239,68,68,0.5)',
                                borderRadius: '30px',
                                fontWeight: '700',
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.background = 'rgba(239,68,68,0.4)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.background = 'rgba(239,68,68,0.2)';
                              }}
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        {request.status === 'accepted' && (
                          <button 
                            onClick={() => navigate('/chatrooms')}
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              color: 'white',
                              padding: '16px 32px',
                              border: 'none',
                              borderRadius: '30px',
                              fontWeight: '700',
                              fontSize: '16px',
                              cursor: 'pointer',
                              boxShadow: '0 8px 25px rgba(59,130,246,0.4)'
                            }}
                          >
                            💬 Open Chat
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SENT TAB */}
          {activeTab === 'sent' && (
            <div>
              <h3 style={{ 
                fontSize: 'clamp(24px, 4vw, 28px)', 
                marginBottom: '32px', 
                color: '#00d4ff',
                background: 'linear-gradient(135deg, #00d4ff, #60f0ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                📤 Your Sent Requests ({sentRequests.length})
              </h3>
              {sentRequests.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '80px 40px', 
                  color: 'rgba(255,255,255,0.6)' 
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '24px' }}>📤</div>
                  <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>No sent requests</h3>
                  <p style={{ fontSize: '16px' }}>Find skills to swap in Skill Matching!</p>
                </div>
              ) : (
                sentRequests.map(request => (
                  <div key={request._id} style={{
                    background: 'rgba(255,255,255,0.12)',
                    padding: '24px',
                    borderRadius: '20px',
                    marginBottom: '16px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#fff' }}>
                          {request.toUser?.name}
                        </h4>
                        <p style={{ margin: '0 0 12px 0', color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                          {request.fromSkill?.title} ↔ {request.toSkill?.title}
                        </p>
                        {renderStatusBadge(request.status)}
                      </div>
                      <span style={{ 
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                      }}>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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
          div[style*="display: flex"][style*="justifyContent: space-between"] {
            flex-direction: column !important;
            gap: 24px !important;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Requests;
