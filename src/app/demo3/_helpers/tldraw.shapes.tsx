import {
  RecordProps,
  Rectangle2d,
  ShapeUtil,
  T,
  TLBaseShape,
  TLShapeId,
  HTMLContainer,
  Vec,
  clamp,
  getIndexBetween,
  createBindingId,
  useIsEditing,
  useEditor,
  IndexKey,
  BindingUtil,
  BindingOnCreateOptions,
  BindingOnChangeOptions,
  BindingOnShapeChangeOptions,
  BindingOnDeleteOptions,
  TLBaseBinding,
} from "tldraw";
import { WIREFRAMES } from "../_constants/wireframes.constant";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createNewWireframe } from "../_constants/wireframes.constant";
import { updateWireframeContainer } from "../store/canvasSlice";

const CONTAINER_PADDING = 24;

export type ContainerShape = TLBaseShape<
  "container",
  {
    height: number;
    width: number;
    groupId: string;
    title: string;
  }
>;

export class ContainerShapeUtil extends ShapeUtil<ContainerShape> {
  static override type = "container" as const;
  static override props: RecordProps<ContainerShape> = {
    height: T.number,
    width: T.number,
    groupId: T.string,
    title: T.string,
  };

  override getDefaultProps() {
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
    return false;
  }
  override canResize() {
    return false;
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

  handleAddNewElement = (
    side: "left" | "right",
    containerShape: ContainerShape
  ) => {
    const editor = this.editor;
    if (!editor) return;

    const wireframe = createNewWireframe("desktop");

    // Get all existing bindings for this container
    const existingBindings = editor
      .getBindingsFromShape<LayoutBinding>(containerShape, "layout")
      .sort((a, b) => (a.props.index > b.props.index ? 1 : -1));

    // Calculate position for new element
    const elementX = containerShape.x + CONTAINER_PADDING;
    const elementY = containerShape.y + CONTAINER_PADDING;

    // Create new element shape
    const elementId = ("shape:" + wireframe.id) as TLShapeId;
    const element = editor.createShape<ElementShape>({
      id: elementId,
      type: "element",
      x: elementX,
      y: elementY,
      props: {
        wireframeId: wireframe.id,
        title: wireframe.title,
        type: wireframe.type,
        dimensions: wireframe.dimensions,
        _html: wireframe._html,
      },
    });

    // Determine the index for the new binding
    let index: IndexKey;
    if (side === "left") {
      // Add to start (leftmost)
      const firstBinding = existingBindings[0];
      index = firstBinding
        ? getIndexBetween(undefined, firstBinding.props.index)
        : ("a1" as IndexKey);
    } else {
      // Add to end (rightmost)
      const lastBinding = existingBindings[existingBindings.length - 1];
      index = lastBinding
        ? getIndexBetween(lastBinding.props.index, undefined)
        : ("a1" as IndexKey);
    }

    // Create binding between container and new element
    editor.createBinding<LayoutBinding>({
      id: createBindingId(),
      type: "layout",
      fromId: containerShape.id as unknown as TLShapeId,
      toId: elementId as unknown as TLShapeId,
      props: {
        index,
        placeholder: false,
      },
    });

    // Update Redux store
    const store = (window as any).store;
    if (store) {
      store.dispatch(
        updateWireframeContainer({
          wireframeId: wireframe.id,
          newGroupId: containerShape.props.groupId,
        })
      );
    }
  };

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

          <div
            style={{
              position: "absolute",
              top: 0,
              left: -60,
              margin: 12,
              zIndex: 100,
              pointerEvents: "all",
            }}
          >
            <Button
              className="rounded-full size-8 bg-blue-600 hover:bg-blue-700 cursor-pointer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                this.handleAddNewElement("left", shape);
              }}
              style={{
                pointerEvents: "all",
                cursor: "pointer",
                zIndex: 999999,
              }}
            >
              <Plus className="size-4 text-white" />
            </Button>
          </div>

          <div
            style={{
              position: "absolute",
              top: 0,
              right: -60,
              margin: 12,
              zIndex: 100,
              pointerEvents: "all",
            }}
          >
            <Button
              className="rounded-full size-8 bg-blue-600 hover:bg-blue-700 cursor-pointer"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                this.handleAddNewElement("right", shape);
              }}
              style={{
                pointerEvents: "all",
                cursor: "pointer",
                zIndex: 999999,
              }}
            >
              <Plus className="size-8 text-white" />
            </Button>
          </div>
        </div>
      </HTMLContainer>
    );
  }

  override indicator(shape: ContainerShape) {
    return <rect width={shape.props.width} height={shape.props.height} />;
  }
}

export type ElementShape = TLBaseShape<
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

export class ElementShapeUtil extends ShapeUtil<ElementShape> {
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

