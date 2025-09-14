import React, { useRef, useEffect } from 'react';
import styles from './MagneticButton.module.css'; // Default CSS for magnetic effect

const MagneticButton = ({ children, onClick, color, width, customStyle, customClass }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;

    const moveButton = (e) => {
      const { left, top, width, height } = button.getBoundingClientRect();
      const x = e.clientX - (left + width / 2);
      const y = e.clientY - (top + height / 2);
      button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    };

    const resetButton = () => {
      button.style.transform = 'translate(0px, 0px)';
    };

    button.addEventListener('mousemove', moveButton);
    button.addEventListener('mouseleave', resetButton);

    return () => {
      button.removeEventListener('mousemove', moveButton);
      button.removeEventListener('mouseleave', resetButton);
    };
  }, []);
  const buttonClass = customClass ? customClass : styles.magneticButton;
  return (
    <button
      style={{ background: color, width: width }}
      ref={buttonRef}
      className={buttonClass}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default MagneticButton;