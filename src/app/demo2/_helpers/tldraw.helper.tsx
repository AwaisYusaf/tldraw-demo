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

  groups.forEach((group) => {
    const groupWireframes = group.wireframeIds
      .map((id) => wireframes.find((w) => w.id === id))
      .filter((w): w is Wireframe => w !== undefined);

    const containerWidth =
      CONTAINER_PADDING +
      groupWireframes.reduce((acc, wireframe) => {
        return acc + wireframe.dimensions.width + CONTAINER_PADDING;
      }, 0);

    const maxHeight = Math.max(
      ...groupWireframes.map((w) => w.dimensions.height)
    );
    const containerHeight = maxHeight + CONTAINER_PADDING * 2;

    const containerId = ("shape:" + group.id) as TLShapeId;
    const container = editor.createShape<ContainerShape>({
      id: containerId,
      type: "container",
      x: group.position.x,
      y: group.position.y,
      props: {
        width: containerWidth,
        height: containerHeight,
        groupId: group.id,
        title: group.title,
      },
    });

    groupWireframes.forEach((wireframe, index) => {
      const offsetX = index * wireframe.dimensions.width + CONTAINER_PADDING;

      const elementId = ("shape:" + wireframe.id) as TLShapeId;
      const element = editor.createShape<ElementShape>({
        id: elementId,
        type: "element",
        x: offsetX,
        // group.position.x +
        // CONTAINER_PADDING +
        // index * (wireframe.dimensions.width + CONTAINER_PADDING),
        y: group.position.y + CONTAINER_PADDING,
        props: {
          wireframeId: wireframe.id,
          title: wireframe.title,
          type: wireframe.type,
          dimensions: wireframe.dimensions,
          _html: wireframe._html,
        },
      });

      editor.createBinding<LayoutBinding>({
        id: createBindingId(),
        type: "layout",
        fromId: containerId as unknown as TLShapeId,
        toId: elementId as unknown as TLShapeId,
        props: {
          index: `a${index}` as IndexKey,
          placeholder: false,
        },
      });
    });
  });

  (window as any).editor = editor;
}
