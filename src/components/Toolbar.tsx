type ToolbarProps = {
  cameraActive: boolean;
  isDrawingMode: boolean;
  brushColor: string;
  strokeWidth: number;
  onToggleCamera: () => void;
  onToggleMode: () => void;
  onClear: () => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
};

export default function Toolbar({
  cameraActive,
  isDrawingMode,
  brushColor,
  strokeWidth,
  onToggleCamera,
  onToggleMode,
  onClear,
  onColorChange,
  onStrokeWidthChange,
}: ToolbarProps) {
  return (
    <section className="toolbar" aria-label="Drawing controls">
      <div className="mode-pill" data-mode={isDrawingMode ? "draw" : "move"}>
        <span className="status-dot" />
        {isDrawingMode ? "Drawing Mode" : "Move Mode"}
      </div>

      <button
        aria-pressed={!isDrawingMode}
        className="tool-button primary"
        type="button"
        onClick={onToggleMode}
      >
        {isDrawingMode ? "Move Mode" : "Drawing Mode"}
      </button>

      <button className="tool-button" type="button" onClick={onClear}>
        Clear
      </button>

      <label className="control-field">
        <span>Color</span>
        <input
          aria-label="Brush color"
          type="color"
          value={brushColor}
          onChange={(event) => onColorChange(event.target.value)}
        />
      </label>

      <label className="control-field stroke-control">
        <span>Stroke {strokeWidth}px</span>
        <input
          aria-label="Stroke width"
          type="range"
          min="2"
          max="22"
          value={strokeWidth}
          onChange={(event) => onStrokeWidthChange(Number(event.target.value))}
        />
      </label>

      <button
        aria-pressed={cameraActive}
        className="tool-button danger"
        type="button"
        onClick={onToggleCamera}
      >
        {cameraActive ? "Stop Camera" : "Start Camera"}
      </button>
    </section>
  );
}
