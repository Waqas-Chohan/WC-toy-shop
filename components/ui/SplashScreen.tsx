'use client';

import { useEffect, useState } from 'react';

export function SplashScreen() {
  const [phase, setPhase] = useState<'visible' | 'fadeout' | 'gone'>('visible');
  const [welcomeText, setWelcomeText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [showTagline, setShowTagline] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showRing, setShowRing] = useState(false);
  const [welcomeDone, setWelcomeDone] = useState(false);

  const welcomeLine = 'Welcome to WC Store';
  const brandName = 'ToyShop Pro';
  const tagline = 'Redefining Retail Innovation';
  // timing: welcome = 19 chars × 55ms = 1045ms → starts at 500ms → done at 1545ms
  //         brand   = 11 chars × 70ms =  770ms → starts at 1650ms → done at 2420ms
  const WELCOME_START = 500;
  const WELCOME_SPEED = 55;
  const BRAND_START = WELCOME_START + welcomeLine.length * WELCOME_SPEED + 100; // ~1650ms
  const BRAND_SPEED = 70;

  useEffect(() => {

    const t1 = setTimeout(() => setShowParticles(true), 100);
    const t2 = setTimeout(() => setShowRing(true), 400);

    // Phase 1 typewriter: 'Welcome to WC Store'
    let wi = 0;
    const t3 = setTimeout(() => {
      const iv1 = setInterval(() => {
        wi++;
        setWelcomeText(welcomeLine.slice(0, wi));
        if (wi >= welcomeLine.length) {
          clearInterval(iv1);
          setWelcomeDone(true);
        }
      }, WELCOME_SPEED);
    }, WELCOME_START);

    // Phase 2 typewriter: 'ToyShop Pro'
    let bi = 0;
    const t4 = setTimeout(() => {
      const iv2 = setInterval(() => {
        bi++;
        setTypedText(brandName.slice(0, bi));
        if (bi >= brandName.length) clearInterval(iv2);
      }, BRAND_SPEED);
    }, BRAND_START);

    // tagline appears after brand finishes + 200ms
    const t5 = setTimeout(() => setShowTagline(true), BRAND_START + brandName.length * BRAND_SPEED + 200);
    // fade out
    const t6 = setTimeout(() => setPhase('fadeout'), BRAND_START + brandName.length * BRAND_SPEED + 1400);
    const t7 = setTimeout(() => setPhase('gone'), BRAND_START + brandName.length * BRAND_SPEED + 2100);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); clearTimeout(t7);
    };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      id="splash-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #0a0f1e 0%, #000510 60%, #000000 100%)',
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Animated grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,220,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,220,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        animation: 'gridPulse 4s ease-in-out infinite',
      }} />

      {/* Scanning beam */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(0,220,255,0.8), rgba(139,92,246,0.8), transparent)',
        animation: 'scanBeam 2.5s ease-in-out infinite',
        boxShadow: '0 0 20px rgba(0,220,255,0.6)',
      }} />

      {/* Floating particles */}
      {showParticles && Array.from({ length: 30 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${(i % 3) + 1}px`,
          height: `${(i % 3) + 1}px`,
          borderRadius: '50%',
          background: i % 3 === 0 ? 'rgba(0,220,255,0.9)' : i % 3 === 1 ? 'rgba(139,92,246,0.9)' : 'rgba(255,100,200,0.9)',
          left: `${(i * 37 + 11) % 100}%`,
          top: `${(i * 53 + 7) % 100}%`,
          animation: `floatParticle ${3 + (i % 4)}s ease-in-out infinite`,
          animationDelay: `${(i * 0.2) % 2}s`,
          boxShadow: '0 0 6px currentColor',
        }} />
      ))}

      {/* Orbital rings */}
      {showRing && (
        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {[180, 240, 300].map((size, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              border: `1px solid rgba(0,220,255,${0.3 - i * 0.08})`,
              animation: `${i % 2 === 0 ? 'spinCW' : 'spinCCW'} ${6 + i * 2}s linear infinite`,
              boxShadow: '0 0 8px rgba(0,220,255,0.2)',
            }}>
              <div style={{
                position: 'absolute',
                top: '-3px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: i % 2 === 0 ? '#00dcff' : '#8b5cf6',
                boxShadow: `0 0 12px ${i % 2 === 0 ? '#00dcff' : '#8b5cf6'}`,
              }} />
            </div>
          ))}
        </div>
      )}

      {/* Center icon */}
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(0,220,255,0.15), rgba(139,92,246,0.15))',
        border: '1px solid rgba(0,220,255,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '32px',
        boxShadow: '0 0 40px rgba(0,220,255,0.3), 0 0 80px rgba(139,92,246,0.15)',
        animation: 'iconPulse 2s ease-in-out infinite',
        position: 'relative',
        zIndex: 1,
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00dcff" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="url(#iconGrad)" />
          <line x1="3" y1="6" x2="21" y2="6" stroke="url(#iconGrad)" />
          <path d="M16 10a4 4 0 0 1-8 0" stroke="url(#iconGrad)" />
        </svg>
      </div>

      {/* Brand name + tagline */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>

        {/* Line 1: Welcome to WC Store */}
        <p style={{
          fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)',
          fontWeight: 500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(0,220,255,0.85)',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          margin: '0 0 10px 0',
          minHeight: '1.4em',
          filter: 'drop-shadow(0 0 8px rgba(0,220,255,0.6))',
        }}>
          {welcomeText}
          {/* cursor blinks only while welcome is typing */}
          <span style={{
            display: 'inline-block',
            width: '2px',
            height: '0.8em',
            background: '#00dcff',
            marginLeft: '3px',
            verticalAlign: 'middle',
            animation: 'blink 0.6s step-end infinite',
            opacity: welcomeDone ? 0 : (welcomeText.length > 0 ? 1 : 0),
            transition: 'opacity 0.2s',
          }} />
        </p>

        {/* Line 2: ToyShop Pro */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 800,
          letterSpacing: '0.08em',
          background: 'linear-gradient(90deg, #00dcff 0%, #8b5cf6 50%, #ff64c8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          filter: 'drop-shadow(0 0 20px rgba(0,220,255,0.5))',
          margin: 0,
          minHeight: '1.2em',
        }}>
          {typedText}
          <span style={{
            display: 'inline-block',
            width: '3px',
            height: '0.85em',
            background: '#8b5cf6',
            marginLeft: '4px',
            verticalAlign: 'middle',
            animation: 'blink 0.7s step-end infinite',
            opacity: welcomeDone && typedText.length < brandName.length ? 1 : 0,
            transition: 'opacity 0.3s',
          }} />
        </h1>

        <p style={{
          marginTop: '12px',
          fontSize: 'clamp(0.8rem, 2vw, 0.95rem)',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'rgba(148,163,184,0.9)',
          opacity: showTagline ? 1 : 0,
          transform: showTagline ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          {tagline}
        </p>

        {/* Loading bar */}
        <div style={{
          marginTop: '32px',
          width: '200px',
          height: '2px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '999px',
          overflow: 'hidden',
          opacity: showTagline ? 1 : 0,
          transition: 'opacity 0.4s ease 0.2s',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #00dcff, #8b5cf6)',
            borderRadius: '999px',
            animation: 'loadBar 1.4s ease-out forwards',
            boxShadow: '0 0 8px #00dcff',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes scanBeam {
          0%   { top: -2px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50%       { transform: translateY(-20px) scale(1.3); opacity: 1; }
        }
        @keyframes spinCW  { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes spinCCW { from { transform: rotate(0deg); }   to { transform: rotate(-360deg); } }
        @keyframes iconPulse {
          0%, 100% { box-shadow: 0 0 40px rgba(0,220,255,0.3), 0 0 80px rgba(139,92,246,0.15); }
          50%       { box-shadow: 0 0 60px rgba(0,220,255,0.5), 0 0 120px rgba(139,92,246,0.25); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes loadBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
