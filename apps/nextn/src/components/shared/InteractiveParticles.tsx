'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface InteractiveParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  refresh?: boolean;
}

export default function InteractiveParticles({
  className,
  quantity = 30,
  staticity = 50,
  ease = 50,
  refresh = false,
}: InteractiveParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<any[]>([]);
  const mouse = useRef<{
    x: number;
    y: number;
    sentX: number;
    sentY: number;
    radius: number;
  }>({
    x: 0,
    y: 0,
    sentX: 0,
    sentY: 0,
    radius: 100,
  });

  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext('2d');
    }

    // Disable entirely on mobile / reduced motion (huge perf win)
    if (typeof window !== 'undefined') {
      if (
        window.innerWidth < 768 ||
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ) {
        return;
      }
    }

    initCanvas();
    let rafId = 0;
    let isVisible = !document.hidden;

    const loop = () => {
      if (isVisible) animateOnce();
      rafId = window.requestAnimationFrame(loop);
    };
    rafId = window.requestAnimationFrame(loop);

    window.addEventListener('resize', initCanvas);

    // Pause animation when tab hidden — saves huge CPU
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Throttled mouse tracking with rAF
    let pendingMove: { x: number; y: number } | null = null;
    const handleDocumentMouseMove = (e: MouseEvent) => {
      pendingMove = { x: e.clientX, y: e.clientY };
    };
    const flushMouse = () => {
      if (pendingMove && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const { w, h } = canvasSize.current;
        const x = pendingMove.x - rect.left;
        const y = pendingMove.y - rect.top;
        mouse.current.x = x;
        mouse.current.y = y;
        mouse.current.sentX = (x / w) * 2 - 1;
        mouse.current.sentY = (y / h) * 2 - 1;
        pendingMove = null;
      }
      mouseRafId = window.requestAnimationFrame(flushMouse);
    };
    let mouseRafId = window.requestAnimationFrame(flushMouse);

    document.addEventListener('mousemove', handleDocumentMouseMove, {
      passive: true,
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.cancelAnimationFrame(mouseRafId);
      window.removeEventListener('resize', initCanvas);
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initCanvas();
  }, [refresh]);

  const initCanvas = () => {
    resizeCanvas();
    drawParticles();
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.current.x = x;
      mouse.current.y = y;
      mouse.current.sentX = (x / w) * 2 - 1;
      mouse.current.sentY = (y / h) * 2 - 1;
    }
  };

  const onMouseClick = () => {
    if (canvasRef.current) {
      for (let i = 0; i < 5; i++) {
        const newCircle = {
          x: mouse.current.x,
          y: mouse.current.y,
          translateX: 0,
          translateY: 0,
          size: Math.random() * 2 + 1,
          alpha: 0,
          targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5,
          magnetism: 0.1 + Math.random() * 4,
        };
        circles.current.push(newCircle);
      }
    }
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0;
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);
    }
  };

  const circleParams = (): any => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const translateX = 0;
    const translateY = 0;
    const size = Math.floor(Math.random() * 2) + 1;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.05;
    const dy = (Math.random() - 0.5) * 0.05;
    const magnetism = 0.1 + Math.random() * 4;
    return {
      x,
      y,
      translateX,
      translateY,
      size,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  };

  const drawCircle = (circle: any, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      context.current.fillStyle = `rgba(139, 92, 246, ${alpha})`;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!update) {
        circles.current.push(circle);
      }
    }
  };

  const clearContext = () => {
    if (context.current) {
      context.current.clearRect(
        0,
        0,
        canvasSize.current.w,
        canvasSize.current.h
      );
    }
  };

  const drawParticles = () => {
    clearContext();
    // Hard cap: cheap on desktop, off on mobile (handled in main effect).
    let particleCount = Math.min(quantity, 18);
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        particleCount = Math.min(particleCount, 10);
      }
    }
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  };

  const remapValue = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number
  ): number => {
    const remapped =
      ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  };

  // Single-frame body (loop is handled by useEffect to allow proper cleanup)
  const animateOnce = () => {
    clearContext();
    const list = circles.current;
    for (let i = 0; i < list.length; i++) {
      const circle = list[i];
      // Handle the alpha value
      const edge = [
        circle.x + circle.translateX,
        canvasSize.current.w - (circle.x + circle.translateX),
        circle.y + circle.translateY,
        canvasSize.current.h - (circle.y + circle.translateY),
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(
        remapValue(closestEdge, 0, 20, 0, 1).toFixed(2)
      );
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha)
          circle.alpha = circle.targetAlpha;
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }

      // Update position with boundary checking
      circle.x += circle.dx;
      circle.y += circle.dy;

      // Bounce off edges to keep particles within canvas
      if (circle.x <= 0 || circle.x >= canvasSize.current.w) {
        circle.dx *= -1;
        circle.x = Math.max(0, Math.min(canvasSize.current.w, circle.x));
      }
      if (circle.y <= 0 || circle.y >= canvasSize.current.h) {
        circle.dy *= -1;
        circle.y = Math.max(0, Math.min(canvasSize.current.h, circle.y));
      }

      const distanceX = mouse.current.x - (circle.x + circle.translateX);
      const distanceY = mouse.current.y - (circle.y + circle.translateY);
      const mouseDistance = Math.sqrt(
        distanceX * distanceX + distanceY * distanceY
      );

      if (mouseDistance < mouse.current.radius) {
        const repelFactor =
          (1 - mouseDistance / mouse.current.radius) * staticity;
        circle.translateX -= (distanceX / mouseDistance) * repelFactor * 0.1;
        circle.translateY -= (distanceY / mouseDistance) * repelFactor * 0.1;
      } else {
        circle.translateX += (0 - circle.translateX) / ease;
        circle.translateY += (0 - circle.translateY) / ease;
      }

      // Draw without re-pushing into list
      drawCircle(
        {
          ...circle,
          x: circle.x,
          y: circle.y,
          translateX: circle.translateX,
          translateY: circle.translateY,
          alpha: circle.alpha,
        },
        true
      );
    }
    // NOTE: O(n²) line-connection loop removed for huge CPU savings.
  };

  // (legacy recursive `animate` removed)
  const animate = animateOnce;

  return (
    <div
      className={cn('absolute inset-0 -z-10 pointer-events-none', className)}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full"></canvas>
    </div>
  );
}
