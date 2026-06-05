type PencilCursorProps = {
  x: number;
  y: number;
  visible: boolean;
  isDrawingMode: boolean;
  color: string;
};

export default function PencilCursor({
  x,
  y,
  visible,
  isDrawingMode,
  color,
}: PencilCursorProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="pencil-cursor"
      style={{
        "--cursor-x": `${x}px`,
        "--cursor-y": `${y}px`,
        "--cursor-color": color,
      } as React.CSSProperties}
      aria-hidden="true"
      data-drawing={isDrawingMode}
    >
      <span className="pointer-finger" />
      <span className="pointer-thumb" />
      <span className="pointer-palm" />
      <span className="pencil-tip" />
    </div>
  );
}
