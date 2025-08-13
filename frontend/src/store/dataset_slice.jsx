import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseurl } from "./base_url";

const intialState = {
	workspace: "dataset_slice",
	data: {},
	criteria: {},
	runResults: {},
	activeDataId: null,
	highlightCriteria: {},
	status: true

};

// add data to local storage
// localStorage.getItem("data_index");







export const fetchDataset = createAsyncThunk(
	"dataset/fetchDataset",
	async (request, { getState }) => {

		const { data_id } = request;
		const response = await fetch(`${baseurl}/data/${data_id}`);
		const data = await response.json();
		return data;
	}
);


export const fetchCriteria = createAsyncThunk(
	"dataset/fetchCriteria",
	async () => {
		const response = await fetch(`${baseurl}/criteria/`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer your-token-here',
				"data-context": window.localStorage.getItem("data_context").replaceAll('"', ""),
			},
		});
		const data = await response.json();
		return data;
	}
);


export const fetchAssertionData = createAsyncThunk(
	"dataset/fetchDataset",
	async (request, { getState }) => {
		const { data_id } = request;
		const response = await fetch(`${baseurl}/data`);
		const data = await response.json();
		return data;
	}
);

export const fetchAssertionExamples = createAsyncThunk(
	"dataset/fetchMoreExamples",
	async (request, { getState }) => {

		const url = `${baseurl}/assertions/examples`

		try {
			const data = await fetch(url, {
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					credentials: "include",
					"data-context": window.localStorage.getItem("data_context").replaceAll('"', ""),
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

export const fetchResultsForAssertion = createAsyncThunk(
	"assertion/fetchResultsForAssertion",
	async (request, { getState }) => {
		console.log("Requesting results for assertion", request);
		let url = new URL(baseurl + "/assertions/results");
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

//TODO update the following code to use the new API
export const updateAssertionByExample = createAsyncThunk(
	"assertion/fetchAssertionForExamples",
	async (request, { getState }) => {
		console.log("Requesting results for assertion", request);
		let url = new URL(baseurl + "/modify/assertion_by_example");
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

export const getAssertionSuggesion = createAsyncThunk(
	"/getAssertionSuggesion",
	async (request, { getState }) => {
		console.log("Requesting results for assertion", request);
		let url = new URL(baseurl + "/assertions/suggestions");
		const user = window.localStorage.getItem("user");

		try {
			const data = await fetch(url, {
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
					credentials: "include",
					"data-context": window.localStorage.getItem("data_context").replaceAll('"', ""),
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

export const compareDataForCriteria = createAsyncThunk(
	"/compareDataForCriteria",
	async (request, { getState }) => {
		console.log("Requesting comparision for data ", request);
		let url = new URL(baseurl + "/criteria/compare_data");
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


export const getDataRecommendation = createAsyncThunk(
	"/getDataRecommendation",
	async (request, { getState }) => {
		console.log("Requesting data recommendation for ", request);
		let url = new URL(baseurl + "/criteria/data_recommendation");
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


// Action to update runResults in the Redux store
export const updateRunResults = createAsyncThunk(
	"/updateRunResults",
	async (request, { getState }) => {
		const { result } = request
		const updatedResults = JSON.parse(result);

		console.log("LOGGING in updatedRunResults ", updatedResults)

		return ({
			payload: updatedResults,
		});
	});

export const getJudgeResults = createAsyncThunk(
	"/getJudgeResultsStream",
	async (request, { dispatch }) => {
		console.log("Requesting streaming results for judge", request);
		const url = new URL(baseurl + "/judge");

		try {
			const response = await fetch(url, {
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
				method: "POST",
				body: JSON.stringify(request),
			});

			if (!response.body) {
				throw new Error("No response body received from server.");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder("utf-8");
			let partialChunk = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				// Decode the chunk and process it
				const chunk = decoder.decode(value, { stream: true });
				partialChunk += chunk;

				// Process complete JSON objects
				let boundaryIndex;
				while ((boundaryIndex = partialChunk.indexOf("EOR")) >= 0) {
					const jsonString = partialChunk.slice(0, boundaryIndex);
					partialChunk = partialChunk.slice(boundaryIndex + 3);

					if (jsonString.trim()) {
						try {
							console.log("streamed json ", jsonString)
							const parsedResult = JSON.parse(JSON.stringify(jsonString));

							// Dispatch action to update the store incrementally
							dispatch(updateRunResults({ "result": parsedResult }));
						} catch (error) {
							console.error("Error parsing streamed JSON chunk:", error);
						}
					}
				}
			}

			console.log("Streaming completed");
		} catch (error) {
			console.error("Failed to fetch streaming results:", error);
		}
	}
);

// To stop streaming
export const stopStreaming = createAsyncThunk(
	"/getJudgeResultsStream",
	async (request, { dispatch }) => {
		const sessionId = request.session_id
		const url = new URL(baseurl + "/stop");
		try {
			await fetch(url, {
				headers: {
					"Content-Type": "application/json",
				},
				method: "POST",
				body: JSON.stringify({ session_id: sessionId }),
			});
		} catch (error) {
			console.error("Failed to stop streaming:", error);
		}
	});

const DatasetSlice = createSlice({
	name: "dataset",
	initialState: intialState,
	reducers: {
		switchStatus: (state, action) => {
			state.status = !state.status;
		},

		setActiveDataId: (state, action) => {
			console.log("Setting active data id", action.payload);
			state.activeDataId = action.payload;
		},
		setCriteriaStatus: (state, action) => {

			const { criteriaId } = action.payload;

			// Find the criteria by its ID directly from the state
			const selectedCriteria = state.criteria[criteriaId]

			if (selectedCriteria) {
				// Toggle the status
				selectedCriteria.status = selectedCriteria.status === "on" ? "off" : "on";
			}

		},
		deleteCriteria: (state, action) => {

			const { criteriaId } = action.payload;

			// Find the criteria by its ID directly from the state
			const selectedCriteria = state.criteria[criteriaId]

			if (selectedCriteria) {
				// Toggle the status
				selectedCriteria.status = "deleted";
			}
		},
		updateAssertionName: (state, action) => {

			const { criteriaId, assertionIndex, assertionId, newAssertionName } = action.payload;

			// Find the criteria by its ID directly from the state
			const selectedCriteria = state.criteria[criteriaId]

			if (selectedCriteria) {
				//find the assertion by its index
				const selectedAssertion = selectedCriteria.assertions?.find(item => item.id === assertionId);

				if (selectedAssertion) {
					selectedAssertion.name = newAssertionName;
				}
			}

		},
		updateAssertionExample: (state, action) => {

			const { criteriaId, assertionIndex, exampleIndex, newResult, row } = action.payload;

			// Find the criteria by its ID directly from the state
			const selectedCriteria = state.criteria[criteriaId]

			if (selectedCriteria) {
				console.log("LOGLOG Updating assertion example", criteriaId, assertionIndex, exampleIndex, newResult, row);
				console.log("LOGLOG Updating assertion example", selectedCriteria);


				//find the assertion by its index
				const selectedAssertion = assertionIndex !== -1 ? selectedCriteria.assertions[assertionIndex] : null;

				if (selectedAssertion) {
					selectedAssertion.examples[exampleIndex].result = newResult;
					//remove the reasonings too
					selectedAssertion.examples[exampleIndex]["input_reasons"] = [];
					selectedAssertion.examples[exampleIndex]["output_reasons"] = [];
				}
			}
		},
		addCriterion: (state, action) => {
			const new_criteria = action.payload;
			state.criteria[new_criteria.id] = new_criteria;

		},
		updateCriteriaName: (state, action) => {
			const { criteriaId, newCriteriaName } = action.payload;


			console.log("Updating criteria name", criteriaId, newCriteriaName);

			// Find the criteria by its ID directly from the state
			const all_criteria = JSON.parse(JSON.stringify(state.criteria))


			//check if the id exists
			if (criteriaId in all_criteria) {
				console.log("All criteria", all_criteria[criteriaId]);
				all_criteria[criteriaId].criterion_name
					= newCriteriaName;
			}

			//update the state
			state.criteria = all_criteria;
		},
		addNewAssertions: (state, action) => {
			const { criteriaId, newAssertions, replace } = action.payload;
			// Find the criteria by its ID directly from the state
			const selectedCriteria = state.criteria[criteriaId];

			if (!replace) {

				if (selectedCriteria) {
					//iterate over the new assertions and add them to the criteria
					for (let i = 0; i < newAssertions.length; i++) {
						selectedCriteria.assertions.push(newAssertions[i]);
					}
				}
			} else {
				if (selectedCriteria) {
					selectedCriteria.assertions = newAssertions
				}
			}


		},
		deleteAssertion: (state, action) => {
			const { criteriaId, assertionIndex, assertionId } = action.payload;

			// Find the criteria by its ID directly from the state
			const selectedCriteria = state.criteria[criteriaId];

			if (selectedCriteria) {
				// console.log("LOGLOG Deleting assertion", assertionIndex, assertionId);

				// Find the assertion by its ID
				const selectedAssertion = selectedCriteria.assertions?.find(item => item.id === assertionId);

				if (selectedAssertion) {
					// console.log("LOGLOG Selected assertion before update:", JSON.parse(JSON.stringify(selectedAssertion)));

					// Update the status of the assertion
					selectedAssertion.status = "deleted";

					// console.log("LOGLOG Selected assertion after update:", JSON.parse(JSON.stringify(selectedAssertion)));
				} else {
					// console.log("LOGLOG No assertion found with ID:", assertionId);
				}
			}
		},
		acceptAssertion: (state, action) => {

			const { criteriaId, assertionIndex, assertionId } = action.payload;

			// Find the criteria by its ID directly from the state
			const selectedCriteria = state.criteria[criteriaId];

			if (selectedCriteria) {
				//find the assertion by its index and set the status to deleted
				const selectedAssertion = selectedCriteria.assertions?.find(item => item.id === assertionId);

				if (selectedAssertion) {
					selectedAssertion.status = "active";
				}
			}
		},
		unacceptAssertion: (state, action) => {

			const { criteriaId, assertionIndex, assertionId } = action.payload;

			// Find the criteria by its ID directly from the state
			const selectedCriteria = state.criteria[criteriaId];

			if (selectedCriteria) {
				//find the assertion by its index and set the status to deleted
				const selectedAssertion = selectedCriteria.assertions?.find(item => item.id === assertionId);

				if (selectedAssertion) {
					selectedAssertion.status = "draft";
				}
			}
		}
	},
	extraReducers: builder => {
		builder.addCase(fetchDataset.fulfilled, (state, action) => {
			// state.data = action.payload;
			const data = action.payload;
			return { ...state, data: data };
		});
		builder.addCase(fetchDataset.rejected, (state, action) => {
			state.data = {};
		});
		builder.addCase(fetchDataset.pending, (state, action) => {
			state.data = {};
		});
		builder.addCase(fetchCriteria.fulfilled, (state, action) => {
			// state.data = action.payload;
			const data = action.payload;
			//add data to the state
			const new_crt = { ...state.criteria, ...data };

			console.log("Fetch criteria returned", data);
			return { ...state, criteria: new_crt };
		});

		builder.addCase(fetchResultsForAssertion.pending, (state, action) => {
			console.log("Fetching results for assertion");
			return { ...state };
		});

		builder.addCase(fetchResultsForAssertion.rejected, (state, action) => {
			console.log("Failed to fetch results for assertion", action);
			return { ...state };
		});

		builder.addCase(fetchResultsForAssertion.fulfilled, (state, action) => {
			console.log("Fetched results for assertion", action);
			let { request, results } = action.payload;

			// Find the criteria by its ID directly from the state
			const selectedCriteria = state.criteria[request.criteria_id]
			//find the assertion by its index
			const selectedAssertion = request.assertion_index !== -1 ? selectedCriteria.ASSERTIONS[request.assertion_index] : null;
			console.log("Selected assertion", selectedAssertion);
			if (selectedAssertion) {
				let POSITIVE_EXAMPLES = [];
				let NEGATIVE_EXAMPLES = [];
				results.forEach((result, index) => {
					if (result == true || result == "true") {
						POSITIVE_EXAMPLES.push({
							input: request.inputs[index],
							output: request.outputs[index]
						});
					} else {
						NEGATIVE_EXAMPLES.push({
							input: request.inputs[index],
							output: request.outputs[index]
						});
					}
				})
				console.log("Positive examples", POSITIVE_EXAMPLES);
				selectedAssertion.POSITIVE_EXAMPLES = POSITIVE_EXAMPLES;
				selectedAssertion.NEGATIVE_EXAMPLES = NEGATIVE_EXAMPLES;
			}


		});
		builder.addCase(fetchAssertionExamples.fulfilled, (state, action) => {
			let { meta, payload } = action;
			const criteriaId = meta.arg.criteria['id'];
			const assertionId = meta.arg.assertion["id"];


			// Find the criteria by its ID directly from the state
			const selectedCriteria = state.criteria[criteriaId]
			if (selectedCriteria) {
				//find the assertion by its index
				const selectedAssertion = selectedCriteria.assertions?.find(item => item.id === assertionId);

				if (selectedAssertion) {
					//set the examples
					selectedAssertion.examples = payload;
				}
			}

			// return { ...state };
		});
		builder.addCase(updateAssertionByExample.fulfilled, (state, action) => {
			console.log("Fetched results for assertion", action);
			let { request, results } = action.payload;

			// Find the criteria by its ID directly from the state
			const selectedCriteria = state.criteria.find((c) => c.id === request.criteria_id);
			//find the assertion by its index
			const selectedAssertion = request.assertion_index !== -1 ? selectedCriteria.ASSERTIONS[request.assertion_index] : null;
			console.log("Selected assertion", selectedAssertion);

			if (selectedAssertion) {
				//update the assertion name
				selectedAssertion.NAME = results;
			}
		});

		builder.addCase(updateRunResults.fulfilled, (state, action) => {
			let new_result = action.payload?.payload;
			console.log("new result payload ", new_result)
			const key = Object.keys(new_result)[0]
			console.log("key : result ", key, new_result[key])

			state.runResults[key] = new_result[key]
			// state.runResults = { ...state.runResults, ...new_result }


		});




	}

});



export default DatasetSlice.reducer;

export const { switchStatus, setActiveDataId, setCriteriaStatus, updateAssertionName, updateAssertionExample, deleteCriteria,
	addCriterion, updateCriteriaName, addNewAssertions, deleteAssertion, unacceptAssertion, acceptAssertion } = DatasetSlice.actions;