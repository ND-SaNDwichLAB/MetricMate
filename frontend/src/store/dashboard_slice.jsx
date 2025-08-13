import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseurl } from "./base_url";

const intialState = {
	workspace: "dashboard_slice",
	data_index: {},
	last_updated: "",
}

export const fetchDataIndex = createAsyncThunk(
	"dataset/fetchDataIndex",
	async () => {
		const response = await fetch(`${baseurl}/session`);
		const data = await response.json();
		return data;
	}
);

export const uploadData = createAsyncThunk(
	"/uploadData",
	async (request, { getState }) => {

		let url = new URL(baseurl + "/upload_data");

		const user = window.localStorage.getItem("user");

		try {
			const data = await fetch(url, {
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					credentials: "include",
					// annotuser: user,
				},
				method: "POST",
				body: JSON.stringify(request),
			}).then((res) => res.json());
			return data;
		} catch (error) {
			console.error("Failed to fetch results for assertion", error);
			return error;
		}
	}

);

const DashboardSlice = createSlice({
	name: "dashboard",
	initialState: intialState,
	reducers: {
	},
	extraReducers: builder => {
		builder.addCase(fetchDataIndex.fulfilled, (state, action) => {
			console.log("Fetched data index", action.payload);
			state.data_index = action.payload;
			state.last_updated = new Date().toISOString();




		});

		builder.addCase(uploadData.fulfilled, (state, action) => {
			console.log("handleUpload Uploaded data ", action);
			let { message, results, data_index } = action.payload;

			if (results) {
				// state.data = results;
				state.data_index = data_index;
			}
		});

	}



});



export default DashboardSlice.reducer;

export const { } = DashboardSlice.actions;