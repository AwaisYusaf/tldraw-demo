import { useEffect } from "react";
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

  console.log("Props:", props);

  return (
    <DefaultContextMenu {...props}>
      {editor.getSelectedShapes().length > 0 &&
      editor.getSelectedShapes()[0].type == "element" ? (
        <TldrawUiMenuGroup id="example">
          <TldrawUiMenuItem
            id="like"
            label="Save"
            icon="external-link"
            readonlyOk
            onSelect={() => {
              console.log("Clicked...");
            }}
          />
          <TldrawUiMenuItem
            id="like"
            label="Show Code"
            icon="external-link"
            readonlyOk
            onSelect={() => {
              console.log("Clicked...");
            }}
          />
          <TldrawUiMenuItem
            id="like"
            label="Prompt History"
            icon="external-link"
            readonlyOk
            onSelect={() => {
              console.log("Clicked...");
            }}
          />
          <TldrawUiMenuItem
            id="like"
            label="Change Font"
            icon="external-link"
            readonlyOk
            onSelect={() => {
              console.log("Clicked...");
            }}
          />
          <TldrawUiMenuItem
            id="like"
            label="Export"
            icon="external-link"
            readonlyOk
            onSelect={() => {
              console.log("Clicked...");
            }}
          />
          <TldrawUiMenuItem
            id="like"
            label="Move"
            icon="external-link"
            readonlyOk
            onSelect={() => {
              console.log("Clicked...");
            }}
          />
          <TldrawUiMenuItem
            id="like"
            label="Delete forever"
            icon="external-link"
            readonlyOk
            onSelect={() => {
              console.log("Clicked...");
            }}
          />
        </TldrawUiMenuGroup>
      ) : (
        <DefaultContextMenuContent />
      )}
    </DefaultContextMenu>
  );
}
