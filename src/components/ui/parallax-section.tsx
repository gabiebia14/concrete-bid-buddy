
import React, { useEffect, useRef } from 'react';

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({ 
  children, 
  speed = 0.3 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const scrolled = window.pageYOffset;
      const parallax = scrolled * speed;

      ref.current.style.transform = `translateY(${parallax}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className="will-change-transform">
      {children}
    </div>
  );
};
