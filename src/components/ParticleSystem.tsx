/**
 * Professional Particle Effects System
 * Provides reusable particle effects for games
 */

import React, { useEffect, useRef, useCallback } from 'react';

export type ParticleType = 
  | 'celebration'
  | 'explosion'
  | 'sparkle'
  | 'smoke'
  | 'fire'
  | 'star'
  | 'combo'
  | 'correct'
  | 'wrong'
  | 'powerup';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  type: ParticleType;
}

interface ParticleSystemProps {
  type: ParticleType;
  x: number;
  y: number;
  count?: number;
  duration?: number;
  onComplete?: () => void;
  colors?: string[];
}

const PARTICLE_CONFIGS: Record<ParticleType, {
  count: number;
  minSize: number;
  maxSize: number;
  minSpeed: number;
  maxSpeed: number;
  minLife: number;
  maxLife: number;
  gravity: number;
  colors: string[];
  spread: number;
}> = {
  celebration: {
    count: 50,
    minSize: 4,
    maxSize: 12,
    minSpeed: 3,
    maxSpeed: 10,
    minLife: 1,
    maxLife: 2,
    gravity: -2,
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#F472B6'],
    spread: 360
  },
  explosion: {
    count: 30,
    minSize: 8,
    maxSize: 20,
    minSpeed: 5,
    maxSpeed: 15,
    minLife: 0.5,
    maxLife: 1.2,
    gravity: 3,
    colors: ['#FF6B35', '#FF8C42', '#FFD166', '#FFFFFF'],
    spread: 360
  },
  sparkle: {
    count: 20,
    minSize: 2,
    maxSize: 6,
    minSpeed: 1,
    maxSpeed: 4,
    minLife: 0.8,
    maxLife: 1.5,
    gravity: -1,
    colors: ['#FFD700', '#FFF', '#FDE68A'],
    spread: 360
  },
  smoke: {
    count: 15,
    minSize: 10,
    maxSize: 25,
    minSpeed: 0.5,
    maxSpeed: 2,
    minLife: 1,
    maxLife: 2,
    gravity: -0.5,
    colors: ['#6B7280', '#9CA3AF', '#D1D5DB'],
    spread: 180
  },
  fire: {
    count: 25,
    minSize: 5,
    maxSize: 15,
    minSpeed: 2,
    maxSpeed: 6,
    minLife: 0.5,
    maxLife: 1,
    gravity: -2,
    colors: ['#FF4500', '#FF6B35', '#FFD700', '#FFF'],
    spread: 120
  },
  star: {
    count: 15,
    minSize: 3,
    maxSize: 8,
    minSpeed: 2,
    maxSpeed: 5,
    minLife: 1,
    maxLife: 2,
    gravity: -3,
    colors: ['#FFD700', '#FFA500', '#FFF'],
    spread: 360
  },
  combo: {
    count: 20,
    minSize: 4,
    maxSize: 10,
    minSpeed: 4,
    maxSpeed: 12,
    minLife: 0.8,
    maxLife: 1.5,
    gravity: -4,
    colors: ['#00D4FF', '#7C3AED', '#F59E0B', '#10B981'],
    spread: 360
  },
  correct: {
    count: 15,
    minSize: 3,
    maxSize: 8,
    minSpeed: 3,
    maxSpeed: 8,
    minLife: 0.6,
    maxLife: 1.2,
    gravity: -2,
    colors: ['#10B981', '#34D399', '#6EE7B7', '#FFF'],
    spread: 270
  },
  wrong: {
    count: 12,
    minSize: 4,
    maxSize: 10,
    minSpeed: 2,
    maxSpeed: 6,
    minLife: 0.5,
    maxLife: 1,
    gravity: 4,
    colors: ['#EF4444', '#F87171', '#FCA5A5'],
    spread: 200
  },
  powerup: {
    count: 25,
    minSize: 5,
    maxSize: 12,
    minSpeed: 3,
    maxSpeed: 8,
    minLife: 0.8,
    maxLife: 1.5,
    gravity: -2,
    colors: ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE'],
    spread: 360
  }
};

let particleId = 0;

