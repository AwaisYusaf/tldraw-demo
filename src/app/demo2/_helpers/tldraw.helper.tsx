import { Editor, TLShapeId, createBindingId, IndexKey } from "tldraw";
import { TWireframe } from "../_constants/types";
import { getWireframe, PAGE_GROUPS } from "../_constants/wireframes.constant";
import { ContainerShape, ElementShape, LayoutBinding } from "./tldraw.shapes";

const CONTAINER_PADDING = 24;

export function loadElementsOnMount(editor: Editor) {
  PAGE_GROUPS.forEach((group) => {
    const groupWireframes = group.wireframeIds
      .map((id) => getWireframe(id))
      .filter((w): w is TWireframe => w !== undefined);

    const containerWidth =
      CONTAINER_PADDING + // Initial padding
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

    // Create elements for each wireframe in this group
    groupWireframes.forEach((wireframe, index) => {
      // Create the element shape

      const elementId = ("shape:" + wireframe.id) as TLShapeId;
      console.log("ElementId:", elementId);
      const element = editor.createShape<ElementShape>({
        id: elementId,
        type: "element",
        x:
          group.position.x +
          CONTAINER_PADDING +
          index * (wireframe.dimensions.width + CONTAINER_PADDING),
        y: group.position.y + CONTAINER_PADDING,
        props: {
          wireframeId: wireframe.id,
          title: wireframe.title,
          type: wireframe.type,
          dimensions: wireframe.dimensions,
          _html: wireframe._html,
        },
      });

      // Create binding between container and element
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
