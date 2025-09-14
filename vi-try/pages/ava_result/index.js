import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import MagneticButton from '@/components/MagneticButton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';

const AvaResult = () => {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState('100 cm');
  const [selectedColor, setSelectedColor] = useState('beige');

  const colors = ['beige', 'gray', 'cyan', 'pink', 'yellow'];
  const sizes = ['90 cm', '100 cm', '110 cm', '120 cm', '130 cm', '140 cm', '150 cm', '160 cm'];

  const mountRef = useRef(null);

  const handleonclick=()=>{
    router.push('/try-on');
  }

  useEffect(() => {
    // Three.js code
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Set background to white
  
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
  
    renderer.setSize(500, 500);
    
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }
  
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
  
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
  
    // Load 3D object
    const loader = new OBJLoader();
    let object;  // Reference for rotation
  
    loader.load(
      '/body_mesh/TROOPER.obj',
      (obj) => {
        object = obj;
        const material = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, flatShading: true });
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = material;
          }
        });
   
        object.position.set(0, -7, 0); 
        object.scale.set(1.5, 1.5, 1.5);
  
        scene.add(object);
      },
      (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
      (error) => console.error('Error loading 3D object:', error)
    );
  
    // Move camera further to zoom out
    camera.position.z = 12; // Further zoom out
  
    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
  
    // Animate function to rotate the object
    const animate = () => {
      requestAnimationFrame(animate);
      if (object) {
        object.rotation.y += 0.01; // Rotate the object on Y-axis
      }
      controls.update();
      renderer.render(scene, camera);
    };
  
    animate();
  
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement); // Ensure mountRef.current exists
      }
    };
  }, []);
  

  return (
    <div>
      <Navbar />
      <div className="flex flex-col md:flex-row p-4 bg-white w-full h-full">
        <div className="flex flex-col md:flex-row w-full">
          <div className="flex md:flex-col order-2 md:order-1 mb-4 md:mb-0 md:mr-4 overflow-x-auto md:overflow-x-visible p-3 md:justify-center">
            {[1, 2, 3, 4].map((i) => (
              <Image
                key={i}
                src={`/Result${i}.jpeg`}
                alt={`Thumbnail ${i}`}
                width={112}
                height={50}
                className="md:w-24 md:h-20 object-contain cursor-pointer rounded-3xl mr-2 md:mr-0 md:mb-2 flex-shrink-0 border-b-2 border-black"
              />
            ))}
          </div>
          <div className="order-1 md:order-2 flex-grow relative">
            <div ref={mountRef} className="w-full h-auto aspect-square rounded-xl" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#e0d5c0] to-transparent p-2 rounded-b-xl">
              <div className="flex justify-center p-2 gap-4 items-center">
                {/* SVG icons here */}
              </div>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 pl-4">
          <h1 className="text-2xl font-bold mb-2 text-black">Beige woven twill trousers</h1>
          <div className="flex items-center mb-4">
            <span className="text-lg font-semibold mr-2 text-black">$58.00</span>
            <span className="text-sm line-through text-gray-500">$89.00</span>
          </div>
          {/* Color selection */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2 text-black">Color</h2>
            <div className="flex space-x-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full ${color === selectedColor ? 'ring-2 ring-black' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
          {/* Size selection */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2 text-black">Size</h2>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`px-3 py-1 border rounded ${size === selectedSize ? 'bg-black text-white' : 'bg-white text-black'}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex space-x-2 mb-4">
            <MagneticButton children={"Virtual Try ON"} onClick={handleonclick}/>
            <button className="border border-black px-4 py-2 rounded flex items-center justify-center">
              <Heart className="h-4 w-4" stroke="black" />
            </button>
          </div>
          {/* Recommendations */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-black">Best mix style with</h2>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <Image
                    src="/pajama.png"
                    alt={`Recommendation ${i}`}
                    width={100}
                    height={150}
                    className="w-full h-auto mb-1"
                  />
                  <p className="text-sm text-black">Item {i}</p>
                  <p className="text-sm font-semibold text-black">$29.99</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default AvaResult;
