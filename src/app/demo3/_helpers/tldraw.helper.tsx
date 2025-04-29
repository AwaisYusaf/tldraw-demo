import { Editor, TLShapeId, createBindingId, IndexKey } from "tldraw";
import { ContainerShape, ElementShape, LayoutBinding } from "./tldraw.shapes";
import { Group, Wireframe } from "../store/canvasSlice";

const CONTAINER_PADDING = 24;

export function loadElementsOnMount(
  editor: Editor,
  groups: Group[],
  wireframes: Wireframe[]
) {
  editor.getCurrentPageShapeIds().forEach((id) => {
    const shape = editor.getShape(id);
    if (shape && (shape?.type === "container" || shape?.type === "element")) {
      editor.deleteShape(id);
    }
  });

  let prevX = 0;
  wireframes.forEach((wireframe) => {
    const elementId = ("shape:" + wireframe.id) as TLShapeId;
    editor.createShape<ElementShape>({
      id: elementId,
      type: "element",
      x: prevX,
      y: wireframe.position?.y || 100,
      props: {
        wireframeId: wireframe.id,
        title: wireframe.title,
        type: wireframe.type,
        dimensions: wireframe.dimensions,
        _html: wireframe._html,
      },
    });
    prevX += wireframe.dimensions.width + CONTAINER_PADDING;
  });

  (window as any).editor = editor;
}

export function createContainerForElements(
  editor: Editor,
  selectedElements: ElementShape[]
) {
  if (!selectedElements.length) return;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  selectedElements.forEach((element) => {
    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, element.x + element.props.dimensions.width);
    maxY = Math.max(maxY, element.y + element.props.dimensions.height);
  });

  const containerWidth = maxX - minX + CONTAINER_PADDING * 2;
  const containerHeight = maxY - minY + CONTAINER_PADDING * 2;

  const containerId = ("shape:container_" + Date.now()) as TLShapeId;
  const container = editor.createShape<ContainerShape>({
    id: containerId,
    type: "container",
    x: minX - CONTAINER_PADDING,
    y: minY - CONTAINER_PADDING,
    props: {
      width: containerWidth,
      height: containerHeight,
      groupId: "group_" + Date.now(),
      title: "New Group",
    },
  });

  selectedElements.forEach((element, index) => {
    editor.createBinding<LayoutBinding>({
      id: createBindingId(),
      type: "layout",
      fromId: containerId as unknown as TLShapeId,
      toId: element.id as unknown as TLShapeId,
      props: {
        index: `a${index}` as IndexKey,
        placeholder: false,
      },
    });
  });

  editor.sendToBack([containerId]);
  editor.bringToFront(
    selectedElements.map((el) => el.id as unknown as TLShapeId)
  );

  return container;
}
