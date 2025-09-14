import dynamic from 'next/dynamic'
import CameraSetup from '@/components/3d-try-on/camera-setup'

// Dynamically import the SceneContainer to avoid SSR issues with Three.js
const SceneContainer = dynamic(() => import('@/components/3d-try-on/scene-container'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-white">Loading 3D Scene...</div>
    </div>
  ),
})

export default function TryOnPage() {
  return (
    <main className="relative w-full h-screen bg-black">
      <CameraSetup />
      <SceneContainer />
    </main>
  )
}



