// Hook personnalisé pour détecter les secousses et mouvements rapides
import { useEffect, useState } from 'react';

export const useShakeDetection = (threshold = 20) => {
  const [isShaking, setIsShaking] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0, time: Date.now() });

  useEffect(() => {
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
      const timeDiff = now - lastMousePos.time;
      
      if (timeDiff > 0) {
        const distanceX = Math.abs(event.clientX - lastMousePos.x);
        const distanceY = Math.abs(event.clientY - lastMousePos.y);
        const speed = (distanceX + distanceY) / timeDiff;

        // Si la souris bouge très vite (speed > 3 pixels/ms)
        if (speed > 3) {
          setIsShaking(true);
          clearTimeout(shakeTimeout);
          shakeTimeout = setTimeout(() => setIsShaking(false), 5000);
        }
      }

      setLastMousePos({ x: event.clientX, y: event.clientY, time: now });
    };

    // Détection de mouvement rapide tactile (mobile/tablette)
    let lastTouch = { x: 0, y: 0, time: Date.now() };
    const handleTouchMove = (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const now = Date.now();
        const timeDiff = now - lastTouch.time;
        if (timeDiff > 0) {
          const distanceX = Math.abs(touch.clientX - lastTouch.x);
          const distanceY = Math.abs(touch.clientY - lastTouch.y);
          const speed = (distanceX + distanceY) / timeDiff;
          // Seuil un peu plus bas pour le tactile (2 px/ms)
          if (speed > 2) {
            setIsShaking(true);
            clearTimeout(shakeTimeout);
            shakeTimeout = setTimeout(() => setIsShaking(false), 5000);
          }
        }
        lastTouch = { x: touch.clientX, y: touch.clientY, time: now };
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      clearTimeout(shakeTimeout);
    };
  }, [lastMousePos, threshold]);

  return isShaking;
};
