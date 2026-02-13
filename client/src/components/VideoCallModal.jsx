// ✅ ADD useState to your imports (Line 2):
import React, { useRef, useEffect, useState } from 'react';  // ← ADD useState

import {
  useMeeting,
  useParticipant,
  MeetingProvider,
  MeetingConsumer
} from '@videosdk.live/react-sdk';

const VideoCallModal = ({ 
  meetingId, 
  token, 
  currentUserName,
  onLeave 
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10003,
      background: '#000'
    }}>
      <MeetingProvider
        config={{
          name: currentUserName || 'Student',
          meetingId,
          micEnabled: true,
          webcamEnabled: true
        }}
        token={token}
      >
        <MeetingConsumer>
          {() => <VideoCallInner onLeave={onLeave} />}
        </MeetingConsumer>
      </MeetingProvider>
    </div>
  );
};

// 🔥 REPLACE your VideoCallInner buttons (Lines 60-120) with THIS:
const VideoCallInner = ({ onLeave }) => {
  const [isHovering, setIsHovering] = useState({
    mic: false, webcam: false, screen: false, end: false
  });
  
  const {
    leave, toggleScreenShare, isScreenShareActive,
    toggleMic, toggleWebcam, micOn, webcamOn, participants
  } = useMeeting();

  // 🔥 MIC BUTTON - VISIBLE HOVER + CLICK
  const MicButton = () => (
    <button
      onClick={toggleMic}
      onMouseEnter={() => setIsHovering(h => ({...h, mic: true}))}
      onMouseLeave={() => setIsHovering(h => ({...h, mic: false}))}
      style={{
        background: micOn 
          ? (isHovering.mic ? '#059669' : '#10b981')  // Green → Darker green
          : (isHovering.mic ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'),
        transform: isHovering.mic ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
        boxShadow: isHovering.mic ? '0 8px 25px rgba(16,185,129,0.6)' : 'none',
        color: 'white', border: 'none', padding: '12px 16px', borderRadius: 25,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 14, transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)'
      }}
      title="Toggle Microphone"
    >
      {micOn ? '🔇' : '🎤'} {isHovering.mic && '✨'}
    </button>
  );

  // 🔥 WEBCAM BUTTON - VISIBLE HOVER + CLICK  
  const WebcamButton = () => (
    <button
      onClick={toggleWebcam}
      onMouseEnter={() => setIsHovering(h => ({...h, webcam: true}))}
      onMouseLeave={() => setIsHovering(h => ({...h, webcam: false}))}
      style={{
        background: webcamOn 
          ? (isHovering.webcam ? '#059669' : '#10b981')
          : (isHovering.webcam ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'),
        transform: isHovering.webcam ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
        boxShadow: isHovering.webcam ? '0 8px 25px rgba(16,185,129,0.6)' : 'none',
        color: 'white', border: 'none', padding: '12px 16px', borderRadius: 25,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 14, transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)'
      }}
      title="Toggle Camera"
    >
      {webcamOn ? '📹' : '📷'} {isHovering.webcam && '✨'}
    </button>
  );

  // 🔥 SCREEN SHARE BUTTON - VISIBLE HOVER + CLICK
  const ScreenButton = () => (
    <button
      onClick={toggleScreenShare}
      onMouseEnter={() => setIsHovering(h => ({...h, screen: true}))}
      onMouseLeave={() => setIsHovering(h => ({...h, screen: false}))}
      style={{
        background: isScreenShareActive 
          ? (isHovering.screen ? '#dc2626' : '#ef4444')  // Red → Darker red
          : (isHovering.screen ? '#d97706' : '#f59e0b'),  // Orange → Darker orange
        transform: isHovering.screen ? 'scale(1.15)' : 'scale(1)',
        boxShadow: isHovering.screen ? '0 10px 30px rgba(245,158,11,0.7)' : 'none',
        color: 'white', border: 'none', padding: '12px 20px', borderRadius: 25,
        cursor: 'pointer', fontWeight: 600, fontSize: 14,
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)'
      }}
      title="Toggle Screen Share"
    >
      🖥️ {isHovering.screen && '⚡'}
    </button>
  );

  // 🔥 END CALL BUTTON - VISIBLE HOVER + CLICK
  const EndButton = () => (
    <button
      onClick={() => { leave(); onLeave(); }}
      onMouseEnter={() => setIsHovering(h => ({...h, end: true}))}
      onMouseLeave={() => setIsHovering(h => ({...h, end: false}))}
      style={{
        background: isHovering.end 
          ? 'linear-gradient(135deg, #dc2626, #b91c1c)'  // Red → Darker red
          : 'linear-gradient(135deg, #ef4444, #dc2626)',
        transform: isHovering.end ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovering.end ? '0 10px 30px rgba(239,68,68,0.6)' : 'none',
        color: 'white', border: 'none', padding: '12px 24px', borderRadius: 25,
        cursor: 'pointer', fontWeight: 700, fontSize: 14,
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)'
      }}
      title="End Video Lesson"
    >
      {isHovering.end ? '🚪 EXIT' : 'End Lesson'} {isHovering.end && '💥'}
    </button>
  );

  return (
    <div style={{ height: '100vh', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* 🔥 HEADER WITH ANIMATED BUTTONS */}
      <div style={{
        padding: '20px 30px', background: 'rgba(0,0,0,0.9)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <h2 style={{
            margin: 0, fontSize: 24, fontWeight: 800,
            background: 'linear-gradient(135deg, #00d4ff, #60f0ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            🎥 Live Video Lesson
          </h2>
          <div style={{
            background: '#10b981', color: 'white', padding: '4px 12px',
            borderRadius: 20, fontSize: 12, fontWeight: 600
          }}>
            {Array.isArray(participants) ? participants.length : 0} online
          </div>
        </div>

        {/* 🔥 ANIMATED CONTROLS */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <MicButton />
          <WebcamButton />
          <ScreenButton />
          <EndButton />
        </div>
      </div>

      {/* 🔥 VIDEO GRID - FLEXIBLE 1x1, 1x2, 2x2 */}
{/* 🔥 VIDEO GRID - SAFE RENDERING */}
<div style={{ 
  flex: 1, 
  padding: 20, 
  display: 'flex', 
  gap: 20,
  overflow: 'hidden',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignContent: 'center'
}}>
  {/* ✅ SAFE participants check */}
  {Array.isArray(participants) && participants.length > 0 ? (
    participants.map((participant) => (
      <VideoParticipant 
        key={participant.id} 
        participantId={participant.id} 
      />
    ))
  ) : (
    /* 🔥 EMPTY STATE - Shows while waiting for participants */
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      height: '100%', color: 'white', gap: 20
    }}>
      <div style={{ fontSize: 64, opacity: 0.7 }}>🎥</div>
      <h2 style={{ fontSize: 28, margin: 0 }}>Waiting for lesson partner...</h2>
      <div style={{ 
        fontSize: 16, opacity: 0.6,
        background: 'rgba(255,255,255,0.1)',
        padding: '12px 24px', borderRadius: 25,
        backdropFilter: 'blur(10px)'
      }}>
        🔗 Share purple "Join Video Lesson" invite
      </div>
    </div>
  )}
</div>


    </div>
  );
};


// 🔥 FIXED VideoParticipant WITH PROPER STREAM HANDLING
const VideoParticipant = ({ participantId }) => {
  const videoRef = useRef(null);
  const {
    displayName,
    webcamOn,
    micOn,
    isLocal,
    webcamStream,
    screenShareStream
  } = useParticipant(participantId);

  // 🔥 WEBCAM STREAM EFFECT
  useEffect(() => {
    if (videoRef.current && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      
      videoRef.current.play().catch(e => {
        console.error('Video play error:', e);
      });
    }
  }, [webcamStream]);

  // 🔥 SCREEN SHARE EFFECT
  useEffect(() => {
    if (videoRef.current && screenShareStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareStream.track);
      videoRef.current.srcObject = mediaStream;
      
      videoRef.current.play().catch(e => {
        console.error('Screen share error:', e);
      });
    }
  }, [screenShareStream]);

  return (
    <div style={{
      background: '#000',
      borderRadius: 20,
      overflow: 'hidden',
      border: `3px solid ${isLocal ? 'rgba(0,212,255,0.6)' : 'rgba(255,255,255,0.2)'}`,
      position: 'relative',
      aspectRatio: '16/9'
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '17px'
        }}
      />
      
      {/* No Video Placeholder */}
      {(!webcamOn || !webcamStream) && !screenShareStream && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '30px 40px',
          borderRadius: 20,
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10
        }}>
          <div style={{ fontSize: 48 }}>📷</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {displayName || 'User'}
            {isLocal && ' (You)'}
          </div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>Camera off</div>
        </div>
      )}

      {/* Participant Info */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.1)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'white' }}>
          {displayName || 'User'} {isLocal && '(You)'}
        </div>
        <div style={{
          fontSize: 12,
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {micOn ? '🎤' : '🔇'}
          {webcamOn ? '📹' : '📷'}
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;







