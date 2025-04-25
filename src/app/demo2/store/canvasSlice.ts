import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PAGE_GROUPS, WIREFRAMES } from "../_constants/wireframes.constant";
import { RootState } from "./store";

export interface Position {
  x: number;
  y: number;
}

export interface Group {
  id: string;
  title: string;
  pageId: string;
  wireframeIds: string[];
  position: Position;
}

export interface Wireframe {
  id: string;
  title: string;
  image: string;
  dimensions: {
    width: number;
    height: number;
  };
  type: "desktop" | "mobile";
  _html: string;
  position?: Position;
  containerId?: string;
}

interface CanvasState {
  groups: {
    [groupId: string]: Group;
  };
  wireframes: {
    [wireframeId: string]: Wireframe;
  };
}

const initialGroups = PAGE_GROUPS.reduce((acc, group) => {
  acc[group.id] = group;
  return acc;
}, {} as { [key: string]: Group });

const initialWireframes = WIREFRAMES.reduce((acc, wireframe) => {
  acc[wireframe.id] = wireframe;
  return acc;
}, {} as { [key: string]: Wireframe });

const initialState: CanvasState = {
  groups: initialGroups,
  wireframes: initialWireframes,
};

export const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    updateWireframePosition: (
      state,
      action: PayloadAction<{
        wireframeId: string;
        position: Position;
      }>
    ) => {
      const { wireframeId, position } = action.payload;
      if (state.wireframes[wireframeId]) {
        state.wireframes[wireframeId].position = position;
      }
    },

    updateWireframeContainer: (
      state,
      action: PayloadAction<{
        wireframeId: string;
        oldGroupId?: string;
        newGroupId: string;
      }>
    ) => {
      const { wireframeId, oldGroupId, newGroupId } = action.payload;
      console.log("Updating container for wireframe:", wireframeId);
      if (oldGroupId && state.groups[oldGroupId]) {
        state.groups[oldGroupId].wireframeIds = state.groups[
          oldGroupId
        ].wireframeIds.filter((id) => id !== wireframeId);
      }

      if (state.groups[newGroupId]) {
        if (!state.groups[newGroupId].wireframeIds.includes(wireframeId)) {
          state.groups[newGroupId].wireframeIds.push(wireframeId);
        }

        if (state.wireframes[wireframeId]) {
          state.wireframes[wireframeId].containerId = newGroupId;
        }
      }
    },
  },
});

export const { updateWireframePosition, updateWireframeContainer } =
  canvasSlice.actions;

export default canvasSlice.reducer;

export const selectGroups = (state: RootState) =>
  Object.values(state.canvas.groups);
export const selectWireframes = (state: RootState) =>
  Object.values(state.canvas.wireframes);
export const selectGroupById = (state: RootState, groupId: string) =>
  state.canvas.groups[groupId];
export const selectWireframeById = (state: RootState, wireframeId: string) =>
  state.canvas.wireframes[wireframeId];
