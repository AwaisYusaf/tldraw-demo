"use client";
import {
  BindingOnChangeOptions,
  BindingOnCreateOptions,
  BindingOnDeleteOptions,
  BindingOnShapeChangeOptions,
  BindingUtil,
  HTMLContainer,
  IndexKey,
  RecordProps,
  Rectangle2d,
  ShapeUtil,
  T,
  TLBaseBinding,
  TLBaseShape,
  TLComponents,
  TLShapeId,
  Tldraw,
  Vec,
  clamp,
  createBindingId,
  getIndexBetween,
  useEditor,
  useIsEditing,
} from "tldraw";
import "tldraw/tldraw.css";
import {
  PAGE_GROUPS,
  WIREFRAMES,
  getWireframe,
} from "../_constants/wireframes.constant";
import { TGroup, TWireframe } from "../_constants/types";
import WireframeContextToolbar from "./WireframeContextToolbar";
import { Button } from "@/components/ui/button";
import { CustomContextMenu } from "./CustomContextMenu";
const CONTAINER_PADDING = 24;

type ContainerShape = TLBaseShape<
  "container",
  {
    height: number;
    width: number;
    groupId: string;
    title: string;
  }
>;

class ContainerShapeUtil extends ShapeUtil<ContainerShape> {
  static override type = "container" as const;
  static override props: RecordProps<ContainerShape> = {
    height: T.number,
    width: T.number,
    groupId: T.string,
    title: T.string,
  };

  override getDefaultProps() {
    // Calculate initial size to fit at least one wireframe
    const wireframe = WIREFRAMES[0];
    return {
      width: wireframe.dimensions.width + CONTAINER_PADDING * 2,
      height: wireframe.dimensions.height + CONTAINER_PADDING * 2,
      groupId: "",
      title: "",
    };
  }

  override canBind({
    fromShapeType,
    toShapeType,
    bindingType,
  }: {
    fromShapeType: string;
    toShapeType: string;
    bindingType: string;
  }) {
    return (
      fromShapeType === "container" &&
      toShapeType === "element" &&
      bindingType === "layout"
    );
  }

  override canEdit() {
    return true;
  }
  override canResize() {
    return true;
  }
  override hideRotateHandle() {
    return true;
  }
  override isAspectRatioLocked() {
    return true;
  }

  override getGeometry(shape: ContainerShape) {
    return new Rectangle2d({
      width: shape.props.width,
      height: shape.props.height,
      isFilled: true,
    });
  }

  override component(shape: ContainerShape) {
    return (
      <HTMLContainer>
        <div
          style={{
            backgroundColor: "#f0f0f0",
            width: shape.props.width,
            height: shape.props.height,
            position: "relative",
            borderRadius: "8px",
            border: "2px dashed #ccc",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -30,
              left: 0,
              padding: "4px 8px",
              backgroundColor: "#fff",
              borderRadius: "4px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              fontWeight: "bold",
            }}
          >
            {shape.props.title}
          </div>
        </div>
      </HTMLContainer>
    );
  }

  override indicator(shape: ContainerShape) {
    return <rect width={shape.props.width} height={shape.props.height} />;
  }
}

type ElementShape = TLBaseShape<
  "element",
  {
    wireframeId: string;
    title: string;
    type: string;
    dimensions: {
      width: number;
      height: number;
    };
    _html: string;
  }
>;

class ElementShapeUtil extends ShapeUtil<ElementShape> {
  static override type = "element" as const;
  static override props: RecordProps<ElementShape> = {
    wireframeId: T.string,
    title: T.string,
    type: T.string,
    dimensions: T.object({
      width: T.number,
      height: T.number,
    }),
    _html: T.string,
  };

  override getDefaultProps(): ElementShape["props"] {
    return {
      wireframeId: "",
      title: "",
      type: "desktop",
      dimensions: {
        width: WIREFRAMES[0].dimensions.width,
        height: WIREFRAMES[0].dimensions.height,
      },
      _html: WIREFRAMES[0]._html,
    };
  }

  override canBind({
    fromShapeType,
    toShapeType,
    bindingType,
  }: {
    fromShapeType: string;
    toShapeType: string;
    bindingType: string;
  }) {
    return (
      fromShapeType === "container" &&
      toShapeType === "element" &&
      bindingType === "layout"
    );
  }
  override canEdit() {
    return true;
  }
  override canResize() {
    return true;
  }
  override hideRotateHandle() {
    return true;
  }
  override isAspectRatioLocked() {
    return true;
  }

  override getGeometry() {
    return new Rectangle2d({
      width: WIREFRAMES[0].dimensions.width,
      height: WIREFRAMES[0].dimensions.height,
      isFilled: true,
    });
  }

