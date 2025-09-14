// components/3d-try-on/scene-container.js
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls } from '@react-three/drei';
import ClothingModel from './clothing-model';

export default function SceneContainer({ pose }) {
  return (
    <div className="absolute inset-0 z-10">
      <Canvas
        camera={{
          position: [0, 0, 10],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        {/* <Suspense fallback={null}>
          <ClothingModel pose={pose} />
        </Suspense> */}

        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}