"use client";
import { TLComponents, Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import WireframeContextToolbar from "./WireframeContextToolbar";
import { CustomContextMenu } from "./CustomContextMenu";
import { loadElementsOnMount } from "@/app/demo2/_helpers/tldraw.helper";
import {
  ContainerShapeUtil,
  ElementShapeUtil,
  LayoutBindingUtil,
} from "@/app/demo2/_helpers/tldraw.shapes";

export default function BindingsDemo() {
  const components: TLComponents = {
    InFrontOfTheCanvas: WireframeContextToolbar,
    ContextMenu: CustomContextMenu,
  };

  return (
    <div className="fixed inset-0 w-full h-full z-50">
      <Tldraw
        onMount={(editor) => {
          loadElementsOnMount(editor);
        }}
        hideUi
        shapeUtils={[ContainerShapeUtil, ElementShapeUtil]}
        bindingUtils={[LayoutBindingUtil]}
        components={components}
        options={{}}
      />
    </div>
  );
}
