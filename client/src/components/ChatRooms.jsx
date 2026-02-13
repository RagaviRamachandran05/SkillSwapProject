import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChatRooms = ({ token }) => {
  const navigate = useNavigate();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  const API_BASE = 'https://skillswapproject.onrender.com';
  const WS_URL = 'wss://skillswapproject.onrender.com/ws';

  // 🔥 Fetch active chats
  const fetchChatRooms = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/requests/active-chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ CHATS LOADED:', res.data.activeChats?.length);
      setChatRooms(res.data.activeChats || []);
    } catch (err) {
      console.error('❌ ChatRooms ERROR:', err.response?.status, err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 🔥 Get current user ID from token
  useEffect(() => {
    try {
      const tokenData = JSON.parse(atob(localStorage.getItem('token')?.split('.')[1]));
      console.log('🔑 TOKEN ID:', tokenData?.id);
      setCurrentUserId(tokenData?.id);
    } catch(e) {
      console.error('❌ TOKEN PARSE:', e);
    }
  }, []);

  // 🔥 FIXED WebSocket - No more reconnect loop
  const connectWS = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (ws.current) {
      ws.current.close();
    }

    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('🔌 ChatRooms WS connected');
      if (currentUserId) {
        ws.current.send(JSON.stringify({
          type: 'join',
          userId: currentUserId,
          chatRoomId: 'chatrooms-list',  
          token: token
        }));
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('ChatRooms WS:', data);
        
        if (data.type === 'userOnline') {
          setOnlineUsers(prev => new Set([...prev, data.userId]));
        } else if (data.type === 'userOffline') {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      } catch(e) {
        console.error('WS parse error:', e);
      }
    };

    ws.current.onclose = () => {
      console.log('🔌 WS disconnected');
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!currentUserId) return;
        console.log('🔄 Reconnecting WS...');
        connectWS();
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WS error:', error);
    };
  }, [currentUserId, token]);

  // 🔥 WebSocket connection effect - FIXED ESLint
  useEffect(() => {
    if (!currentUserId) return;
    connectWS();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connectWS, currentUserId]); // ✅ FIXED: Added currentUserId

  // 🔥 Fetch chats every 5s
  useEffect(() => {
    fetchChatRooms();
    const interval = setInterval(fetchChatRooms, 5000);
    return () => clearInterval(interval);
  }, [fetchChatRooms]);

  if (loading || !currentUserId) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
        color: 'white',
        padding: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '60px', height: '60px',
          border: '6px solid rgba(255,255,255,0.3)',
          borderTop: '6px solid #00d4ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ marginTop: '20px', fontSize: '18px' }}>Loading chats...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '600px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #00d4ff, #60f0ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0
        }}>
          💬 Active Chats ({chatRooms.length})
        </h1>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{
            color: 'white',
            padding: '14px 28px',
            border: 'none',
            borderRadius: '30px',
            fontWeight: '600',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          ← Dashboard
        </button>
      </div>
      
      {/* CHAT LIST */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '30px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        {chatRooms.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>💬</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>No active chats</h3>
            <p style={{ fontSize: '16px' }}>
              Accept skill swap requests from Dashboard to start messaging!
            </p>
          </div>
        ) : (
          chatRooms.map((chat) => {
            const participants = chat.participants || [chat.fromUser, chat.toUser].filter(Boolean);
            const partner = participants.find(p => p?._id?.toString() !== currentUserId?.toString()) || 
            (chat.fromUser?._id?.toString() !== currentUserId?.toString() ? chat.fromUser : chat.toUser) ||
            { name: 'Partner', _id: 'unknown' };
            
            const isOnline = partner?._id && onlineUsers.has(partner._id);
            const messages = chat.messages || [];
            const lastMessage = messages[messages.length - 1];
           const unreadCount = messages.filter(msg => 
  msg.sender?._id !== currentUserId && msg.read === false
).length;
            return (
              <div
                key={chat._id}
                onClick={() => navigate(`/chat/${chat._id}`)}
                style={{
                  padding: '24px 28px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  transition: 'all 0.3s ease',
                  background: unreadCount > 0 ? 'rgba(16,185,129,0.15)' : 'transparent'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
               onMouseOut={(e) => {
  e.currentTarget.style.background = unreadCount > 0 ? 'rgba(16,185,129,0.15)' : 'transparent';
  e.currentTarget.style.transform = 'translateX(0)';  // ✅ PERFECT - NO 'border'
}}

              >
                {/* AVATAR - FIXED no duplicate border */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: isOnline 
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: '700',
                  position: 'relative',
                  border: `3px solid ${isOnline ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.3)'}`,
                  boxShadow: isOnline ? '0 0 20px rgba(16,185,129,0.4)' : 'none'
                }}>
                  {partner?.name?.[0]?.toUpperCase() || '?'}
                  {isOnline && (
                    <div style={{
                      position: 'absolute',
                      bottom: '1px',
                      right: '1px',
                      width: '14px',
                      height: '14px',
                      background: '#10b981',
                      borderRadius: '50%',
                      border: '3px solid rgba(10,25,47,0.9)'
                    }} />
                  )}
                </div>

                {/* CHAT INFO */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '18px',
                      color: '#fff'
                    }}>
                      {partner?.name || 'Unknown'}
                    </span>
                    {isOnline && (
                      <span style={{ 
                        color: '#10b981',
                        fontSize: '14px',
                        fontWeight: '600',
                        padding: '4px 12px',
                        background: 'rgba(16,185,129,0.2)',
                        borderRadius: '12px'
                      }}>
                        ● Live
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '15px', 
                    opacity: 0.85,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'rgba(255,255,255,0.9)'
                  }}>
                    {lastMessage?.content || 'No messages yet. Say hi!'}
                  </div>
                </div>

                {/* TIME & UNREAD */}
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  {lastMessage && (
                    <div style={{ 
                      fontSize: '13px', 
                      opacity: 0.6, 
                      marginBottom: '8px' 
                    }}>
                      {new Date(lastMessage.timestamp || lastMessage.createdAt).toLocaleTimeString([], 
                        {hour: '2-digit', minute: '2-digit'})}
                    </div>
                  )}
                  {unreadCount > 0 && (
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      borderRadius: '15px',
                      padding: '6px 12px',
                      fontSize: '13px',
                      fontWeight: '700',
                      minWidth: '24px',
                      textAlign: 'center',
                      boxShadow: '0 4px 15px rgba(16,185,129,0.4)'
                    }}>
                      {unreadCount}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatRooms;
