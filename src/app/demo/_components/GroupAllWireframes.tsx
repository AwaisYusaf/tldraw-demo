import React from "react";
import {
  Box,
  Editor,
  TLShape,
  TLShapeId,
  useEditor,
  createShapeId,
} from "tldraw";
import { WIREFRAMES } from "../_constants/wireframes.constant";
import { Button } from "@/components/ui/button";

type Props = {};

function GroupAllWireframes({}: Props) {
  const editor = useEditor();

  function groupAllWireframes() {
    // Get all shapes on the current page
    const shapeIds = editor.getCurrentPageShapeIds();

    // Get all existing shapes as an array
    const shapes = Array.from(shapeIds)
      .map((id) => editor.getShape(id as TLShapeId))
      .filter(Boolean) as TLShape[];

    if (shapes.length > 0) {
      // Create a group ID
      const groupId = createShapeId();

      // First, group all shapes
      editor.groupShapes(shapes, {
        groupId: groupId,
        select: true,
      });

      // Get the group shape
      const groupShape = editor.getShape(groupId);

      if (groupShape) {
        // Get the bounds of the group
        const groupBounds = editor.getShapePageBounds(groupShape.id);

        if (groupBounds) {
          // Create a background shape that matches the group bounds
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

          // Get the created background shape
          const backgroundShape = editor.getShape(backgroundId);

          if (backgroundShape) {
            // Send the background shape to the back
            editor.sendToBack([backgroundId]);

            // Ungroup the original group
            editor.ungroupShapes([groupShape.id]);

            // Group all shapes together with the background
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
        {/* <div className="w-full h-full bg-red-500 text-2xl">Hello world</div> */}
        <Button onClick={groupAllWireframes}>Group All Wireframes</Button>
      </div>
    </div>
  );
}

export default GroupAllWireframes;
