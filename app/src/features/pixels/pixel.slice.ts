import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { createEntityAdapter } from "@reduxjs/toolkit";
import { IPixel, IPixelUpdate } from "./pixel.interface";
import { INITIAL_PIXELS } from "$features/pixels/pixels.utils";
import { server } from "$api/server";
import { fetchPixelEventsForPixelId } from "./pixelEvents.slice";

// API
export const fetchPixels = createAsyncThunk(
  "pixels/fetch",
  async (_, thunkAPI): Promise<IPixelUpdate[]> => {
    const pixels = await server.getPixels();
    return pixels;
  }
);

type SelectedPixel = {
  pixelId: number | undefined;
  clientX: number | undefined;
  clientY: number | undefined;
};

export const setSelectedPixel = createAsyncThunk(
  "pixels/setSelected",
  async (
    { pixelId, clientX, clientY }: SelectedPixel,
    thunkAPI
  ): Promise<{
    pixelId: number | undefined;
    clientX: number | undefined;
    clientY: number | undefined;
  }> => {
    if (pixelId !== undefined) {
      thunkAPI.dispatch(fetchPixelEventsForPixelId(pixelId));
    }
    return { pixelId, clientX, clientY };
  }
);

// Adapter
const pixelAdapter = createEntityAdapter<IPixel>({});

// Selectors
export const { selectAll: selectAllPixels, selectById: selectPixelById } =
  pixelAdapter.getSelectors((state: any) => state.pixels);

export const selectTVL = createSelector(selectAllPixels, (pixels) =>
  pixels.reduce((sum, pixel) => sum + (pixel.stakeAmount || 0), 0)
);

export const selectControlOfOwner = createSelector(
  [selectAllPixels, (state, owner: string) => owner],
  (pixels, owner): number => pixels.filter((p) => p.owner == owner).length
);
export const selectUsedOfOwner = createSelector(
  [selectAllPixels, (state, owner: string) => owner],
  (pixels, owner): number =>
    pixels
      .filter((p) => p.owner == owner)
      .reduce((sum, pixel) => sum + (pixel.stakeAmount || 0), 0)
);

type InitialState = {
  status: "loading" | "success" | "error" | "idle";
  selectedPixel: number | undefined;
  selectedClientX?: number | undefined;
  selectedClientY?: number | undefined;
};
const initialState = pixelAdapter.getInitialState<InitialState>({
  status: "idle",
  selectedPixel: undefined,
});

export const pixelSlice = createSlice({
  name: "pixels",
  initialState: pixelAdapter.addMany(initialState, INITIAL_PIXELS),
  reducers: {
    setPixels: (state, action: PayloadAction<IPixelUpdate[]>) => {
      pixelAdapter.updateMany(
        state,
        action.payload.map((e) => ({
          id: e.id,
          changes: e,
        }))
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPixels.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchPixels.rejected, (state) => {
      state.status = "error";
    });
    builder.addCase(
      fetchPixels.fulfilled,
      (state, action: PayloadAction<IPixelUpdate[]>) => {
        state.status = "success";
        pixelAdapter.updateMany(
          state,
          action.payload.map((p) => ({ id: p.id, changes: p }))
        );
      }
    );
    builder.addCase(
      setSelectedPixel.fulfilled,
      (state, action: PayloadAction<SelectedPixel>) => {
        const { pixelId, clientX, clientY } = action.payload;
        state.selectedPixel = pixelId;
        state.selectedClientX = clientX;
        state.selectedClientY = clientY;
      }
    );
  },
});

export const { setPixels } = pixelSlice.actions;

export default pixelSlice.reducer;
