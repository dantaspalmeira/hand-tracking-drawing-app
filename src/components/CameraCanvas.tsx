import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { useCallback, useEffect, useRef, useState } from "react";
import PencilCursor from "./PencilCursor";
import useHandTracking, { type HandTrackingResults, type Point2D } from "../hooks/useHandTracking";

type CameraCanvasProps = {
  cameraActive: boolean;
  isDrawingMode: boolean;
  brushColor: string;
  strokeWidth: number;
  clearSignal: number;
  onStartCamera: () => void;
};

const INDEX_FINGER_TIP = 8;

export default function CameraCanvas({
  cameraActive,
  isDrawingMode,
  brushColor,
  strokeWidth,
  clearSignal,
  onStartCamera,
}: CameraCanvasProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointRef = useRef<Point2D | null>(null);
  const modeRef = useRef(isDrawingMode);
  const brushRef = useRef({ color: brushColor, width: strokeWidth });
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });

  const resizeCanvases = useCallback(() => {
    const stage = stageRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (!stage || !drawingCanvas || !overlayCanvas) {
      return;
    }

    const rect = stage.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    for (const canvas of [drawingCanvas, overlayCanvas]) {
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const context = canvas.getContext("2d");
      context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
  }, []);

  useEffect(() => {
    modeRef.current = isDrawingMode;
    if (!isDrawingMode) {
      lastPointRef.current = null;
    }
  }, [isDrawingMode]);

  useEffect(() => {
    brushRef.current = { color: brushColor, width: strokeWidth };
  }, [brushColor, strokeWidth]);

  useEffect(() => {
    resizeCanvases();
    window.addEventListener("resize", resizeCanvases);
    return () => window.removeEventListener("resize", resizeCanvases);
  }, [resizeCanvases]);

  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    lastPointRef.current = null;
  }, [clearSignal]);

  const drawHandOverlay = useCallback((results: HandTrackingResults, point: Point2D | null) => {
    const canvas = overlayCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    context.clearRect(0, 0, width, height);

    const landmarks = results.multiHandLandmarks?.[0];
    if (!landmarks) {
      setCursor((current) => ({ ...current, visible: false }));
      lastPointRef.current = null;
      return;
    }

    context.lineWidth = 2;
    context.strokeStyle = "rgba(166, 255, 61, 0.52)";
    context.shadowBlur = 10;
    context.shadowColor = "rgba(166, 255, 61, 0.48)";

    for (const [startIndex, endIndex] of HAND_CONNECTIONS) {
      const start = landmarks[startIndex];
      const end = landmarks[endIndex];
      context.beginPath();
      context.moveTo(width - start.x * width, start.y * height);
      context.lineTo(width - end.x * width, end.y * height);
      context.stroke();
    }

    context.shadowBlur = 0;
    for (const landmark of landmarks) {
      context.beginPath();
      context.fillStyle = "rgba(28, 33, 20, 0.68)";
      context.arc(width - landmark.x * width, landmark.y * height, 4.5, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.fillStyle = "#a6ff3d";
      context.arc(width - landmark.x * width, landmark.y * height, 2.5, 0, Math.PI * 2);
      context.fill();
    }

    if (point) {
      setCursor({ x: point.x, y: point.y, visible: true });
    }
  }, []);

  const drawStroke = useCallback((point: Point2D | null) => {
    const canvas = drawingCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !point || !modeRef.current) {
      lastPointRef.current = point;
      return;
    }

    const previous = lastPointRef.current;
    const { color, width } = brushRef.current;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = width;
    context.shadowColor = color;
    context.shadowBlur = 22;

    if (previous) {
      const midpoint = {
        x: (previous.x + point.x) / 2,
        y: (previous.y + point.y) / 2,
      };

      context.beginPath();
      context.moveTo(previous.x, previous.y);
      context.quadraticCurveTo(previous.x, previous.y, midpoint.x, midpoint.y);
      context.stroke();
    }

    lastPointRef.current = point;
  }, []);

  const handleResults = useCallback(
    (results: HandTrackingResults) => {
      const canvas = overlayCanvasRef.current;
      const landmarks = results.multiHandLandmarks?.[0];
      const indexTip = landmarks?.[INDEX_FINGER_TIP];
      const point =
        canvas && indexTip
          ? {
              x: canvas.clientWidth - indexTip.x * canvas.clientWidth,
              y: indexTip.y * canvas.clientHeight,
            }
          : null;

      drawHandOverlay(results, point);
      drawStroke(point);
    },
    [drawHandOverlay, drawStroke],
  );

  const { error, loading } = useHandTracking({
    videoRef,
    active: cameraActive,
    onResults: handleResults,
  });

  useEffect(() => {
    if (!cameraActive) {
      setCursor((current) => ({ ...current, visible: false }));
      lastPointRef.current = null;
      overlayCanvasRef.current
        ?.getContext("2d")
        ?.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
    }
  }, [cameraActive]);

  return (
    <section className="camera-stage" ref={stageRef} aria-label="Camera drawing area">
      <video ref={videoRef} className="camera-video" playsInline muted />
      <canvas ref={drawingCanvasRef} className="drawing-canvas" />
      <canvas ref={overlayCanvasRef} className="tracking-canvas" />

      <PencilCursor
        x={cursor.x}
        y={cursor.y}
        visible={cursor.visible && cameraActive}
        isDrawingMode={isDrawingMode}
        color={brushColor}
      />

      <div className="app-window-bar">
        <span className="window-dot red" />
        <span className="window-dot yellow" />
        <span className="window-dot green" />
        <strong>Hand Index Tracker</strong>
        <span className="window-status">
          <span className={cameraActive ? "live-dot" : "live-dot off"} />
          {cameraActive ? "Live" : "Ready"}
        </span>
      </div>

      {(loading || error || !cameraActive) && (
        <div className="camera-message" role="status" aria-live="polite">
          <strong>{error ? "Camera unavailable" : cameraActive ? "Starting camera" : "Camera ready"}</strong>
          <span>
            {error ||
              (cameraActive
                ? "Allow camera permission to start hand tracking."
                : "Click Start Camera and allow browser permission to begin tracking.")}
          </span>
          {(!cameraActive || error) && (
            <button className="message-action" type="button" onClick={onStartCamera}>
              {error ? "Try Again" : "Start Camera"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
