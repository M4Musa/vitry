// hooks/use-pose-detection.js
import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

export function usePoseDetection(videoElement) {
  const [detector, setDetector] = useState(null);
  const [pose, setPose] = useState(null);

  // Initialize TensorFlow and MoveNet detector
  useEffect(() => {
    let mounted = true;

    async function initDetector() {
      try {
        await tf.ready();
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
          enableSmoothing: true
        };
        const detector = await poseDetection.createDetector(model, detectorConfig);
        
        if (mounted) {
          setDetector(detector);
        }
      } catch (error) {
        console.error('Error initializing pose detector:', error);
      }
    }

    initDetector();

    return () => {
      mounted = false;
    };
  }, []);

  // Run pose detection
  useEffect(() => {
    if (!detector || !videoElement) return;

    let frameId;
    let mounted = true;

    async function detectPose() {
      try {
        if (videoElement.readyState === 4) {
          const poses = await detector.estimatePoses(videoElement, {
            flipHorizontal: true // Mirror the pose detection
          });
          
          if (mounted && poses.length > 0) {
            setPose(poses[0]);
          }
        }
      } catch (error) {
        console.error('Error detecting pose:', error);
      }
      frameId = requestAnimationFrame(detectPose);
    }

    detectPose();

    return () => {
      mounted = false;
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [detector, videoElement]);

  return pose;
}