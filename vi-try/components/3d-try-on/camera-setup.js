import { useEffect, useRef, useState } from 'react'
import PoseVisualization from './pose-visualization'
import { usePoseDetection } from '@/hooks/use-pose-detection'

export default function CameraSetup() {
  const videoRef = useRef(null)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const pose = usePoseDetection(videoRef.current) // Add pose detection

  useEffect(() => {
    async function setupCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        setCameras(videoDevices)

        if (videoDevices.length > 0) {
          const frontCamera = videoDevices.find(device => 
            device.label.toLowerCase().includes('front') ||
            device.label.toLowerCase().includes('user')
          )
          const defaultCamera = frontCamera || videoDevices[0]
          setSelectedCamera(defaultCamera.deviceId)
          await startCamera(defaultCamera.deviceId)
        }
      } catch (error) {
        console.error('Error accessing cameras:', error)
      }
    }

    setupCameras()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  async function startCamera(deviceId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error starting camera:', error)
    }
  }

  async function handleCameraSwitch(e) {
    const newDeviceId = e.target.value
    setSelectedCamera(newDeviceId)
    await startCamera(newDeviceId)
  }

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover mirror"
      />
      <PoseVisualization videoRef={videoRef} pose={pose} />

      {cameras.length > 1 && (
        <div className="absolute top-4 right-4 z-20">
          <select
            value={selectedCamera}
            onChange={handleCameraSwitch}
            className="bg-white/10 backdrop-blur-sm text-white rounded-lg px-4 py-2 border border-white/20"
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${cameras.indexOf(camera) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  )
}