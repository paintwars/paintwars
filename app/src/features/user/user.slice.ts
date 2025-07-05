import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { IUser } from "./user.interface";

export const logoutUser = createAsyncThunk(
	"user/logout",
	async (_, thunkAPI): Promise<void> => {},
);
// Slice
interface UserState extends IUser {}

const userSlice = createSlice({
	name: "user",
	initialState: { username: undefined } satisfies UserState,
	reducers: {},
	extraReducers: (builder) => {},
});

export default userSlice.reducer;
