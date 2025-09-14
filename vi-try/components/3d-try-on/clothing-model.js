import { useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export default function ClothingModel({ pose }) {
  const group = useRef();
  const [error, setError] = useState(null);

  const { nodes, materials, error: loadError } = useGLTF('/body_mesh/waistcoat.glb', 
    undefined,
    (err) => {
      console.error('Error loading model:', err);
      setError('Failed to load 3D model');
    }
  );

  useFrame(() => {
    if (!pose || !group.current || loadError || !nodes?.Sketchfab_model) return;

    // Adjust scale and position
    const scaleFactor = 0.05; // Further reduce this if needed
    group.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    group.current.position.set(0, 0, -3); // Move it back further if needed

    console.log('Current Scale:', group.current.scale);
    console.log('Current Position:', group.current.position);
  });

  if (loadError) {
    console.error('Model load error:', loadError);
    return null;
  }

  if (!nodes?.Sketchfab_model) {
    console.error('Invalid model structure:', nodes);
    return null;
  }

  return (
    <group ref={group}>
      <primitive object={nodes.Sketchfab_model} />
    </group>
  );
}

// Preload the model
useGLTF.preload('/body_mesh/waistcoat.glb');
