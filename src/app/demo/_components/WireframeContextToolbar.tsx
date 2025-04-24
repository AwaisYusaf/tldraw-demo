import { File } from "lucide-react";
import { track, useEditor } from "tldraw";
import "tldraw/tldraw.css";
import WireframeDropdown from "./WireframeDropdown";

const WireframeContextToolbar = track(() => {
  const editor = useEditor();
  const showToolbar =
    editor.isIn("select.idle") || editor.getSelectedShapeIds().length > 0;
  if (!showToolbar) return null;
  const selectionRotatedPageBounds = editor.getSelectionRotatedPageBounds();
  if (!selectionRotatedPageBounds) return null;

  const pageCoordinates = editor.pageToViewport(
    selectionRotatedPageBounds.point
  );

  return (
    <div
      style={{
        position: "absolute",
        pointerEvents: "all",
        top: pageCoordinates.y - 42,
        left: pageCoordinates.x,
        width: 1024 * editor.getZoomLevel(),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: "flex",
          background: "var(--color-panel)",
          width: "100%",
          alignItems: "center",
        }}
        className="ring-2 ring-gray-200 ring-offset-2 rounded"
      >
        <header className="bg-white px-3 rounded flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {editor.getZoomLevel() > 0.4 && (
              <File className="size-4 text-gray-600" />
            )}
            <h2>Screen 1</h2>
          </div>
          <WireframeDropdown />
        </header>
      </div>
    </div>
  );
});

export default WireframeContextToolbar;
