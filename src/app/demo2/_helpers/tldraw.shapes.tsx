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

    const width =
      CONTAINER_PADDING +
      totalWidth +
      (bindings.length - 1) * CONTAINER_PADDING +
      CONTAINER_PADDING;

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
