import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
	Chart as ChartJS,
	LinearScale,
	RadialLinearScale,
	PointElement,
	LineElement
} from 'chart.js';

import { Radar } from "react-chartjs-2";
import { RadarOptions } from "./RadarConfig";
import { Button, Stack, Typography } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { newColorFind } from "../../utils/color_generator";
import { readableColor } from 'polished'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


ChartJS.register(
	LinearScale,
	RadialLinearScale,
	PointElement,
	LineElement

);


export default function RadarPlot(props) {

	const chartRef = React.createRef();

	const [selectedCriteria, setSelectedCriteria] = React.useState([]);

	const [allCriteria, setAllCriteria] = React.useState([]);

	const [radarData, setRadarData] = React.useState(null);

	const workspace = useSelector((state) => state.workspace);

	const dispatch = useDispatch();

	const [view, setView] = React.useState("radar");

	useEffect(() => {

		//select all active criteria from the workspace
		const activeCriteria = Object.values(workspace.criteria).filter(criterion => criterion.status === "on") || [];

		console.log("Active Criteria: ", activeCriteria);

		let criteria = [];
		activeCriteria.forEach(criterion => {
			criteria.push({
				id: criterion.id,
				title: criterion.criterion_name,
				value: Math.floor(Math.random() * 20),  //TODO: get value from the llm evaluator backend
				...criterion
			});
		});

		setAllCriteria(criteria);

	}, []);

	useEffect(() => {
		console.log("Selected Criteria: ", selectedCriteria);

	}, [selectedCriteria]);

	useEffect(() => {


		let collected_datasets = [];


		let ids = [];
		//set assertions as labels
		selectedCriteria.forEach(criterion => {
			ids.push(criterion.id);
			let labels = [];
			let assertion_ids = [];
			criterion.assertions.forEach(assertion => {
				//if the assertion status is "active" then add it to the labels
				if (assertion.status === "active") {
					labels.push(assertion.name);
					assertion_ids.push(assertion.id);
				}
			});

			// console.log("run results ", workspace.runResults);
			// console.log("criteria id ", criterion.id);
			// console.log("assertion id ", assertion_ids);
			const passCounts = {};
			// Initialize passCounts to zero for each assertion_id
			assertion_ids.forEach(id => {
				passCounts[id] = 0;
			});
			console.log("LOGLOG ", workspace.runResults);

			// Iterate over each run in runResults
			for (const data_id in workspace.runResults) {
				console.log("LOGLOG runkey", data_id);
				// Check if this run has data for our chosen criteria
				if (workspace.runResults[data_id][criterion.id]) {

					// Parse the JSON string to get the results array
					// const data = JSON.parse(workspace.runResults[data_id][criterion.id]);
					const data = workspace.runResults[data_id][criterion.id]

					const results = data.results;

					// Iterate over each result in this run
					for (const result of results) {
						// Check if the assertion_id matches one in our list and if the result is 'pass'
						if (assertion_ids.includes(result.assertion_id) && result.result === "pass") {
							passCounts[result.assertion_id]++;
						}
					}
				}
			}

			// Now passCounts has the count of passes for each assertion_id
			// If you want them in a list (in the same order as assertion_ids), you can map them:
			const passCountsList = assertion_ids.map(id => passCounts[id]);

			console.log("Pass counts for criterion", criterion.id, ":", passCountsList);


			collected_datasets.push(
				{
					labels: labels,
					datasets: [{
						label: criterion.criterion_name,
						backgroundColor: newColorFind(criterion.id),
						borderColor: newColorFind(criterion.id),
						pointBackgroundColor: newColorFind(criterion.id),
						poingBorderColor: "#fff",
						pointHoverBackgroundColor: "#fff",
						pointHoverBorderColor: newColorFind(criterion.id),
						data: passCountsList
					}]
				}

			)
		});


		console.log("Radar Data: ", collected_datasets);
		setRadarData([...collected_datasets]);


	}, [selectedCriteria]);


	return (
		<Stack direction={"row"} sx={{
			height: "100%", width: "100vw", justifyContent: "flex-start",
			alignItems: "flex-start",
		}} spacing={3}>
			<Stack direction={"column"} sx={{ width: "30vw", minHeight: "80vh !important", maxHeight: "80vh !important", backgroundColor: "#ecf2f3", overflowY: "scroll", overflowX: "hidden" }} alignItems={"center"}>
				<Autocomplete
					multiple
					limitTags={2}
					id="multiple-limit-tags"
					options={allCriteria}
					getOptionLabel={(option) => option.title}
					onChange={(event, newValue) => {
						setSelectedCriteria(newValue);
					}}
					renderInput={(params) => (
						<TextField {...params} label="Select Criteria" placeholder="Select Criteria" />
					)}
					sx={{ width: '90%', marginTop: "20px !important" }}
				/>

				<Stack direction={"column"} sx={{ marginTop: "20px !important", display: 'flex' }}>
					{selectedCriteria.map((criterion, index) => <Stack key={index} direction={"row"} sx={{ backgroundColor: "white", padding: "10px", margin: "5px", borderRadius: "5px" }}>
						<Stack direction={"column"} sx={{ width: "25vw" }} >

							<Typography paddingX={2} sx={{ backgroundColor: newColorFind(criterion.id), color: readableColor(newColorFind(criterion.id), "black", "white") }} variant="h6">{criterion.criterion_name}</Typography>

							{criterion.assertions
								.filter(assertion => assertion.status !== "deleted" && assertion.status !== "off")
								.slice(0, 3) // Take only the first 3 items
								.map((assertion, index) => (<Stack key={index} direction={"row"} sx={{ padding: "5px", border: `1px ${newColorFind(criterion.id)} solid` }}>
									<Typography paddingX={3} fontSize={"14px"} variant="caption">{assertion.name}</Typography>
								</Stack>))}
						</Stack>
					</Stack>)}

				</Stack>

			</Stack>
			<Stack sx={{ width: "60vw", overflowY: "scroll", height: "80vh", backgroundColor: "white", border: "1px black solid" }} direction={"column"} alignItems={"center"}>
				<Button sx={{ position: "sticky", right: "0px" }} variant="outlined" onClick={() => {

					if (view == "radar") setView("table")
					else setView("radar")

				}}>{view == "radar" ? "Table" : "Radar"}</Button>

				{view === "radar" && <>{radarData && radarData.length > 0 && radarData.map((data, index) => <Radar key={index} data={data} options={RadarOptions} />
				)}</>}

				{view === "table" && radarData && radarData.length > 0 && radarData.map((data, index) => <TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow sx={{ backgroundColor: `${newColorFind(selectedCriteria[index].id)}a1` }}>
								{data.labels.map((label, index) => <TableCell key={`${index}_tableassrt`}>{label}</TableCell>)}

							</TableRow> </TableHead>
						<TableBody>
							<TableRow>
								{data.datasets[0]?.data.map((count, index) => <TableCell key={`${index}_tableresults`}>{count}</TableCell>)}
							</TableRow>

						</TableBody>
					</Table>
				</TableContainer>)}




			</Stack>
		</Stack>
	);
}