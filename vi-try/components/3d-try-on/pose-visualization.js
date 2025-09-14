import { useEffect, useRef } from 'react';

const POSE_CONNECTIONS = [
  ['left_ear', 'left_eye'], ['right_ear', 'right_eye'],
  ['left_eye', 'nose'], ['right_eye', 'nose'],
  ['nose', 'left_shoulder'], ['nose', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'], ['right_shoulder', 'right_elbow'],
  ['left_elbow', 'left_wrist'], ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
  ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle']
];

export default function PoseVisualization({ videoRef, pose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');

    function updateCanvasSize() {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
    }

    function drawPose() {
      if (!pose) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Scale factors to match video display size
      const scaleX = canvas.width / video.videoWidth;
      const scaleY = canvas.height / video.videoHeight;

      // Draw keypoints
      pose.keypoints.forEach((keypoint) => {
        if (keypoint.score > 0.3) {
          // Flip the x coordinate for mirroring effect
          const x = (video.videoWidth - keypoint.x) * scaleX;
          const y = keypoint.y * scaleY;

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#00ff00';
          ctx.fill();
        }
      });

      // Draw connections
      POSE_CONNECTIONS.forEach(([startPoint, endPoint]) => {
        const start = pose.keypoints.find(kp => kp.name === startPoint);
        const end = pose.keypoints.find(kp => kp.name === endPoint);

        if (start && end && start.score > 0.3 && end.score > 0.3) {
          const startX = (video.videoWidth - start.x) * scaleX;
          const startY = start.y * scaleY;
          const endX = (video.videoWidth - end.x) * scaleX;
          const endY = end.y * scaleY;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#00ff00';
          ctx.stroke();
        }
      });

      requestAnimationFrame(drawPose);
    }

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    const animationFrame = requestAnimationFrame(drawPose);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrame);
    };
  }, [videoRef, pose]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none"
    />
  );
}