  override getGeometry(shape: ElementShape) {
    return new Rectangle2d({
      width: shape.props.dimensions.width,
      height: shape.props.dimensions.height,
      isFilled: true,
    });
  }

  override component(shape: ElementShape) {
    const isEditing = useIsEditing(shape.id);
    const props = shape.props;
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
            width: props.dimensions.width,
            height: props.dimensions.height,
            pointerEvents: isEditing ? "all" : "none",
          }}
          className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-200"
        >
          <div className="flex flex-col items-center relative">
            <div>
              <h2>{props.title}</h2>
            </div>

            {props._html && (
              <iframe
                title={`wireframe-${props.title}`}
                srcDoc={props._html}
                frameBorder="0"
                className="overflow-hidden"
                style={{
                  pointerEvents: isEditing ? "all" : "none",
                  height: props.dimensions.height,
                  width: props.dimensions.width,
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

  override indicator(shape: ElementShape) {
    return (
      <rect
        width={shape.props.dimensions.width}
        height={shape.props.dimensions.height}
      />
    );
  }

  private getTargetContainer(shape: ElementShape, pageAnchor: Vec) {
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
          (shape.props.dimensions.width + CONTAINER_PADDING)
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
      try {
        // If we have no siblings, or we're at the start/end, create simpler indices
        if (!belowSib && !aboveSib) {
          index = "a1" as IndexKey;
        } else if (!belowSib) {
          index = getIndexBetween(undefined, aboveSib.props.index);
        } else if (!aboveSib) {
          index = getIndexBetween(belowSib.props.index, undefined);
        } else {
          // If the indices are the same or in wrong order, force a reindex
          if (belowSib.props.index >= aboveSib.props.index) {
            // Reindex all siblings to spread them out
            const newIndices = siblings.map((_, i) =>
              getIndexBetween(`a${i}` as IndexKey, `a${i + 2}` as IndexKey)
            );

            // Update all bindings with new indices
            siblings.forEach((binding, i) => {
              this.editor.updateBinding({
                ...binding,
                props: {
                  ...binding.props,
                  index: newIndices[i],
                },
              });
            });

            // Use a position between the newly reindexed items
            index = getIndexBetween(
              newIndices[order - 1] || undefined,
              newIndices[order] || undefined
            );
          } else {
            index = getIndexBetween(belowSib.props.index, aboveSib.props.index);
          }
        }
      } catch (error) {
        // Fallback: If we still get an error, place at the end
        const lastBinding = allBindings[allBindings.length - 1];
        index = lastBinding
          ? getIndexBetween(lastBinding.props.index, undefined)
          : ("a1" as IndexKey);
      }
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

    // Create the new binding
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

    // Bring the element to the front of its parent
    const parentTransform = this.editor.getShapePageTransform(targetContainer);
    if (parentTransform) {
      this.editor.reparentShapes([shape.id], targetContainer.id);
    }
  }
}

export type LayoutBinding = TLBaseBinding<
  "layout",
  {
    index: IndexKey;
    placeholder: boolean;
  }
>;

export class LayoutBindingUtil extends BindingUtil<LayoutBinding> {
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
    const container = this.editor.getShape<ContainerShape>(containerId);
    if (!container) return;

    const bindings = this.editor
      .getBindingsFromShape<LayoutBinding>(container, "layout")
      .sort((a, b) => (a.props.index > b.props.index ? 1 : -1));
    if (bindings.length === 0) return;

    console.log("Bindings:", bindings);

    for (let i = 0; i < bindings.length; i++) {
      const binding = bindings[i];

      if (toId === binding.toId && placeholder) continue;

      const shape = this.editor.getShape<ElementShape>(binding.toId);
      if (!shape) continue;

      const offset = new Vec(
        CONTAINER_PADDING +
          i * (shape.props.dimensions.width + CONTAINER_PADDING),
        CONTAINER_PADDING
      );

      console.log("Offset:", offset);

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

    const totalWidth = bindings.reduce((acc, binding) => {
      const shape = this.editor.getShape<ElementShape>(binding.toId);
      if (!shape) return acc;
      return acc + shape.props.dimensions.width;
    }, 0);

    const maxHeight = bindings.reduce((acc, binding) => {
      const shape = this.editor.getShape<ElementShape>(binding.toId);
      if (!shape) return acc;
      return Math.max(acc, shape.props.dimensions.height);
    }, 0);

    const width = totalWidth + (bindings.length + 1) * CONTAINER_PADDING;

    const height = CONTAINER_PADDING + maxHeight + CONTAINER_PADDING;

    if (width !== container.props.width || height !== container.props.height) {
      this.editor.updateShape({
        id: container.id,
        type: "container",
        props: { width, height },
      });
    }
  }
}