  override component(shape: ElementShape) {
    const isEditing = useIsEditing(shape.id);
    const wireframe = WIREFRAMES[0];
    const editor = useEditor();

    const currZoomLevel = editor.getZoomLevel();
    let baseSize = 30;

    if (currZoomLevel > 1) {
      baseSize = 20;
    }
    if (currZoomLevel < 1 && currZoomLevel > 0.5) {
      baseSize = 15;
    }
    if (currZoomLevel < 0.5) {
      baseSize = 10;
    }

    return (
      <HTMLContainer style={{ pointerEvents: isEditing ? "all" : "none" }}>
        <div
          style={{
            width: wireframe.dimensions.width,
            height: wireframe.dimensions.height,
            pointerEvents: isEditing ? "all" : "none",
          }}
          className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-200"
        >
          <div className="flex flex-col items-center relative">
            <div>
              <h2>{wireframe.title}</h2>
            </div>

            {wireframe && (
              <iframe
                title={`wireframe-${wireframe.title}`}
                srcDoc={wireframe._html}
                frameBorder="0"
                className="overflow-hidden"
                style={{
                  pointerEvents: isEditing ? "all" : "none",
                  height: wireframe.dimensions.height,
                  width: wireframe.dimensions.width,
                  overflow: "hidden",
                  zIndex: 10,
                }}
              />
            )}

            <div
              style={{
                textAlign: "center",
                position: "absolute",
                bottom: isEditing ? -40 : 30,
                padding: 4,
                fontFamily: "inherit",
                fontSize: 12,
                left: 0,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 100,
              }}
            >
              <Button
                style={{
                  padding: "4px 12px",
                  border: "1px solid var(--color-muted-1)",
                }}
              >
                {isEditing
                  ? "Click Outside to Exit"
                  : "Double Click for Interactive Mode"}
              </Button>
            </div>
          </div>
        </div>
      </HTMLContainer>
    );
  }

  override indicator() {
    return (
      <rect
        width={WIREFRAMES[0].dimensions.width}
        height={WIREFRAMES[0].dimensions.height}
      />
    );
  }

  private getTargetContainer(shape: ElementShape, pageAnchor: Vec) {
    // Find the container shape that the element is being dropped on
    return this.editor.getShapeAtPoint(pageAnchor, {
      hitInside: true,
      filter: (otherShape) =>
        this.editor.canBindShapes({
          fromShape: otherShape,
          toShape: shape,
          binding: "layout",
        }),
    }) as ContainerShape | undefined;
  }

  getBindingIndexForPosition(
    shape: ElementShape,
    container: ContainerShape,
    pageAnchor: Vec
  ) {
    // All the layout bindings from the container
    const allBindings = this.editor
      .getBindingsFromShape<LayoutBinding>(container, "layout")
      .sort((a, b) => (a.props.index > b.props.index ? 1 : -1));

    // Those bindings that don't involve the element
    const siblings = allBindings.filter((b) => b.toId !== shape.id);

    // Get the relative x position of the element center in the container
    // Where should the element be placed? min index at left, max index + 1
    const order = clamp(
      Math.round(
        (pageAnchor.x - container.x - CONTAINER_PADDING) /
          (WIREFRAMES[0].dimensions.width + CONTAINER_PADDING)
      ),
      0,
      siblings.length + 1
    );

    // Get a fractional index between the two siblings
    const belowSib = allBindings[order - 1];
    const aboveSib = allBindings[order];
    let index: IndexKey;

    if (belowSib?.toId === shape.id) {
      index = belowSib.props.index;
    } else if (aboveSib?.toId === shape.id) {
      index = aboveSib.props.index;
    } else {
      index = getIndexBetween(belowSib?.props.index, aboveSib?.props.index);
    }

    return index;
  }

  override onTranslateStart(shape: ElementShape) {
    // Update all the layout bindings for this shape to be placeholders
    this.editor.updateBindings(
      this.editor
        .getBindingsToShape<LayoutBinding>(shape, "layout")
        .map((binding) => ({
          ...binding,
          props: { ...binding.props, placeholder: true },
        }))
    );
  }

  override onTranslate(_: ElementShape, shape: ElementShape) {
    // Find the center of the element shape
    const pageAnchor = this.editor
      .getShapePageTransform(shape)
      .applyToPoint({ x: 50, y: 50 });

    // Find the container shape that the element is being dropped on
    const targetContainer = this.getTargetContainer(shape, pageAnchor);

    if (!targetContainer) {
      // Delete all the bindings to the element
      const bindings = this.editor.getBindingsToShape<LayoutBinding>(
        shape,
        "layout"
      );
      this.editor.deleteBindings(bindings);
      return;
    }

    // Get the index for the new binding
    const index = this.getBindingIndexForPosition(
      shape,
      targetContainer,
      pageAnchor
    );

    // Is there an existing binding already between the container and the shape?
    const existingBinding = this.editor
      .getBindingsFromShape<LayoutBinding>(targetContainer, "layout")
      .find((b) => b.toId === shape.id);

    if (existingBinding) {
      // If a binding already exists, update it
      if (existingBinding.props.index === index) return;
      this.editor.updateBinding<LayoutBinding>({
        ...existingBinding,
        props: {
          ...existingBinding.props,
          placeholder: true,
          index,
        },
      });
    } else {
      // ...otherwise, create a new one
      this.editor.createBinding<LayoutBinding>({
        id: createBindingId(),
        type: "layout",
        fromId: targetContainer.id as unknown as TLShapeId,
        toId: shape.id as unknown as TLShapeId,
        props: {
          index,
          placeholder: true,
        },
      });
    }
  }

