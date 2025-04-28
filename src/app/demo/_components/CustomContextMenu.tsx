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

// Save, Show Code, Prompt History, Change Font, Export, Move, Delete forever
export function CustomContextMenu(props: TLUiContextMenuProps) {
  const editor = useEditor();
  const [showCustomMenu, setShowCustomMenu] = useState(false);

  useEffect(() => {
    editor.on("event", (e) => {
      if (e.name === "right_click" && editor.getOnlySelectedShape()) {
        if (!showCustomMenu) {
          setShowCustomMenu(true);
        }
      } else {
        setShowCustomMenu(false);
      }
    });
  }, [editor]);

  return (
    <DefaultContextMenu {...props}>
      {showCustomMenu ? (
        <>
          <TldrawUiMenuGroup id="actions">
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
