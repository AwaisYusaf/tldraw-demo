import React, { useEffect, useRef } from "react";
import { Box, TLShape, TLShapeId, useEditor, createShapeId } from "tldraw";
import { Button } from "@/components/ui/button";

type Props = {};

function GroupAllWireframes({}: Props) {
  const editor = useEditor();
  const prevBoundsRef = useRef<Box | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = editor.store.listen((change) => {
      if (change.source === "user") {
        const groupId = editor.getFocusedGroupId();

        if (groupId) {
          const groupShape = editor.getShape(groupId);

          //   if (groupShape) {
          //     const backgroundShape = editor
          //       .getCurrentPageShapes()
          //       .filter((shape) => shape.type == "geo");
          //     if (backgroundShape && backgroundShape.length > 0) {
          //       const bounds = editor.getShapePageBounds(groupShape.id);

          //       if (bounds) {
          //         const prev = prevBoundsRef.current;
          //         if (
          //           !prev ||
          //           bounds.x !== prev.x ||
          //           bounds.y !== prev.y ||
          //           bounds.w !== prev.w ||
          //           bounds.h !== prev.h
          //         ) {
          //           editor.updateShape({
          //             id: backgroundShape[0].id,
          //             type: "geo",
          //             x: bounds.x,
          //             y: bounds.y,
          //             props: {
          //               ...backgroundShape[0].props,
          //               w: bounds.width,
          //               h: bounds.height,
          //             },
          //           });
          //           prevBoundsRef.current = bounds;
          //         }
          //       }
          //     }
          //   }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  function groupAllWireframes() {
    const shapeIds = editor.getCurrentPageShapeIds();

    const shapes = Array.from(shapeIds)
      .map((id) => editor.getShape(id as TLShapeId))
      .filter(Boolean) as TLShape[];

    if (shapes.length > 0) {
      const groupId = createShapeId();

      editor.groupShapes(shapes, {
        groupId: groupId,
        select: true,
      });

      const groupShape = editor.getShape(groupId);

      if (groupShape) {
        const groupBounds = editor.getShapePageBounds(groupShape.id);

        if (groupBounds) {
          const backgroundId = createShapeId();
          editor.createShape({
            id: backgroundId,
            type: "geo",
            x: groupBounds.x - 10,
            y: groupBounds.y - 10,
            rotation: 0,
            isLocked: false,
            opacity: 1,
            props: {
              geo: "rectangle",
              w: groupBounds.width + 20,
              h: groupBounds.height + 20,
              fill: "solid",
              color: "light-blue",
            },
          });

          const backgroundShape = editor.getShape(backgroundId);
          if (backgroundShape) {
            editor.sendToBack([backgroundId]);
            editor.ungroupShapes([groupShape.id]);
            editor.groupShapes([backgroundShape, ...shapes], {
              select: true,
            });
          }
        }
      }
    }
  }

  return (
    <div className=" relative w-full">
      <div
        className="absolute top-6 left-[50%] w-full h-full  z-50"
        style={{ zIndex: 1000 }}
      >
        <Button
          onClick={groupAllWireframes}
          className="bg-indigo-800 text-white"
        >
          Group All Wireframes
        </Button>
      </div>
    </div>
  );
}

export default GroupAllWireframes;