  override onTranslateEnd(_: ElementShape, shape: ElementShape) {
    // Find the center of the element shape
    const pageAnchor = this.editor
      .getShapePageTransform(shape)
      .applyToPoint({ x: 50, y: 50 });

    // Find the container shape that the element is being dropped on
    const targetContainer = this.getTargetContainer(shape, pageAnchor);

    // No target container? no problem
    if (!targetContainer) return;

    const index = this.getBindingIndexForPosition(
      shape,
      targetContainer,
      pageAnchor
    );

    this.editor.deleteBindings(
      this.editor.getBindingsToShape<LayoutBinding>(shape, "layout")
    );

    this.editor.createBinding<LayoutBinding>({
      id: createBindingId(),
      type: "layout",
      fromId: targetContainer.id as unknown as TLShapeId,
      toId: shape.id as unknown as TLShapeId,
      props: {
        index,
        placeholder: false,
      },
    });
  }
}

type LayoutBinding = TLBaseBinding<
  "layout",
  {
    index: IndexKey;
    placeholder: boolean;
  }
>;

class LayoutBindingUtil extends BindingUtil<LayoutBinding> {
  static override type = "layout" as const;

  override getDefaultProps() {
    return {
      index: "a1" as IndexKey,
      placeholder: true,
    };
  }

  override onAfterCreate({
    binding,
  }: BindingOnCreateOptions<LayoutBinding>): void {
    this.updateElementsForContainer(binding);
  }

  override onAfterChange({
    bindingAfter,
  }: BindingOnChangeOptions<LayoutBinding>): void {
    this.updateElementsForContainer(bindingAfter);
  }

  override onAfterChangeFromShape({
    binding,
  }: BindingOnShapeChangeOptions<LayoutBinding>): void {
    this.updateElementsForContainer(binding);
  }

  override onAfterDelete({
    binding,
  }: BindingOnDeleteOptions<LayoutBinding>): void {
    this.updateElementsForContainer(binding);
  }

  private updateElementsForContainer({
    props: { placeholder },
    fromId: containerId,
    toId,
  }: LayoutBinding) {
    // Get all of the bindings from the layout container
    const container = this.editor.getShape<ContainerShape>(containerId);
    if (!container) return;

    const bindings = this.editor
      .getBindingsFromShape<LayoutBinding>(container, "layout")
      .sort((a, b) => (a.props.index > b.props.index ? 1 : -1));
    if (bindings.length === 0) return;

    for (let i = 0; i < bindings.length; i++) {
      const binding = bindings[i];

      if (toId === binding.toId && placeholder) continue;

      const offset = new Vec(
        CONTAINER_PADDING +
          i * (WIREFRAMES[0].dimensions.width + CONTAINER_PADDING),
        CONTAINER_PADDING
      );

      const shape = this.editor.getShape<ElementShape>(binding.toId);
      if (!shape) continue;

      const point = this.editor.getPointInParentSpace(
        shape,
        this.editor.getShapePageTransform(container)!.applyToPoint(offset)
      );

      if (shape.x !== point.x || shape.y !== point.y) {
        this.editor.updateShape({
          id: binding.toId,
          type: "element",
          x: point.x,
          y: point.y,
        });
      }
    }

    const width =
      CONTAINER_PADDING +
      (bindings.length * WIREFRAMES[0].dimensions.width +
        (bindings.length - 1) * CONTAINER_PADDING) +
      CONTAINER_PADDING;

    const height =
      CONTAINER_PADDING + WIREFRAMES[0].dimensions.height + CONTAINER_PADDING;

    if (width !== container.props.width || height !== container.props.height) {
      this.editor.updateShape({
        id: container.id,
        type: "container",
        props: { width, height },
      });
    }
  }
}

export default function BindingsDemo() {
  const components: TLComponents = {
    InFrontOfTheCanvas: WireframeContextToolbar,
    ContextMenu: CustomContextMenu,
  };
  return (
    <div className="fixed inset-0 w-full h-full z-50">
      <Tldraw
        onMount={(editor) => {
          // Create containers for each group
          PAGE_GROUPS.forEach((group) => {
            // Calculate container width based on number of wireframes
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

            // Create container with calculated dimensions
            const containerId = editor.createShape<ContainerShape>({
              id: ("shape:" + group.id) as TLShapeId,
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
              const elementId = editor.createShape<ElementShape>({
                id: ("shape:" + wireframe.id) as TLShapeId,
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
                fromId: containerId.id as unknown as TLShapeId,
                toId: elementId.id as unknown as TLShapeId,
                props: {
                  index: `a${index}` as IndexKey,
                  placeholder: false,
                },
              });
            });
          });

          (window as any).editor = editor;
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