export function ParticleBurst({ 
  type, 
  x, 
  y, 
  count: customCount, 
  duration = 2000,
  onComplete,
  colors: customColors
}: ParticleSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const config = PARTICLE_CONFIGS[type];
  const colors = customColors || config.colors;
  const count = customCount || config.count;

  const createParticle = useCallback((baseX: number, baseY: number): Particle => {
    const angle = (Math.random() * config.spread - config.spread / 2) * (Math.PI / 180);
    const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
    const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
    const life = config.minLife + Math.random() * (config.maxLife - config.minLife);
    
    return {
      id: particleId++,
      x: baseX,
      y: baseY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      life,
      maxLife: life,
      type
    };
  }, [config, colors]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Create particles
    particlesRef.current = Array.from({ length: count }, () => 
      createParticle(x || rect.width / 2, y || rect.height / 2)
    );

    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      
      if (elapsed > duration) {
        onComplete?.();
        return;
      }

      // Update particles
      particlesRef.current = particlesRef.current.map(p => {
        const progress = p.life / p.maxLife;
        
        return {
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy + config.gravity,
          vy: p.vy + config.gravity * 0.02,
          opacity: progress,
          rotation: p.rotation + p.rotationSpeed,
          life: p.life - 0.016
        };
      }).filter(p => p.life > 0);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [type, x, y, count, duration, config.gravity, createParticle, onComplete]);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ 
        position: 'absolute', 
        left: x ? `${x}px` : '50%', 
        top: y ? `${y}px` : '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      {particlesRef.current.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            boxShadow: `0 0 ${p.size}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

// Simple particle burst that renders immediately (no hooks)
export function renderParticles(
  container: HTMLElement,
  type: ParticleType,
  x: number,
  y: number,
  count?: number
) {
  const config = PARTICLE_CONFIGS[type];
  const colors = config.colors;
  const particleCount = count || config.count;
  
  const particles: Particle[] = Array.from({ length: particleCount }, () => {
    const angle = (Math.random() * config.spread - config.spread / 2) * (Math.PI / 180);
    const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
    const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
    const life = config.minLife + Math.random() * (config.maxLife - config.minLife);
    
    return {
      id: particleId++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      life,
      maxLife: life,
      type
    };
  });

  // Create DOM elements
  const elements = particles.map(p => {
    const el = document.createElement('div');
    el.className = 'absolute rounded-full pointer-events-none';
    el.style.cssText = `
      left: ${p.x}px;
      top: ${p.y}px;
      width: ${p.size}px;
      height: ${p.size}px;
      background-color: ${p.color};
      opacity: 1;
      transform: translate(-50%, -50%) rotate(${p.rotation}deg);
      box-shadow: 0 0 ${p.size}px ${p.color};
    `;
    container.appendChild(el);
    return { element: el, particle: p };
  });

  // Animate
  const startTime = Date.now();
  const duration = 2000;

  const animate = () => {
    const elapsed = Date.now() - startTime;
    
    if (elapsed > duration) {
      elements.forEach(({ element }) => element.remove());
      return;
    }

    elements.forEach(({ element, particle: p }) => {
      const progress = p.life / p.maxLife;
      p.x += p.vx;
      p.y += p.vy + config.gravity;
      p.vy += config.gravity * 0.02;
      p.rotation += p.rotationSpeed;
      
      element.style.left = `${p.x}px`;
      element.style.top = `${p.y}px`;
      element.style.opacity = `${progress}`;
      element.style.transform = `translate(-50%, -50%) rotate(${p.rotation}deg)`;
    });

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

// Screen shake hook
export function useScreenShake(intensity: number = 10, duration: number = 300) {
  const shakeRef = useRef<number>(0);

  const triggerShake = useCallback(() => {
    const start = Date.now();
    
    const shake = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const decay = 1 - progress;
      
      shakeRef.current = Math.sin(elapsed * 0.05) * intensity * decay;
      
      if (progress < 1) {
        requestAnimationFrame(shake);
      } else {
        shakeRef.current = 0;
      }
    };
    
    requestAnimationFrame(shake);
  }, [intensity, duration]);

  return { shake: shakeRef.current, triggerShake };
}

// Screen shake component
export function ScreenShake({ active, intensity = 10, children }: { active: boolean; intensity?: number; children: React.ReactNode }) {
  const [shake, setShake] = useState(0);
  
  useEffect(() => {
    if (!active) {
      setShake(0);
      return;
    }

    const start = Date.now();
    const duration = 300;

    const shakeAnim = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const decay = 1 - progress;
      
      setShake(Math.sin(elapsed * 0.05) * intensity * decay);
      
      if (progress < 1) {
        requestAnimationFrame(shakeAnim);
      } else {
        setShake(0);
      }
    };

    requestAnimationFrame(shakeAnim);
  }, [active, intensity]);

  return (
    <div style={{ transform: `translate(${shake}px, ${shake}px)` }}>
      {children}
    </div>
  );
}

import { useState } from 'react';

// Floating text component for score/combo feedback
export function FloatingText({
  x,
  y,
  text,
  type = 'score',
  onComplete
}: {
  x: number;
  y: number;
  text: string;
  type?: 'score' | 'combo' | 'correct' | 'wrong' | 'powerup';
  onComplete?: () => void;
}) {
  const [opacity, setOpacity] = useState(1);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 1000;

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = elapsed / duration;

      if (progress >= 1) {
        onComplete?.();
        return;
      }

      setOpacity(1 - progress);
      setOffsetY(-progress * 60);

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  const colors = {
    score: 'text-yellow-400',
    combo: 'text-cyan-400',
    correct: 'text-green-400',
    wrong: 'text-red-400',
    powerup: 'text-purple-400'
  };

  const sizes = {
    score: 'text-2xl',
    combo: 'text-3xl',
    correct: 'text-xl',
    wrong: 'text-xl',
    powerup: 'text-2xl'
  };

  return (
    <div
      className={`absolute pointer-events-none font-bold ${colors[type]} ${sizes[type]}`}
      style={{
        left: x,
        top: y + offsetY,
        opacity,
        transform: 'translate(-50%, -50%)',
        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
      }}
    >
      {text}
    </div>
  );
}
