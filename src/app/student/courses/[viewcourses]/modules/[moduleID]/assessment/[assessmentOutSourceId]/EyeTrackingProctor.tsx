import { useEffect, useRef, useState } from 'react';

interface EyeTrackingProctorProps {
  assessmentSubmitId: string | number;
  updateViolationCount: () => void;
}

interface EyeTrackingResult {
  direction: string;
  error?: string;
}

const EyeTrackingProctor: React.FC<EyeTrackingProctorProps> = ({ assessmentSubmitId, updateViolationCount }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lastDirection, setLastDirection] = useState<string>("Looking Center");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EyeTrackingResult | null>(null);

  useEffect(() => {
    // Initialize camera stream
    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing the camera: ", err);
      }
    };

    initializeCamera();

    // Cleanup function
    return () => {
      if (videoRef.current?.srcObject instanceof MediaStream) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const captureAndSend = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      setIsLoading(true);
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const dataURL = canvasRef.current.toDataURL('image/jpeg');
      const blob = dataURL.split(',')[1];
      const imgBlob = atob(blob);
      const arrayBuffer = new ArrayBuffer(imgBlob.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < imgBlob.length; i++) {
        uint8Array[i] = imgBlob.charCodeAt(i);
      }
      
      const file = new Blob([arrayBuffer], { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file, 'frame.jpg');

      try {
        const response = await fetch('https://eco-cat-305108.el.r.appspot.com/detect-eyeballs', {
          method: 'POST',
          body: formData
        });
        const data: EyeTrackingResult = await response.json();
        setResult(data);
        setIsLoading(false);
        console.log('data:', data);

        // Check for direction change and play audio feedback
        if (data.direction !== lastDirection) {
          playAudioFeedback(data.direction);
          setLastDirection(data.direction);
          
          // Update violation count if looking away
          if (data.direction !== "Looking Center" && assessmentSubmitId) {
            updateViolationCount();
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
        setResult({ direction: '', error: error instanceof Error ? error.message : 'Unknown error' });
      }
    };

    const intervalId = setInterval(captureAndSend, 1000);
    return () => clearInterval(intervalId);
  }, [lastDirection, assessmentSubmitId, updateViolationCount]);

  const playAudioFeedback = (direction: string) => {
    const audio = new SpeechSynthesisUtterance(direction);
    window.speechSynthesis.speak(audio);
  };

  return (
    <div className="fixed top-0 right-0 p-4 bg-black/10 rounded-lg">
      <video
        ref={videoRef}
        className="w-32 h-24 rounded-lg"
        autoPlay
        muted
        playsInline
        draggable
      />
      <canvas 
        ref={canvasRef}
        width="480"
        height="360"
        className="hidden"
      />
      {/* {isLoading && (
        <p className="text-red-500 text-sm mt-2">Processing...</p>
      )} */}
      {result && !result.error && (
        <p className="text-sm mt-2">
          Status: {result.direction}
        </p>
      )}
      {result?.error && (
        <p className="text-red-500 text-sm mt-2">
          Error: {result.error}
        </p>
      )}
    </div>
  );
};

export default EyeTrackingProctor;