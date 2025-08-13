
import * as React from 'react';
import { Button, CircularProgress, IconButton, Stack, Typography, ClickAwayListener } from '@mui/material';
import { useDispatch, useSelector } from "react-redux";

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import data from '../../store/patient_bot_output.json';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { newColorFind } from '../../utils/color_generator';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import { PieChart } from '@mui/x-charts/PieChart';

import "./DataTable.style.css";
import { readableColor } from 'polished';
import { setHoveredCriteria } from '../../store/dataset_slice';

import FilterAltIcon from '@mui/icons-material/FilterAlt';

import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

const { v4: uuidv4 } = require('uuid');

const generateSessionId = () => uuidv4();


const pieParams = {
	height: 200,
	margin: { right: 5 },
	slotProps: { legend: { hidden: true } },
};


export const DataTable = ({ data, loading, getResults, resultsLoading, stopLoading }) => {
	const workspace = useSelector((state) => state.workspace);
	const dispatch = useDispatch();

	const [anchorEl, setAnchorEl] = React.useState(null);

	const [filters, setFilters] = React.useState({
		pass: true,
		fail: true,

	});

	const filteredData = Object.keys(data).filter((id) => {
		const runResults = workspace.runResults[id];
		if (!runResults) return true; // Show all rows if no runResults exist

		const passCount = Object.values(runResults).reduce((acc, crt) => {
			return acc + crt.results?.filter((res) => res.result === "pass").length;
		}, 0);

		const failCount = Object.values(runResults).reduce((acc, crt) => {
			return acc + crt.results?.filter((res) => res.result === "fail").length;
		}, 0);

		if (filters.pass && failCount == 0) return true;
		if (filters.fail && failCount > 0) return true;
		return true;
	});



	// useEffect to print run results when they change
	React.useEffect(() => {
		console.log("Run results", workspace.runResults);
	}, [workspace.runResults]);

	const popperRef = React.useRef();

	const handleClick = (event) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};

	React.useEffect(() => {
		const handleOutsideClick = (event) => {
			if (popperRef.current && !popperRef.current.contains(event.target)) {
				setAnchorEl(null);
			}
		};

		if (anchorEl) {
			document.addEventListener("mousedown", handleOutsideClick);
		} else {
			document.removeEventListener("mousedown", handleOutsideClick);
		}

		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, [anchorEl]);


	const handleDragStart = (e, item) => {
		e.dataTransfer.setData('text/plain', item);
	};

	return (<>
		{loading &&
			<Stack minHeight={"80vh"} minWidth={"60vw"} justifyContent={"center"} justifyItems={"center"}
				alignContent={"center"} alignItems={"center"}>
				<CircularProgress />
			</Stack>}

		{!loading && <TableContainer component={Paper}>
			<Table className='all__data' sx={{ minWidth: 650, height: "100%", overflowY: "scroll" }} aria-label="simple table" >
				<TableHead>
					<TableRow sx={{ backgroundColor: "#111111", }}>
						<TableCell sx={{ color: "white !important" }}>ID</TableCell>
						<TableCell sx={{ color: "white !important" }} align="left">Input</TableCell>
						<TableCell sx={{ color: "white !important" }} align="left">Output</TableCell>
						<TableCell align="center" sx={{ color: "white !important", minWidth: "120px", border: "0.5px solid white" }}>

							{!resultsLoading ? <IconButton className='run_criteria' onClick={() => {
								getResults && getResults(generateSessionId());
							}}>
								<PlayArrowIcon sx={{ color: "white !important" }} />
							</IconButton> : <>
								<CircularProgress size={"16px"} />
								<Button onClick={e => {
									stopLoading && stopLoading()
								}}>Cancel</Button>
							</>}
							<IconButton onClick={(e) => { setAnchorEl(e.currentTarget) }}>
								<FilterAltIcon sx={{ color: "white !important" }} />
							</IconButton>
						</TableCell>

					</TableRow>
				</TableHead>
				<TableBody>
					{filteredData.map((id) => (
						<TableRow className={id == 1 ? "single__data" : ""} key={id} draggable onDragStart={(e) => handleDragStart(e, id)}

							sx={{
								backgroundColor: workspace.activeDataId === id ? "#f2fcfd" : "white",
							}}
						>
							<TableCell component="th" scope="row">
								<IconButton> <DragIndicatorIcon />
									<Typography> {id} </Typography>
								</IconButton>

							</TableCell>
							<TableCell align="left">{data[id].input}</TableCell>
							<TableCell align="left">{data[id].output}</TableCell>

							<TableCell align="left">
								<Stack direction="column" spacing={1}>

									{workspace.runResults && workspace.runResults[id] &&
										Object.keys(workspace.runResults[id]).map((crt_id) => {
											//collect criteria pass/fail results
											// console.log(workspace.runResults[id][crt_id])
											let crt_results = workspace.runResults[id][crt_id];
											//count how many pass and how many fail
											let pass_count = crt_results['results']?.filter((a) => {
												return a["result"] === "pass";
											}).length;
											let fail_count = crt_results['results']?.filter((a) => {
												return a["result"] === "fail";
											}).length;


											//collect passed assertions and failed assertions name and id
											let passed_assertion_ids = crt_results['results']?.filter((a) => {
												return a["result"] === "pass";
											}).map((a) => {
												return a["assertion_id"];
											});

											console.log("criteria id: ", workspace.criteria[crt_id].assertions);
											//collect the assertion names from the workspace.criteria
											let passed_assertions_objects = {}
											passed_assertion_ids?.forEach((a) => {
												console.log("passed Assertion id: ", a);
												passed_assertions_objects[a] = workspace.criteria[crt_id].assertions.filter(item => item.id === a)[0];
											});

											let failed_assertion_ids = crt_results['results']?.filter((a) => {
												return a["result"] === "fail";
											}).map((a) => {
												return a["assertion_id"];
											});

											let failed_assertions_objects = {}
											failed_assertion_ids?.forEach((a) => {
												console.log("failed Assertion id: ", a);
												failed_assertions_objects[a] = workspace.criteria[crt_id].assertions.filter(item => item.id === a)[0];
											});

											const pieData = [
												{
													id: `${workspace.criteria[crt_id]}_pass_${crt_id}`,
													label: 'Pass', value: pass_count,
													color: '#066918a1',
													assertions: passed_assertions_objects
												},
												{
													id: `${workspace.criteria[crt_id]}_fail_${crt_id}`,
													label: 'Fail', value: fail_count,
													color: '#FBC2F1',
													assertions: failed_assertions_objects
												},
											]


											return <Stack direction={"row"} p={0.5} sx={{
												border: `1px solid ${newColorFind(crt_id)}`,
												borderRadius: "7px",
												backgroundColor: `${newColorFind(crt_id)}11`
											}} alignItems={"center"}>
												<Stack direction="row-revers" spacing={1}>
													<Typography sx={{ color: `${newColorFind(crt_id)}`, fontWeight: "bolder", textTransform: "capitalize" }} variant='caption'>{workspace.criteria[crt_id].criterion_name}</Typography>
												</Stack>
												<Stack direction="row" spacing={1}>
													<PieChart
														{...pieParams}
														series={[
															{
																data: pieData,
																valueFormatter: (v, { dataIndex }) => {
																	const { assertions, color } = pieData[dataIndex];

																	return (
																		<div style={{ fontSize: "14px", fontFamily: "Arial" }}>
																			{Object.entries(assertions).map(([key, value]) => (
																				<div key={key} style={{ maxWidth: "300px" }}>
																					<strong>{key}:</strong> {value?.name}<br />
																				</div>
																			))}
																		</div>
																	);
																},
																innerRadius: 10,
															},
														]}

														width={50}
														height={50}

													/>
												</Stack>

											</Stack>
										})}
								</Stack>



							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>}

		<Popper
			open={Boolean(anchorEl)}
			anchorEl={anchorEl}
			placement="bottom"
			disablePortal
			ref={popperRef}
		>
			<Paper sx={{ padding: "8px", maxWidth: "300px" }}>
				<FormGroup>
					<FormControlLabel
						control={
							<Checkbox
								checked={filters.pass}
								onChange={(e) => setFilters((prev) => ({ ...prev, pass: e.target.checked }))}
							/>
						}
						label={`Pass (${Object.keys(data).filter((id) => {
							const runResults = workspace.runResults[id];
							if (!runResults) return false;

							// Check if all results do not contain "fail" and at least one contains "pass"
							const hasPass = Object.values(runResults).some((crt) =>
								crt.results?.some((res) => res.result === "pass")
							);

							const noFail = Object.values(runResults).every((crt) =>
								crt.results?.every((res) => res.result !== "fail")
							);

							return hasPass && noFail;
						}).length})`}

					/>
					<FormControlLabel
						control={
							<Checkbox
								checked={filters.fail}
								onChange={(e) => setFilters((prev) => ({ ...prev, fail: e.target.checked }))}
							/>
						}
						label={`Fail (${Object.keys(data).filter((id) => {
							const runResults = workspace.runResults[id];
							if (!runResults) return false;
							return Object.values(runResults).some((crt) =>
								crt.results?.some((res) => res.result === "fail")
							);
						}).length})`}
					/>
				</FormGroup>
			</Paper>
		</Popper>


	</>
	);
};