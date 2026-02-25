// Hook personnalisé pour détecter les secousses et mouvements rapides
import { useEffect, useState, useRef } from 'react';

export const useShakeDetection = (enabled = true, threshold = 20) => {
  const [isShaking, setIsShaking] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() });
  const lastTouch = useRef({ x: 0, y: 0, time: Date.now() });

  useEffect(() => {
    if (!enabled) {
      setIsShaking(false);
      return;
    }

    let shakeTimeout;

    // Détection de secousse mobile (accelerometer)
    const handleDeviceMotion = (event) => {
      const acceleration = event.accelerationIncludingGravity;
      const movement = Math.abs(acceleration.x) + Math.abs(acceleration.y) + Math.abs(acceleration.z);
      
      if (movement > threshold) {
        setIsShaking(true);
        clearTimeout(shakeTimeout);
        shakeTimeout = setTimeout(() => setIsShaking(false), 5000);
      }
    };

    // Détection de mouvement rapide de souris (desktop)
    const handleMouseMove = (event) => {
      const now = Date.now();
      const timeDiff = now - lastMousePos.current.time;
      
      if (timeDiff > 0) {
        const distanceX = Math.abs(event.clientX - lastMousePos.current.x);
        const distanceY = Math.abs(event.clientY - lastMousePos.current.y);
        const speed = (distanceX + distanceY) / timeDiff;

        if (speed > 3) {
          setIsShaking(true);
          clearTimeout(shakeTimeout);
          shakeTimeout = setTimeout(() => setIsShaking(false), 5000);
        }
      }

      lastMousePos.current = { x: event.clientX, y: event.clientY, time: now };
    };

    // Détection de mouvement rapide tactile (mobile/tablette)
    const handleTouchMove = (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const now = Date.now();
        const timeDiff = now - lastTouch.current.time;
        if (timeDiff > 0) {
          const distanceX = Math.abs(touch.clientX - lastTouch.current.x);
          const distanceY = Math.abs(touch.clientY - lastTouch.current.y);
          const speed = (distanceX + distanceY) / timeDiff;
          if (speed > 2) {
            setIsShaking(true);
            clearTimeout(shakeTimeout);
            shakeTimeout = setTimeout(() => setIsShaking(false), 5000);
          }
        }
        lastTouch.current = { x: touch.clientX, y: touch.clientY, time: now };
      }
    };

    // Reset positions pour ne pas trigger immédiatement
    lastMousePos.current = { x: 0, y: 0, time: Date.now() };
    lastTouch.current = { x: 0, y: 0, time: Date.now() };

    window.addEventListener('devicemotion', handleDeviceMotion);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      clearTimeout(shakeTimeout);
    };
  }, [enabled, threshold]);

  return isShaking;
};
