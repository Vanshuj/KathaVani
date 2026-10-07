import React, { useEffect, useRef } from 'react';

/**
 * 3D Heritage Constellation & Floating Diya Embers Animation
 * - True 3D coordinate system (x, y, z) with perspective projection
 * - Multi-layered depth: Celestial astrolabe ring, 3D star-node constellation, and floating golden sparks
 * - Dynamic mouse parallax and gravitational proximity beams
 * - High-contrast cultural palette: Luminous gold (#e8a946), ember terracotta (#d4834a), and emerald (#4ea87c)
 */
export default function Background3D() {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking for 3D camera parallax and magnetic particle tethering
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      screenX: width / 2,
      screenY: height / 2,
      active: false
    };

    const handleMouseMove = (e) => {
      mouse.screenX = e.clientX;
      mouse.screenY = e.clientY;
      mouse.targetX = (e.clientX / width - 0.5) * 0.7;
      mouse.targetY = (e.clientY / height - 0.5) * 0.7;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = 0;
      mouse.targetY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- 3D Scene Configuration ---
    const PERSPECTIVE = 650;
    const FIELD_WIDTH = Math.max(1400, width * 1.2);
    const FIELD_HEIGHT = Math.max(1000, height * 1.2);
    const FIELD_DEPTH = 700;

    // 1. Constellation Star Nodes
    const NODE_COUNT = 90;
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * FIELD_WIDTH,
        y: (Math.random() - 0.5) * FIELD_HEIGHT,
        z: (Math.random() - 0.5) * FIELD_DEPTH,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        vz: (Math.random() - 0.5) * 0.35,
        baseRadius: Math.random() * 2.2 + 1.4,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulseOffset: Math.random() * Math.PI * 2,
        colorType: i % 4 // 0: bright gold, 1: warm amber, 2: terracotta, 3: emerald jade
      });
    }

    // 2. Floating Story Embers (Diya sparks floating upward in 3D)
    const EMBER_COUNT = 32;
    const embers = [];
    for (let i = 0; i < EMBER_COUNT; i++) {
      embers.push({
        x: (Math.random() - 0.5) * FIELD_WIDTH,
        y: (Math.random() - 0.5) * FIELD_HEIGHT + FIELD_HEIGHT * 0.2,
        z: (Math.random() - 0.5) * (FIELD_DEPTH * 0.8),
        vy: -(Math.random() * 0.7 + 0.35),
        wobbleSpeed: Math.random() * 0.04 + 0.02,
        wobbleDist: Math.random() * 30 + 15,
        wobblePhase: Math.random() * Math.PI * 2,
        size: Math.random() * 2.8 + 1.8,
        life: Math.random() * Math.PI * 2
      });
    }

    // 3. 3D Celestial Ring Points (Background Armillary Mandala Sphere)
    const RING_POINTS = 48;
    const RING_RADIUS = Math.min(width, height) * 0.38;
    const ringPoints = [];
    for (let i = 0; i < RING_POINTS; i++) {
      const theta = (i / RING_POINTS) * Math.PI * 2;
      ringPoints.push({
        x: RING_RADIUS * Math.cos(theta),
        y: RING_RADIUS * Math.sin(theta) * 0.35,
        z: RING_RADIUS * Math.sin(theta) * 0.9,
        baseRadius: 1.5,
        phase: theta
      });
    }

    let rotY = 0;
    let rotX = 0;
    let time = 0;

    const render = () => {
      time += 0.016;

      // Smooth camera interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      if (!prefersReducedMotion) {
        rotY += 0.0016;
      }
      const curRotY = rotY + mouse.x * 0.55;
      const curRotX = mouse.y * 0.45;

      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const cx = width / 2;
      const cy = height / 2;

      const cosY = Math.cos(curRotY);
      const sinY = Math.sin(curRotY);
      const cosX = Math.cos(curRotX);
      const sinX = Math.sin(curRotX);

      // 3D projection transformation helper
      const project = (x, y, z) => {
        // Rotate around Y
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        // Rotate around X
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        // Perspective scale
        const scale = PERSPECTIVE / (PERSPECTIVE + z2 + FIELD_DEPTH * 0.5);
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          depth: z2,
          scale,
          visible: scale > 0
        };
      };

      // -------------------------------------------------------------
      // 1. Render 3D Celestial Ring in the background
      // -------------------------------------------------------------
      const projectedRing = [];
      for (let i = 0; i < ringPoints.length; i++) {
        const rp = ringPoints[i];
        const proj = project(rp.x, rp.y, rp.z);
        if (proj.visible) {
          projectedRing.push({ ...proj, i });
        }
      }

      if (projectedRing.length > 2) {
        ctx.save();
        ctx.beginPath();
        const firstPt = projectedRing[0];
        ctx.moveTo(firstPt.px, firstPt.py);
        for (let i = 1; i < projectedRing.length; i++) {
          ctx.lineTo(projectedRing[i].px, projectedRing[i].py);
        }
        ctx.closePath();
        ctx.lineWidth = isDark ? 1.4 : 1.0;
        ctx.strokeStyle = isDark
          ? 'rgba(232, 169, 70, 0.22)'
          : 'rgba(180, 95, 43, 0.16)';
        ctx.stroke();

        // Glowing nodes along the celestial ring
        for (let i = 0; i < projectedRing.length; i += 3) {
          const pt = projectedRing[i];
          const ringAlpha = Math.min(0.6, pt.scale * (isDark ? 0.5 : 0.3));
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, 2.2 * pt.scale, 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? `rgba(232, 169, 70, ${ringAlpha})`
            : `rgba(180, 95, 43, ${ringAlpha})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 2. Update & Project Constellation Nodes
      // -------------------------------------------------------------
      const projectedNodes = [];
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        if (!prefersReducedMotion) {
          n.x += n.vx;
          n.y += n.vy;
          n.z += n.vz;

          // Boundary wraps
          if (n.x < -FIELD_WIDTH / 2) n.x = FIELD_WIDTH / 2;
          if (n.x > FIELD_WIDTH / 2) n.x = -FIELD_WIDTH / 2;
          if (n.y < -FIELD_HEIGHT / 2) n.y = FIELD_HEIGHT / 2;
          if (n.y > FIELD_HEIGHT / 2) n.y = -FIELD_HEIGHT / 2;
          if (n.z < -FIELD_DEPTH / 2) n.z = FIELD_DEPTH / 2;
          if (n.z > FIELD_DEPTH / 2) n.z = -FIELD_DEPTH / 2;
        }

        const proj = project(n.x, n.y, n.z);
        if (proj.visible) {
          const pulse = Math.sin(time * 3 + n.pulseOffset) * 0.25 + 0.75;
          projectedNodes.push({
            ...n,
            px: proj.px,
            py: proj.py,
            depth: proj.depth,
            scale: proj.scale,
            radius: n.baseRadius * proj.scale * pulse
          });
        }
      }

      // -------------------------------------------------------------
      // 3. Draw 3D Connecting Filaments (High Contrast & Visible)
      // -------------------------------------------------------------
      const maxConnectDist = isDark ? 155 : 135;
      for (let i = 0; i < projectedNodes.length; i++) {
        const p1 = projectedNodes[i];
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p2 = projectedNodes[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectDist) {
            const depthFactor = Math.min(p1.scale, p2.scale);
            const distRatio = 1 - dist / maxConnectDist;
            const alpha = distRatio * depthFactor * (isDark ? 0.42 : 0.24);

            if (alpha > 0.02) {
              ctx.beginPath();
              ctx.lineWidth = Math.max(0.6, distRatio * 1.5 * depthFactor);
              ctx.strokeStyle = isDark
                ? `rgba(232, 169, 70, ${alpha})`
                : `rgba(180, 95, 43, ${alpha})`;
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }
      }

      // -------------------------------------------------------------
      // 4. Interactive Cursor Tethering Beams
      // -------------------------------------------------------------
      if (mouse.active) {
        const mouseBeamDist = 180;
        for (let i = 0; i < projectedNodes.length; i++) {
          const p = projectedNodes[i];
          const dx = mouse.screenX - p.px;
          const dy = mouse.screenY - p.py;
          const dist = Math.hypot(dx, dy);

          if (dist < mouseBeamDist) {
            const beamAlpha = (1 - dist / mouseBeamDist) * (isDark ? 0.65 : 0.4);
            ctx.beginPath();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = isDark
              ? `rgba(240, 185, 75, ${beamAlpha})`
              : `rgba(180, 95, 43, ${beamAlpha})`;
            ctx.moveTo(p.px, p.py);
            ctx.lineTo(mouse.screenX, mouse.screenY);
            ctx.stroke();

            // Glow on tethered particle
            ctx.beginPath();
            ctx.arc(p.px, p.py, p.radius * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = isDark
              ? `rgba(232, 169, 70, ${beamAlpha * 0.45})`
              : `rgba(180, 95, 43, ${beamAlpha * 0.35})`;
            ctx.fill();
          }
        }
      }

      // -------------------------------------------------------------
      // 5. Draw Constellation Star Nodes with Radiant Corona
      // -------------------------------------------------------------
      for (let i = 0; i < projectedNodes.length; i++) {
        const p = projectedNodes[i];
        const alpha = Math.min(1, Math.max(0.25, p.scale * (isDark ? 0.95 : 0.75)));

        ctx.save();
        ctx.globalAlpha = alpha;

        // Radiant halo for closer particles
        if (p.scale > 0.75) {
          const haloGrad = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, p.radius * 3.5);
          if (isDark) {
            haloGrad.addColorStop(0, 'rgba(232, 169, 70, 0.4)');
            haloGrad.addColorStop(0.5, 'rgba(212, 131, 74, 0.15)');
            haloGrad.addColorStop(1, 'rgba(232, 169, 70, 0)');
          } else {
            haloGrad.addColorStop(0, 'rgba(180, 95, 43, 0.35)');
            haloGrad.addColorStop(0.5, 'rgba(201, 149, 42, 0.12)');
            haloGrad.addColorStop(1, 'rgba(180, 95, 43, 0)');
          }
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.radius * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = haloGrad;
          ctx.fill();
        }

        // Center particle
        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(1.2, p.radius), 0, Math.PI * 2);

        if (isDark) {
          if (p.colorType === 0) ctx.fillStyle = '#ffc857';
          else if (p.colorType === 1) ctx.fillStyle = '#e8a946';
          else if (p.colorType === 2) ctx.fillStyle = '#d4834a';
          else ctx.fillStyle = '#4ea87c'; // Jade emerald heritage spark
        } else {
          if (p.colorType === 0) ctx.fillStyle = '#b45f2b';
          else if (p.colorType === 1) ctx.fillStyle = '#c9952a';
          else if (p.colorType === 2) ctx.fillStyle = '#8b3e14';
          else ctx.fillStyle = '#3a7a5c';
        }
        ctx.fill();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // 6. Floating Story Embers (Diyas drifting upward in 3D)
      // -------------------------------------------------------------
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];

        if (!prefersReducedMotion) {
          e.y += e.vy;
          e.life += 0.02;

          // Recycle ember when it drifts out of top viewport
          if (e.y < -FIELD_HEIGHT / 2) {
            e.y = FIELD_HEIGHT / 2 + 50;
            e.x = (Math.random() - 0.5) * FIELD_WIDTH;
            e.z = (Math.random() - 0.5) * (FIELD_DEPTH * 0.8);
          }
        }

        const wobbleX = Math.sin(e.life * e.wobbleSpeed * 40 + e.wobblePhase) * e.wobbleDist;
        const proj = project(e.x + wobbleX, e.y, e.z);

        if (proj.visible) {
          const emberAlpha = Math.min(0.85, Math.max(0.2, (Math.sin(e.life * 2) * 0.25 + 0.6) * proj.scale));
          const r = e.size * proj.scale;

          ctx.save();
          ctx.globalAlpha = emberAlpha;

          // Warm ember glow
          const grad = ctx.createRadialGradient(proj.px, proj.py, 0, proj.px, proj.py, r * 3);
          grad.addColorStop(0, isDark ? '#ffdc73' : '#d4834a');
          grad.addColorStop(0.4, isDark ? 'rgba(232, 169, 70, 0.45)' : 'rgba(180, 95, 43, 0.35)');
          grad.addColorStop(1, 'rgba(255, 180, 50, 0)');

          ctx.beginPath();
          ctx.arc(proj.px, proj.py, r * 3, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Core spark
          ctx.beginPath();
          ctx.arc(proj.px, proj.py, Math.max(1, r), 0, Math.PI * 2);
          ctx.fillStyle = isDark ? '#fff5d6' : '#8b3e14';
          ctx.fill();

          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 1
      }}
      aria-hidden="true"
    />
  );
}
