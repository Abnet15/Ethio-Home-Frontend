/* WOW UPGRADE: Custom cursor with trailing particles (desktop only) */
import { useEffect, useState } from 'react';

const CustomCursor = () => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [trails, setTrails] = useState([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const trailLength = 8; // Move outside useEffect so it's accessible in JSX

  useEffect(() => {
    // Only enable on desktop with fine pointer
    const isDesktopDevice = window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;
    setIsDesktop(isDesktopDevice);

    if (!isDesktopDevice) return;

    let animationFrameId;

    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      
      // Create trail particles
      setTrails((prev) => {
        const newTrails = [
          { x: e.clientX, y: e.clientY, id: Date.now() },
          ...prev.slice(0, trailLength - 1),
        ];
        return newTrails;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div
        className="cursor-dot"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* Trail particles */}
      {trails.map((trail, index) => (
        <div
          key={trail.id || index}
          className="cursor-trail"
          style={{
            left: `${trail.x}px`,
            top: `${trail.y}px`,
            transform: 'translate(-50%, -50%)',
            opacity: (trailLength - index) / trailLength * 0.4,
            width: `${4 + index * 0.5}px`,
            height: `${4 + index * 0.5}px`,
          }}
        />
      ))}
    </>
  );
};

export default CustomCursor;
