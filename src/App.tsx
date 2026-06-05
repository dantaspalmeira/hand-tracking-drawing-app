import { useState } from "react";
import CameraCanvas from "./components/CameraCanvas";
import Toolbar from "./components/Toolbar";

export default function App() {
  const [cameraActive, setCameraActive] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(true);
  const [brushColor, setBrushColor] = useState("#a6ff3d");
  const [strokeWidth, setStrokeWidth] = useState(12);
  const [clearSignal, setClearSignal] = useState(0);

  return (
    <main className="app-shell">
      <CameraCanvas
        cameraActive={cameraActive}
        isDrawingMode={isDrawingMode}
        brushColor={brushColor}
        strokeWidth={strokeWidth}
        clearSignal={clearSignal}
      />

      <Toolbar
        cameraActive={cameraActive}
        isDrawingMode={isDrawingMode}
        brushColor={brushColor}
        strokeWidth={strokeWidth}
        onToggleCamera={() => setCameraActive((current) => !current)}
        onToggleMode={() => setIsDrawingMode((current) => !current)}
        onClear={() => setClearSignal((current) => current + 1)}
        onColorChange={setBrushColor}
        onStrokeWidthChange={setStrokeWidth}
      />
    </main>
  );
}
