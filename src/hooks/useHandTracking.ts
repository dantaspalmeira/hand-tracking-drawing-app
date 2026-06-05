import { Hands, type Results } from "@mediapipe/hands";
import { type RefObject, useEffect, useRef, useState } from "react";

export type Point2D = {
  x: number;
  y: number;
};

export type HandTrackingResults = Results;

const mediapipeBaseUrl = `${import.meta.env.BASE_URL}mediapipe/hands/`;

type UseHandTrackingOptions = {
  videoRef: RefObject<HTMLVideoElement | null>;
  active: boolean;
  onResults: (results: HandTrackingResults) => void;
};

export default function useHandTracking({
  videoRef,
  active,
  onResults,
}: UseHandTrackingOptions) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const frameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const onResultsRef = useRef(onResults);

  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  useEffect(() => {
    let cancelled = false;

    const stopCamera = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const start = async () => {
      if (!active) {
        stopCamera();
        setLoading(false);
        setError("");
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This browser does not support camera access.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const video = videoRef.current;
        if (!video) {
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();

        const hands = new Hands({
          locateFile: (file) => `${mediapipeBaseUrl}${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.65,
        });

        hands.onResults((results) => onResultsRef.current(results));
        handsRef.current = hands;

        const detect = async () => {
          if (cancelled || !handsRef.current || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            frameRef.current = requestAnimationFrame(detect);
            return;
          }

          await handsRef.current.send({ image: video });
          frameRef.current = requestAnimationFrame(detect);
        };

        frameRef.current = requestAnimationFrame(detect);
        setLoading(false);
      } catch (cameraError) {
        const message =
          cameraError instanceof DOMException && cameraError.name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access in the browser and reload."
            : "Could not start the camera. Check if another app is using it or if the device has a webcam.";

        setError(message);
        setLoading(false);
        stopCamera();
      }
    };

    void start();

    return () => {
      cancelled = true;
      handsRef.current?.close();
      handsRef.current = null;
      stopCamera();
    };
  }, [active, videoRef]);

  return { error, loading };
}
