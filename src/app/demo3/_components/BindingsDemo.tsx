"use client";
import { Editor, TLComponents, Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import WireframeContextToolbar from "./WireframeContextToolbar";
import { CustomContextMenu } from "./CustomContextMenu";
import { loadElementsOnMount } from "@/app/demo3/_helpers/tldraw.helper";
import {
  ContainerShape,
  ContainerShapeUtil,
  ElementShape,
  ElementShapeUtil,
  LayoutBindingUtil,
} from "@/app/demo2/_helpers/tldraw.shapes";
import { useDispatch, useSelector } from "react-redux";
import {
  selectGroups,
  selectWireframes,
  updateWireframeContainer,
  updateWireframePosition,
} from "@/app/demo2/store/canvasSlice";

function TldrawWithRedux() {
  const dispatch = useDispatch();
  const groups = useSelector(selectGroups);

  const wireframes = useSelector(selectWireframes);

  const handleMount = (editor: Editor) => {
    if (!editor) return;
    loadElementsOnMount(editor, groups, wireframes);

    editor.on("event", (e) => {
      if (e.name === "pointer_up") {
        const point = editor.inputs.currentPagePoint;
        const shape = editor.getShapeAtPoint(point);

        if (shape) {
          if (shape.type === "element") {
            const elementShape = shape as ElementShape;
            console.log("Element position updated...");
            dispatch(
              updateWireframePosition({
                wireframeId: elementShape.props.wireframeId,
                position: { x: elementShape.x, y: elementShape.y },
              })
            );

            const binding = editor.getBindingsToShape(shape.id, "layout")[0];
            if (binding) {
              const container = editor.getShape(binding.fromId);
              if (container?.type === "container") {
                const containerShape = container as ContainerShape;

                const currentGroup = groups.find((group) =>
                  group.wireframeIds.includes(elementShape.props.wireframeId)
                );

                if (currentGroup?.id !== containerShape.props.groupId) {
                  console.log("Group changed...");
                  dispatch(
                    updateWireframeContainer({
                      wireframeId: elementShape.props.wireframeId,
                      oldGroupId: currentGroup?.id,
                      newGroupId: containerShape.props.groupId,
                    })
                  );
                }
              }
            }
          }
        }
      }
    });
  };

  const components: TLComponents = {
    InFrontOfTheCanvas: WireframeContextToolbar,
    ContextMenu: CustomContextMenu,
  };

  return (
    <Tldraw
      hideUi
      onMount={handleMount}
      shapeUtils={[ContainerShapeUtil, ElementShapeUtil]}
      bindingUtils={[LayoutBindingUtil]}
      components={components}
      options={{}}
    />
  );
}

export default function BindingsDemo() {
  return (
    <div className="fixed inset-0 w-full h-full z-50">
      <TldrawWithRedux />
    </div>
  );
}
