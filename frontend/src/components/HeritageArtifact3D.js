import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompass, faBookOpen, faVolumeHigh, faRotate, faExpand } from '@fortawesome/free-solid-svg-icons';

// Heritage traditions plotted on a 3D sphere coordinate system (latitude, longitude, radius)
const TRADITIONS_3D = [
  {
    id: 'chola-maritime',
    title: 'Chola Maritime Chronicles',
    region: 'South India',
    era: '10th Century CE',
    lat: -0.2, lon: 0.4,
    tags: ['naval', 'expedition', 'kaveri'],
    summary: 'Naval fleets carrying bronze iconography across the Indian Ocean to Southeast Asia.',
    storyId: 'kaveri-waters'
  },
  {
    id: 'warli-murals',
    title: 'Warli Ancestral Songlines',
    region: 'Western Ghats',
    era: 'Neolithic Tradition',
    lat: 0.1, lon: -0.8,
    tags: ['tribal', 'nature', 'tarpa'],
    summary: 'Sacred white rice paste murals painted to the rhythm of the harvest tarpa pipe.',
    storyId: 'warli-vision'
  },
  {
    id: 'ashoka-peace',
    title: 'Dharmavijaya Rock Edicts',
    region: 'Eastern Kalinga',
    era: '261 BCE',
    lat: 0.35, lon: 0.8,
    tags: ['righteousness', 'peace', 'mauryan'],
    summary: 'Pillar inscriptions carved across trade paths renouncing conquest by sword.',
    storyId: 'ashoka-peace'
  },
  {
    id: 'indus-seals',
    title: 'Seals of the Great Bath',
    region: 'Indus Valley',
    era: '2500 BCE',
    lat: 0.5, lon: -0.3,
    tags: ['steatite', 'script', 'trade'],
    summary: 'Carved steatite seals depicting humped bulls, unicorns, and enigmatic pictographs.',
    storyId: 'indus-seals'
  },
  {
    id: 'arjuna-focus',
    title: 'The Avadhani Oral Verses',
    region: 'Deccan Plateau',
    era: 'Classical Tradition',
    lat: -0.4, lon: -0.5,
    tags: ['memory', 'oral', 'meter'],
    summary: 'Eight-fold memory challenges memorizing thousands of metered shlokas simultaneously.',
    storyId: 'arjuna-test'
  },
  {
    id: 'himalayan-rivers',
    title: 'Kinnaur Kinship Ballads',
    region: 'Himalayan Belt',
    era: 'Oral Transmitted',
    lat: 0.75, lon: 0.2,
    tags: ['high-altitude', 'folklore', 'snow'],
    summary: 'Mountain shepherd ballads sung across glacial passes at seasonal solstices.',
    storyId: 'silk-road'
  }
];

