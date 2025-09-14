import React from 'react';
import { motion } from 'framer-motion';

const DoorHandle = () => {
  return (
    <motion.div
      className="door-handle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        right: 0,
        top: '50%',
        width: '40px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.4)',
        borderTopLeftRadius: '10px',
        borderBottomLeftRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div
        style={{
          width: '10px',
          height: '50px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '5px'
        }}
      />
    </motion.div>
  );
};

export default DoorHandle;
