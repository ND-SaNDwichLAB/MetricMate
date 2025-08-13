import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { CircularProgress, IconButton, Stack, Tooltip } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";
import ReplayIcon from '@mui/icons-material/Replay';

import ExpandIcon from '@mui/icons-material/Expand';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import CheckIcon from '@mui/icons-material/Check';
import Paper from '@mui/material/Paper';
import {
	acceptAssertion, addCriterion, addNewAssertions,
	deleteAssertion, fetchResultsForAssertion, getAssertionSuggesion,
	unacceptAssertion, fetchAssertionExamples,
	updateAssertionByExample, updateAssertionExample, updateAssertionName, updateCriteriaName
} from '../../store/dataset_slice';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { uuidv4 } from '../../utils/uuid_generator';
import { newColorFind } from '../../utils/color_generator';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import Popper from '@mui/material/Popper';
import EditableTypography from './EditableTypography';
import { shortenTextWithPhrases } from './textDisplayHelper';

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: "70vw",
	bgcolor: 'background.paper',
	border: '1px solid #000',
	boxShadow: 24,
	p: 4,
	height: "70vh",
	overflowY: "scroll"
};

export default function CreateCriteria({ open, setOpen,
	selectedCriterion, setSelectedCriterion }) {


	const workspace = useSelector((state) => state.workspace);

	const dispatch = useDispatch();




	const [updatedName, setUpdatedName] = React.useState(false)
	const [anchorEl, setAnchorEl] = React.useState(null);


	const [loadingExample, setLoadingExample] = React.useState(false);
	const [loadingAssertion, setLoadingAssertion] = React.useState(false);
	const [loadingSuggestAssertions, setLoadingSuggestAssertions] = React.useState(false);


	const [expandedAssertion, setExpandedAssertion] = React.useState(null);
	const [editableAssertion, setEditableAssertion] = React.useState(null);

	const [fetchingResults, setFetchingResults] = React.useState(false);
	const [commitChanges, setCommitChanges] = React.useState(false);
	const [oldExamplesTracker, setOldExamplesTracker] = React.useState(null);

	const [fetchMoreExamples, setFetchMoreExamples] = React.useState(false);

	const [activeCriterion, setActiveCriterion] = React.useState(null);
	const [criteriaName, setCriteriaName] = React.useState("");
	const [criteriaAssertions, setCriteriaAssertions] = React.useState([]);


	const [submitable, setSubmitable] = React.useState(false);
	const [addNewAssertion, setAddNewAssertion] = React.useState(false);





	const handleClose = () => {

		// console.log("LOGLOG Closing the modal setting selected criterion to null")

		//set selected criterion to null
		setSelectedCriterion(null);

		setOpen(false);
	}





	React.useEffect(() => {

		console.log("Criteria assertions change ", criteriaAssertions);
	}, [criteriaAssertions])


	React.useEffect(() => {
		if (selectedCriterion !== null) {


			//set the states
			setSubmitable(true)
			let criterion = workspace.criteria[selectedCriterion]

			console.log("LOGLOG Selected criterion changed ", criterion.criterion_name)

			setActiveCriterion(criterion);
			setCriteriaName(criterion.criterion_name);
			setCriteriaAssertions(criterion.assertions);


		} else {
			setSubmitable(false)
			setActiveCriterion(null);
			setCriteriaName("");
			setCriteriaAssertions([]);
		}
	}, [selectedCriterion, workspace.criteria])


	const handleChangeAssertionResults = (selectedCriterion,
		index, oldAssertion, newAssertion, inputOutputList) => {

		if (oldAssertion === newAssertion) {
			setFetchingResults(false);
			return;
		}
		let inputs = [];
		let outputs = [];
		inputOutputList.forEach((io) => {
			inputs.push(io.input);
			outputs.push(io.output);
		});

		dispatch(fetchResultsForAssertion({
			criteria_id: selectedCriterion, assertion_index: index,
			name: newAssertion, old_name: oldAssertion, inputs: inputs, outputs: outputs
		})).then(() => {
			setFetchingResults(false);
		});
	}

	const handleProceed = (replace) => {

		//check if the cirteria name is empty
		if (criteriaName === "") {
			return;
		}
		setLoadingSuggestAssertions(true);
		dispatch(getAssertionSuggesion({
			criteria_id: "null for now",
			criteria: criteriaName,
			assertions: criteriaAssertions.map((a) => ({ name: a.name, examples: a.examples })),
		})).then((res) => {

			let newAssertions = [];

			let id_pointer = criteriaAssertions.length

			//add suggested assertions to the state
			res.payload && res.payload['assertions'] && res.payload['assertions'].forEach((assert_name) => {
				console.log("LOGLOG Adding new assertion ", id_pointer, assert_name)

				newAssertions.push({
					"name": assert_name,
					"examples": [],
					"status": "draft",
					"id": uuidv4() //id_pointer

				});

				id_pointer = id_pointer + 1
			});

			//dispatch the new assertions to be added to the workspace

			newAssertions.length > 0 && dispatch(
				addNewAssertions({
					"criteriaId": selectedCriterion,
					"newAssertions": newAssertions,
					"replace": replace
				}));




			setLoadingSuggestAssertions(false);
		});

	}
	const handleButtonClick = (event) => {
		if (updatedName) {
			setAnchorEl(anchorEl ? null : event.currentTarget); // Toggle Popper
		} else {
			// Proceed without popup
			handleProceed();
		}
	};
	const handleConfirm = () => {
		setAnchorEl(null); // Close the Popper
		handleProceed(true); // Proceed with replacing the data

	};
	const handleAddOn = () => {
		setAnchorEl(null); // Close the Popper
		handleProceed(false); // Proceed with replacing the data

	}


	return (
		<div>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Stack sx={style} spacing={3}>
					<EditableTypography
						textStyle={{ fontWeight: "bold", textTransform: "uppercase", fontSize: "1.5rem" }}
						initialText={criteriaName || ""}
						status={!criteriaName}
						placeholder={"Double-Click to Add Criteria Name"}
						onSave={(newName) => {
							if (newName === "") {
								return;
							}
							if (selectedCriterion === null) {
								const new_uuid = uuidv4()
								dispatch(addCriterion({
									id: new_uuid,
									criterion_name: newName,
									definition: "",
									assertions: [],
									examples: [],
									results: [],
									status: "on"
								}))
								setSelectedCriterion(new_uuid);


							} else {

								//update the criteria name
								dispatch(updateCriteriaName({ criteriaId: selectedCriterion, newCriteriaName: newName }));
							}
						}} />



					{submitable && <Typography sx={{ fontWeight: "600" }} color={"gray"} variant="subtitle1" gutterBottom component="div">
						Breakdown:
					</Typography>}

					{activeCriterion !== null && activeCriterion.assertions
						.filter(assertion => assertion.status !== "deleted")
						.map((assertion, index) =>
							<Stack direction={"column"} key={`${selectedCriterion}_assertion_${index}`}>
								<Stack direction={"row"}
									sx={{
										//add on hover
										"&:hover": {
											backgroundColor: `${newColorFind(selectedCriterion)}11`,
											border: `2px solid ${newColorFind(selectedCriterion)}fa`
										},

										justifyContent: "space-between",
										alignItems: "center",
										padding: "5px 10px", borderRadius: "25px",
										backgroundColor: `${newColorFind(selectedCriterion)}22`, border: `2px solid ${newColorFind(selectedCriterion)}6a`,

										...expandedAssertion === assertion.id && { borderRadius: "25px 25px 0px 0px", borderBottom: "none" },
										...assertion["status"] === "draft" && {
											backgroundColor: "#f0f0f022", border: "2px dashed #84d6e46a",
											opacity: 0.6,
										}
									}}
									paddingTop={3}>

									<EditableTypography initialText={assertion.name}
										textStyle={{ fontWeight: 500, textTransform: "capitalize" }}
										placeholder={"Double-Click to Add Assertion"}
										status={false}
										onSave={(newName) => {
											dispatch(updateAssertionName({
												criteriaId: selectedCriterion,
												assertionIndex: index,
												assertionId: assertion.id,
												newAssertionName: newName
											}));

										}} />


									<Stack direction={"row"} spacing={0.5}>
										{/* show loading assertions */}
										{(assertion.id === expandedAssertion) && (editableAssertion === null) && (loadingAssertion) && <CircularProgress size={"16px"} />}

										{/* show check Icon */}
										{(assertion.id === expandedAssertion) && (editableAssertion) && <IconButton onClick={() => {
											dispatch(updateAssertionName({
												criteriaId: selectedCriterion,
												assertionIndex: index,
												assertionId: assertion.id,
												newAssertionName: editableAssertion
											}));
											setEditableAssertion(null);

										}}> <CheckIcon /> </IconButton>}


										{/* show delete Icon */}
										<IconButton onClick={() => {
											//dispatch delete assertion
											dispatch(
												deleteAssertion({
													criteriaId: selectedCriterion,
													assertionIndex: index,
													assertionId: assertion.id
												})
											)

										}}>
											<DeleteIcon />
										</IconButton>


										{/* accept or unaccept assertion  */}
										{<IconButton
											onClick={() => {
												if (assertion["status"] === "draft") {
													dispatch(
														acceptAssertion({
															criteriaId: selectedCriterion,
															assertionIndex: index,
															assertionId: assertion.id
														})
													)
													return;
												} else if (assertion["status"] === "active") {
													dispatch(
														unacceptAssertion({
															criteriaId: selectedCriterion,
															assertionIndex: index,
															assertionId: assertion.id
														})
													)
													return;
												}



											}}>

											<CheckCircleIcon />
										</IconButton>}


										{/* {assertion["status"] !== "draft" &&  */}
										{workspace.status && <IconButton onClick={() => {
											setLoadingExample(!loadingExample);
											if (expandedAssertion === assertion.id) {
												setExpandedAssertion(null);
												//set the editable assertion to null

											} else {
												setExpandedAssertion(assertion.id);
											}

										}}>
											{(assertion.id !== expandedAssertion) && <ExpandIcon />}

											{(assertion.id === expandedAssertion) && <UnfoldLessIcon />}

										</IconButton>}
									</Stack>




								</Stack>
								{(assertion.id === expandedAssertion) && <Stack direction={"column"} spacing={2} marginBottom={2}>
									<Table sx={{
										minWidth: 650,
										backgroundColor: `${newColorFind(selectedCriterion)}22`,
										border: `2px solid ${newColorFind(selectedCriterion)}6a`,
									}} aria-label="simple table">
										<TableHead>
											<TableRow >
												<TableCell sx={{ fontWeight: 700 }}>
													<Stack direction={"row"}>
														<span>Input</span>
													</Stack>
												</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Output</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>
													<Stack direction={"row"} spacing={1}>

														<span> Result</span>
													</Stack>
												</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>

											{assertion && assertion.examples && assertion.examples.map((row, ii) =>
												<TableRow key={row.name}>
													<TableCell width={"40%"} component="th" scope="row" >
														<Tooltip title={row.input}>
															{shortenTextWithPhrases(row.input, row["input_reasons"])}
														</Tooltip>
													</TableCell>

													<TableCell width={"40%"} component="th" scope="row" >
														<Tooltip title={row.output}>
															{shortenTextWithPhrases(row.output, row["output_reasons"])}
														</Tooltip>
													</TableCell>
													<TableCell component="th" scope="row"
														sx={{ color: "red", ...row.result === "pass" && { color: "green" } }} >

														<Stack direction={"row"} spacing={1}>


															{/* <InfoIcon /> */}
															<span>  {row.result.toUpperCase()}</span>
															<Tooltip title={"Click here to change result"}>
																<IconButton sx={{ padding: "0px !important" }}
																	onClick={() => {
																		setCommitChanges(true)
																		if (oldExamplesTracker === null) {
																			setOldExamplesTracker({ positive: assertion.psoitive_examples, negative: assertion.negative_examples })
																		}

																		//sleep for 1 second
																		setTimeout(() => {
																			//update the output
																			dispatch(updateAssertionExample({
																				criteriaId: selectedCriterion,
																				assertionIndex: index,
																				exampleIndex: ii,
																				newResult: row.result == "pass" ? "fail" : "pass",
																				row: row
																			}))
																		}, 1000);
																	}}>
																	<DisplaySettingsIcon />
																</IconButton>
															</Tooltip>
														</Stack>
													</TableCell>
												</TableRow>)}

											{/* Add a loading row at the end */}
											<TableRow>
												<TableCell colSpan={3} align="center">
													{(assertion.id !== fetchMoreExamples) && <IconButton onClick={() => {
														setFetchMoreExamples(assertion.id)
														dispatch(fetchAssertionExamples({
															"assertion": assertion,
															"data": workspace.data,
															"criteria": activeCriterion,
														})).then((data) => {
															console.log("LOGLOG Got more examples, ", data);
															if (expandedAssertion === assertion.id) {
																setFetchMoreExamples(null);
															}


														})

													}}>
														<ReplayIcon />
													</IconButton>}
													{(assertion.id === fetchMoreExamples) && <CircularProgress size={"24px"} />}
												</TableCell>
											</TableRow>

										</TableBody>
									</Table>
								</Stack>}

							</Stack>
						)}



					{addNewAssertion &&
						<EditableTypography initialText={""} placeholder={"Double-Click to Add Assertion"} status={true}
							onSave={(newName) => {
								dispatch(
									addNewAssertions({
										"criteriaId": selectedCriterion,
										"newAssertions": [{
											"name": newName,
											"examples": [],
											"status": "active",
											"id": uuidv4()//criteriaAssertions.length + 1
										}]
									})
								);

								setAddNewAssertion(false);
								// setEditableAssertion(null);
							}} />}

					<Stack direction={"row"} spacing={3}>
						{workspace.status && <Button variant="outlined" color="primary" size="small" fullWidth={false} sx={{ width: "150px", padding: "8px", fontSize: "10px" }}
							disabled={loadingSuggestAssertions}
							onClick={e => {
								handleButtonClick(e)
							}}>
							<Stack direction={"row"} spacing={1}>
								{(loadingSuggestAssertions) && <CircularProgress color="inherit" />} Break it down
							</Stack>
						</Button>}


						<Button variant="outlined" color="primary" size="small"
							fullWidth={false}
							sx={{ width: "150px", padding: "8px", fontSize: "10px" }}
							disabled={loadingSuggestAssertions || !submitable}

							onClick={e => {
								setAddNewAssertion(true);
								setExpandedAssertion(null);
							}}>

							Add Assertion

						</Button>


					</Stack>






					<Button variant="contained" color="primary" size="small" sx={{ width: "150px", bottom: "10px", right: "10px", position: "relative" }} disabled={!submitable} onClick={handleClose} >Save</Button>


					<Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="bottom" sx={{ zIndex: "1500 !important" }}>
						<Paper sx={{ padding: "8px", maxWidth: "300px" }}>
							<Typography variant="body2">
								Replacing current breakdown will overwrite your current information. Do you want to proceed?
							</Typography>
							<Stack direction="row" spacing={2} mt={2}>
								<Button variant="contained" color="primary" size='small' onClick={handleConfirm}>
									Replace
								</Button>
								<Button variant="outlined" color="secondary" size='small' onClick={handleAddOn}>
									No, add more
								</Button>
							</Stack>
						</Paper>
					</Popper>



				</Stack>
			</Modal>
		</div >
	);
}
