import { useRef } from "react";

export default function WireframeShape({ data }: { data: any }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { wireframe } = data;

  const mobileView = false;

  const handleIframeLoad = () => {
    const iframeElement = iframeRef.current;
    if (!iframeElement) return;
    const iframeContentWindow = iframeElement.contentWindow;

    try {
      const body = iframeContentWindow?.document.body;
      const htmlElement = iframeContentWindow?.document.documentElement;
      const contentHeight = Math.max(
        body?.scrollHeight || 0,
        body?.offsetHeight || 0,
        htmlElement?.clientHeight || 0,
        htmlElement?.scrollHeight || 0,
        htmlElement?.offsetHeight || 0
      );

      const minHeight = mobileView ? 844 : 1024;
      const finalHeight = Math.max(contentHeight, minHeight);
    } catch (error) {
      console.warn(
        "Error accessing iframe content or adding event listeners:",
        error
      );
    }
  };

  return (
    <div
      style={{
        width: data.dimensions.width,
        height: data.dimensions.height,
      }}
      className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-200"
    >
      <div className="flex flex-col items-center relative">
        <div>
          <h2>{data.title}</h2>
        </div>

        {wireframe && (
          <iframe
            title={`wireframe-${data.title}`}
            srcDoc={wireframe}
            frameBorder="0"
            ref={iframeRef}
            onLoad={handleIframeLoad}
            className="overflow-hidden"
            style={{
              height: data.dimensions.height,
              width: data.dimensions.width,
              overflow: "hidden",
              zIndex: 10,
            }}
          />
        )}

        <div
          className="absolute inset-0 z-20"
          style={{
            width: data.dimensions.width,
            height: data.dimensions.height,
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      </div>
    </div>
  );
}