export default function HeritageArtifact3D() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const [activeItem, setActiveItem] = useState(TRADITIONS_3D[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0.25, y: 0.8 });
  const [autoRotate, setAutoRotate] = useState(true);
  const dragStartRef = useRef({ x: 0, y: 0, rotX: 0.25, rotY: 0.8 });
  const animFrameRef = useRef(null);

  // Check system prefers-reduced-motion
  const prefersReducedMotion = useRef(
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let currentRotX = rotation.x;
    let currentRotY = rotation.y;

    const SPHERE_RADIUS = 150;
    const PERSPECTIVE = 460;
    let animTime = 0;

    const render = () => {
      animTime += 0.02;

      // Auto-rotation when not interacting
      if (autoRotate && !isDragging && !prefersReducedMotion.current) {
        currentRotY += 0.005;
        setRotation(prev => ({ ...prev, y: currentRotY }));
      } else {
        currentRotX = rotation.x;
        currentRotY = rotation.y;
      }

      // Handle responsive high-DPI canvas
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * window.devicePixelRatio || canvas.height !== height * window.devicePixelRatio) {
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
      }
      ctx.resetTransform();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Detect dark theme
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const ringColor = isDark ? 'rgba(232, 169, 70, 0.72)' : 'rgba(180, 95, 43, 0.65)';
      const meridianColor = isDark ? 'rgba(212, 131, 74, 0.55)' : 'rgba(201, 149, 42, 0.48)';
      const eclipticColor = isDark ? 'rgba(245, 200, 100, 0.65)' : 'rgba(180, 95, 43, 0.55)';
      const nodeColor = isDark ? '#f0b94b' : '#b45f2b';
      const nodeActiveColor = isDark ? '#4ea87c' : '#3a7a5c';

      // 3D Rotation helper
      const project3D = (x, y, z) => {
        // Rotate Y
        const cosY = Math.cos(currentRotY);
        const sinY = Math.sin(currentRotY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // Rotate X
        const cosX = Math.cos(currentRotX);
        const sinX = Math.sin(currentRotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        // Perspective scale
        const scale = PERSPECTIVE / (PERSPECTIVE + z2);
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          depth: z2,
          scale,
          visible: z2 > -PERSPECTIVE + 30
        };
      };

      // Draw rich atmospheric depth glow behind artifact
      const bgGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, SPHERE_RADIUS * 1.4);
      if (isDark) {
        bgGlow.addColorStop(0, 'rgba(232, 169, 70, 0.22)');
        bgGlow.addColorStop(0.5, 'rgba(212, 131, 74, 0.10)');
        bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        bgGlow.addColorStop(0, 'rgba(201, 149, 42, 0.20)');
        bgGlow.addColorStop(0.5, 'rgba(180, 95, 43, 0.08)');
        bgGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      }
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, SPHERE_RADIUS * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Render 3D Inner Sacred Diamond Core
      const coreSize = 22;
      const coreAngle = -animTime * 1.5;
      const coreCos = Math.cos(coreAngle);
      const coreSin = Math.sin(coreAngle);
      const coreVertices = [
        { x: 0, y: -coreSize, z: 0 },
        { x: 0, y: coreSize, z: 0 },
        { x: coreSize * coreCos, y: 0, z: coreSize * coreSin },
        { x: -coreSize * coreCos, y: 0, z: -coreSize * coreSin },
        { x: -coreSize * coreSin, y: 0, z: coreSize * coreCos },
        { x: coreSize * coreSin, y: 0, z: -coreSize * coreCos }
      ];
      const projCore = coreVertices.map(v => project3D(v.x, v.y, v.z));
      const coreEdges = [
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 4], [4, 3], [3, 5], [5, 2]
      ];
      ctx.save();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = isDark ? 'rgba(240, 185, 75, 0.55)' : 'rgba(180, 95, 43, 0.45)';
      coreEdges.forEach(([i1, i2]) => {
        const p1 = projCore[i1];
        const p2 = projCore[i2];
        if (p1.visible && p2.visible) {
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        }
      });
      ctx.restore();

      // Render 3D Armillary Rings (Equatorial, Meridian, Ecliptic, and Tropic)
      const rings = [
        { axis: 'equator', radius: SPHERE_RADIUS, color: ringColor, width: 2.0 },
        { axis: 'meridian', radius: SPHERE_RADIUS * 0.98, color: meridianColor, width: 1.6 },
        { axis: 'ecliptic', radius: SPHERE_RADIUS * 0.96, color: eclipticColor, width: 1.8 },
        { axis: 'tropic', radius: SPHERE_RADIUS * 0.78, color: ringColor, width: 1.2 }
      ];

      rings.forEach(ring => {
        ctx.beginPath();
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.width;

        const STEPS = 54;
        let first = true;
        for (let i = 0; i <= STEPS; i++) {
          const theta = (i / STEPS) * Math.PI * 2;
          let rx = 0, ry = 0, rz = 0;
          if (ring.axis === 'equator') {
            rx = ring.radius * Math.cos(theta);
            ry = 0;
            rz = ring.radius * Math.sin(theta);
          } else if (ring.axis === 'meridian') {
            rx = 0;
            ry = ring.radius * Math.cos(theta);
            rz = ring.radius * Math.sin(theta);
          } else if (ring.axis === 'ecliptic') {
            const tilt = Math.PI / 6.5;
            const basex = ring.radius * Math.cos(theta);
            const basez = ring.radius * Math.sin(theta);
            rx = basex;
            ry = basez * Math.sin(tilt);
            rz = basez * Math.cos(tilt);
          } else {
            // Tropic latitude ring
            rx = ring.radius * Math.cos(theta);
            ry = SPHERE_RADIUS * 0.38;
            rz = ring.radius * Math.sin(theta);
          }
          const pt = project3D(rx, ry, rz);
          if (first) {
            ctx.moveTo(pt.px, pt.py);
            first = false;
          } else {
            ctx.lineTo(pt.px, pt.py);
          }
        }
        ctx.stroke();
      });

      // Render 3D Orbital Beads gliding smoothly along the rings
      const beads = [
        { axis: 'equator', theta: animTime * 0.7, r: SPHERE_RADIUS, color: '#ffdc73' },
        { axis: 'meridian', theta: -animTime * 0.55, r: SPHERE_RADIUS * 0.98, color: '#e8a946' },
        { axis: 'ecliptic', theta: animTime * 0.45, r: SPHERE_RADIUS * 0.96, color: '#4ea87c' }
      ];

      beads.forEach(b => {
        let bx = 0, by = 0, bz = 0;
        if (b.axis === 'equator') {
          bx = b.r * Math.cos(b.theta);
          by = 0;
          bz = b.r * Math.sin(b.theta);
        } else if (b.axis === 'meridian') {
          bx = 0;
          by = b.r * Math.cos(b.theta);
          bz = b.r * Math.sin(b.theta);
        } else {
          const tilt = Math.PI / 6.5;
          const basex = b.r * Math.cos(b.theta);
          const basez = b.r * Math.sin(b.theta);
          bx = basex;
          by = basez * Math.sin(tilt);
          bz = basez * Math.cos(tilt);
        }
        const bProj = project3D(bx, by, bz);
        if (bProj.visible) {
          ctx.save();
          // Glow halo
          const bGrad = ctx.createRadialGradient(bProj.px, bProj.py, 0, bProj.px, bProj.py, 8 * bProj.scale);
          bGrad.addColorStop(0, b.color);
          bGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.arc(bProj.px, bProj.py, 8 * bProj.scale, 0, Math.PI * 2);
          ctx.fill();

          // Core bead
          ctx.beginPath();
          ctx.arc(bProj.px, bProj.py, 3 * bProj.scale, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.restore();
        }
      });

      // Calculate 3D points for each heritage tradition
      const projectedNodes = TRADITIONS_3D.map(tradition => {
        const theta = tradition.lon * Math.PI;
        const phi = tradition.lat * (Math.PI / 2);
        const x = SPHERE_RADIUS * Math.cos(phi) * Math.sin(theta);
        const y = -SPHERE_RADIUS * Math.sin(phi);
        const z = SPHERE_RADIUS * Math.cos(phi) * Math.cos(theta);

        const proj = project3D(x, y, z);
        return {
          ...tradition,
          ...proj,
          isActive: activeItem?.id === tradition.id
        };
      });

      // Sort by depth so back items render behind front items
      projectedNodes.sort((a, b) => b.depth - a.depth);

      // Draw connecting longitude thread lines from sphere center
      projectedNodes.forEach(node => {
        if (!node.visible) return;
        const alpha = Math.max(0.15, (node.depth + SPHERE_RADIUS) / (SPHERE_RADIUS * 2));
        ctx.beginPath();
        ctx.strokeStyle = isDark 
          ? `rgba(232, 169, 70, ${alpha * 0.45})` 
          : `rgba(180, 95, 43, ${alpha * 0.35})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.px, node.py);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw each node in 3D perspective
      projectedNodes.forEach(node => {
        if (!node.visible) return;

        const radius = (node.isActive ? 11 : 7.5) * node.scale;
        const opacity = Math.max(0.35, Math.min(1, (node.depth + SPHERE_RADIUS * 1.2) / (SPHERE_RADIUS * 2)));

        ctx.save();
        ctx.globalAlpha = opacity;

        // Outer pulsing aura
        if (node.isActive) {
          const pulse = Math.sin(animTime * 3.5) * 0.25 + 1;
          ctx.beginPath();
          ctx.arc(node.px, node.py, radius * 2.4 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? 'rgba(78, 168, 124, 0.28)' : 'rgba(58, 122, 92, 0.25)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(node.px, node.py, radius * 1.6, 0, Math.PI * 2);
          ctx.strokeStyle = nodeActiveColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Subtle glow for inactive nodes
          ctx.beginPath();
          ctx.arc(node.px, node.py, radius * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? 'rgba(232, 169, 70, 0.18)' : 'rgba(180, 95, 43, 0.15)';
          ctx.fill();
        }

        // Main node circle
        ctx.beginPath();
        ctx.arc(node.px, node.py, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isActive ? nodeActiveColor : nodeColor;
        ctx.fill();

        ctx.strokeStyle = isDark ? '#0c0e12' : '#fffcf5';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Node Label (crisp contrast when in front hemisphere)
        if (node.depth > -35) {
          ctx.font = `${node.isActive ? '700' : '600'} ${Math.round(11.5 * node.scale)}px "DM Mono", monospace`;
          ctx.fillStyle = isDark ? '#f6f7f9' : '#1f1612';
          ctx.textAlign = 'left';
          ctx.fillText(node.title, node.px + radius + 7, node.py + 4);

          // Subtitle tag
          ctx.font = `500 ${Math.round(9.5 * node.scale)}px "Crimson Pro", Georgia, serif`;
          ctx.fillStyle = isDark ? '#caced5' : '#604e43';
          ctx.fillText(node.region, node.px + radius + 7, node.py + 17);
        }

        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [rotation, autoRotate, isDragging, activeItem]);

  // Mouse / Touch interaction handlers for smooth 3D orbit
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      rotX: rotation.x,
      rotY: rotation.y
    };
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;

    const nextX = Math.max(-1.2, Math.min(1.2, dragStartRef.current.rotX - dy * 0.008));
    const nextY = dragStartRef.current.rotY + dx * 0.008;

    setRotation({ x: nextX, y: nextY });
  }, [isDragging]);

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Click on canvas to select nearest node
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cx = canvas.clientWidth / 2;
    const cy = canvas.clientHeight / 2;
    const PERSPECTIVE = 460;
    const SPHERE_RADIUS = 150;

    // Project each node to find if any clicked
    let closestNode = null;
    let minDistance = 28; // click tolerance radius

    TRADITIONS_3D.forEach(tradition => {
      const theta = tradition.lon * Math.PI;
      const phi = tradition.lat * (Math.PI / 2);
      const x = SPHERE_RADIUS * Math.cos(phi) * Math.sin(theta);
      const y = -SPHERE_RADIUS * Math.sin(phi);
      const z = SPHERE_RADIUS * Math.cos(phi) * Math.cos(theta);

      // Rotate Y
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate X
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const scale = PERSPECTIVE / (PERSPECTIVE + z2);
      const px = cx + x1 * scale;
      const py = cy + y2 * scale;

      const dist = Math.hypot(clickX - px, clickY - py);
      if (dist < minDistance && z2 > -100) {
        minDistance = dist;
        closestNode = tradition;
      }
    });

    if (closestNode) {
      setActiveItem(closestNode);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="card card-3d" 
      style={{ 
        position: 'relative', 
        padding: '1.25rem',
        overflow: 'hidden',
        border: '1px solid var(--border-strong)',
        background: 'var(--bg-card)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'rgba(180,95,43,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faCompass} style={{ color: 'var(--terracotta)', fontSize: '0.9rem' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
              3D Cultural Astrolabe
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Interactive Oral Tradition Sphere
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setAutoRotate(!autoRotate)} 
            className={`btn btn-sm ${autoRotate ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            title={autoRotate ? 'Pause 3D rotation' : 'Resume 3D rotation'}
          >
            <FontAwesomeIcon icon={faRotate} style={{ marginRight: 4 }} />
            {autoRotate ? 'Orbiting' : 'Paused'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(260px, 1fr)', gap: '1.25rem', alignItems: 'center' }}>
        {/* 3D Canvas Viewport */}
        <div 
          style={{ 
            position: 'relative', 
            height: '380px', 
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none'
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onClick={handleCanvasClick}
        >
          <canvas 
            ref={canvasRef} 
            style={{ width: '100%', height: '100%', display: 'block' }} 
            aria-label="Interactive 3D Armillary Sphere plotting India's living cultural traditions"
          />

          <div style={{ position: 'absolute', bottom: '8px', left: '8px', pointerEvents: 'none', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ✦ Drag to orbit 3D sphere · Click nodes to inspect
          </div>
        </div>

        {/* Selected Tradition Detail Panel */}
        {activeItem && (
          <div 
            style={{ 
              padding: '1.25rem', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--bg-elevated)', 
              border: '1px solid var(--border)' 
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span className="tag" style={{ background: 'rgba(58,122,92,0.12)', color: 'var(--jade)', fontSize: '0.72rem', padding: '0.2rem 0.5rem', fontWeight: 600 }}>
                {activeItem.region}
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--gold)', fontWeight: 600 }}>
                {activeItem.era}
              </span>
            </div>

            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: 'var(--terracotta)' }}>
              {activeItem.title}
            </h4>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.9rem' }}>
              {activeItem.summary}
            </p>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {activeItem.tags.map(tag => (
                <span key={tag} className={`tag tag-${tag}`} style={{ fontSize: '0.7rem' }}>
                  #{tag}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button 
                onClick={() => navigate('/listener')} 
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
              >
                <FontAwesomeIcon icon={faVolumeHigh} style={{ marginRight: 6 }} />
                Listen in Vault
              </button>
              <button 
                onClick={() => navigate('/vault')} 
                className="btn btn-secondary btn-sm"
              >
                <FontAwesomeIcon icon={faBookOpen} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .card-3d > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
