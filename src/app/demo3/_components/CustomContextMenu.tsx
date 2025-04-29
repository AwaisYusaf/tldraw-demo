import { useEffect, useState } from "react";
import {
  DefaultContextMenu,
  DefaultContextMenuContent,
  TldrawUiMenuGroup,
  TldrawUiMenuItem,
  TLUiContextMenuProps,
  useEditor,
} from "tldraw";
import "tldraw/tldraw.css";
import { createContainerForElements } from "@/app/demo3/_helpers/tldraw.helper";
import { ElementShape } from "@/app/demo3/_helpers/tldraw.shapes";

// Save, Show Code, Prompt History, Change Font, Export, Move, Delete forever
export function CustomContextMenu(props: TLUiContextMenuProps) {
  const editor = useEditor();
  const [showCustomMenu, setShowCustomMenu] = useState(false);

  useEffect(() => {
    editor.on("event", (e) => {
      if (e.name === "right_click" && editor.getSelectedShapes().length > 0) {
        if (!showCustomMenu) {
          setShowCustomMenu(true);
        }
      } else {
        setShowCustomMenu(false);
      }
    });
  }, [editor]);

  const handleGroupWireframes = () => {
    const selectedShapes = editor.getSelectedShapes();
    const selectedElements = selectedShapes.filter(
      (shape): shape is ElementShape => shape.type === "element"
    );

    if (selectedElements.length > 0) {
      createContainerForElements(editor, selectedElements);
    }
  };

  return (
    <DefaultContextMenu {...props}>
      {showCustomMenu ? (
        <>
          <TldrawUiMenuGroup id="actions">
            <TldrawUiMenuItem
              id="group-wireframes"
              label="Group Wireframes"
              icon="group"
              readonlyOk
              onSelect={handleGroupWireframes}
            />
            <TldrawUiMenuItem
              id="save"
              label="Save"
              icon="save"
              readonlyOk
              onSelect={() => {
                console.log("Save clicked");
              }}
            />
            <TldrawUiMenuItem
              id="show-code"
              label="Show Code"
              icon="code"
              readonlyOk
              onSelect={() => {
                console.log("Show code clicked");
              }}
            />
            <TldrawUiMenuItem
              id="prompt-history"
              label="Prompt History"
              icon="chat"
              readonlyOk
              onSelect={() => {
                console.log("Prompt history clicked");
              }}
            />
          </TldrawUiMenuGroup>

          <TldrawUiMenuGroup id="customize">
            <TldrawUiMenuItem
              id="change-font"
              label="Change Font"
              icon="text"
              readonlyOk
              onSelect={() => {
                console.log("Change font clicked");
              }}
            />
            <TldrawUiMenuItem
              id="export"
              label="Export"
              icon="export"
              readonlyOk
              onSelect={() => {
                console.log("Export clicked");
              }}
            />
          </TldrawUiMenuGroup>

          <TldrawUiMenuGroup id="danger">
            <TldrawUiMenuItem
              id="move"
              label="Move"
              icon="move"
              readonlyOk
              onSelect={() => {
                console.log("Move clicked");
              }}
            />
            <TldrawUiMenuItem
              id="delete"
              label="Delete forever"
              icon="trash"
              readonlyOk
              onSelect={() => {
                console.log("Delete clicked");
              }}
            />
          </TldrawUiMenuGroup>
        </>
      ) : (
        <DefaultContextMenuContent />
      )}
    </DefaultContextMenu>
  );
}
