import * as React from 'react';
import { Stack } from '@mui/material';

import { fetchDataset, getJudgeResults, stopStreaming } from '../../store/dataset_slice';
import { CriteriaCollector } from '../CeiteriaCollector/CriteriaCollector.component';
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from 'react-router-dom';

import { DataTable } from './DataTableView';

import Alert from '@mui/material/Alert';
import { DataGrouper } from '../CeiteriaCollector/DataGrouper.component';

import "./DataView.style.css";

import Joyride from 'react-joyride';



const ExpandedStates = Object.freeze({
	1: "CRT",
	2: "GRP",
	3: "BOTH",
});



export const DataView = ({ title, date, id }) => {

	const [joyrideState, setJoyrideState] = React.useState({
		run: true,
		loading: false,
		stepIndex: 0,
		modal_open: false,
	});
	const [steps, setSteps] = React.useState([
		{
			content: (
				<div>
					<h3>All your data</h3>

				</div>
			),
			title: 'Data',
			placement: 'center',
			target: '.all__data',
		},
		{
			content: (
				<div>
					<h3>This is a single datapoint</h3>
					<svg
						height="50px"
						preserveAspectRatio="xMidYMid"
						viewBox="0 0 96 96"
						width="50px"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g>
							<path
								d="M83.2922435,72.3864207 C69.5357835,69.2103145 56.7313553,66.4262214 62.9315626,54.7138297 C81.812194,19.0646376 67.93573,0 48.0030634,0 C27.6743835,0 14.1459311,19.796662 33.0745641,54.7138297 C39.4627778,66.4942237 26.1743334,69.2783168 12.7138832,72.3864207 C0.421472164,75.2265157 -0.0385432192,81.3307198 0.0014581185,92.0030767 L0.0174586536,96.0032105 L95.9806678,96.0032105 L95.9966684,92.1270809 C96.04467,81.3747213 95.628656,75.2385161 83.2922435,72.3864207 Z"
								fill="#000000"
							/>
						</g>
					</svg>
				</div>
			),
			title: 'Data',
			placement: 'center',
			target: '.single__data',
		},

	]);


	const { state } = useLocation();

	const [showAlert, setShowAlert] = React.useState(false);
	const [loading, setLoading] = React.useState(true);
	const [expandedState, setExpandedState] = React.useState(null); // Track which component is expanded

	const [resultsLoading, setResultsLoading] = React.useState(false);
	const [loadingSessionId, setLoadingSessionId] = React.useState(null);


	const [results, setResults] = React.useState({});
	const [size, setSize] = React.useState([30, 70]);

	const [verticalSize, setVerticalSize] = React.useState([90, 10]);

	const workspace = useSelector((state) => state.workspace);
	const dispatch = useDispatch();

	const getResults = (session_id) => {
		let activeCriteria = [];
		Object.values(workspace.criteria).forEach((criterion) => {
			if (criterion.status === "on") {
				activeCriteria.push(criterion);
			}
		});

		if (activeCriteria.length === 0) {
			setShowAlert(true);
			return;
		}

		setResultsLoading(true);
		setLoadingSessionId(session_id)
		dispatch(getJudgeResults({ criteria: activeCriteria, data: workspace.data, session_id: session_id })).then(() => {
			setResultsLoading(false);
			setLoadingSessionId(null)
		});
	};

	const stopLoading = () => {
		//check if we have a current session id
		if (loadingSessionId) {
			//dispatch the cancel redux
			dispatch(stopStreaming({ session_id: loadingSessionId })).then(
				response => {
					//set session id to null
					setLoadingSessionId(null)
				}
			)
		}
	}


	React.useEffect(() => {
		if (showAlert) {
			setTimeout(() => {
				setShowAlert(false);
			}, 5000);
		}
	}, [showAlert]);

	React.useEffect(() => {
		setJoyrideState({ ...joyrideState, run: true })
	}, []);

	React.useEffect(() => {
		setLoading(true);
		if (state.data_id) {
			dispatch(fetchDataset({ data_id: state.data_id })).then(() => {
				setLoading(false);
			});
		} else if (Object.keys(workspace.data)) {
			setLoading(false);
		}
	}, []);

	return (
		<div
			sizes={size} // Initial sizes in percentage for the two columns
			direction="horizontal" // Horizontal split for side-by-side layout
			className="split-container"
			style={{ maxHeight: "80vh", overflow: "hidden", width: "100%", display: "flex" }}
		// onDrag={(e) => {
		// }}

		>
			{/* <Joyride
				// callback={handleJoyrideCallback}
				continuous
				run={joyrideState.run}
				scrollOffset={64}
				scrollToFirstStep
				showProgress
				showSkipButton
				steps={steps}
				styles={{
					options: {
						zIndex: 10000,
					},
				}}
			/> */}
			{/* Left Column */}
			<div style={{
				height: "80vh", // Ensure it takes the full height
				backgroundColor: "#f0f0edaa",
				border: "1px solid #BCBCC8",
				overflowY: "auto",
				width: `${size[0]}%`
			}}>
				<Stack direction="column" spacing={2} sx={{ width: "100%", height: "100%", overflowY: "scroll" }}>
					<CriteriaCollector
						verticalSize={verticalSize}
						setVerticalSize={setVerticalSize}
						loading={loading}
						expandedState={expandedState}
						setExpandedState={setExpandedState}
					/>
					<DataGrouper
						verticalSize={verticalSize}
						setVerticalSize={setVerticalSize}
						expandedState={expandedState} setExpandedState={setExpandedState} />
				</Stack>
			</div>

			{/* Right Column */}
			<div style={{
				height: "80vh", // Ensure it takes the full height
				backgroundColor: "#f0f0edaa",
				border: "1px solid #BCBCC8",
				overflowY: "auto",
				width: `${size[1]}%`

			}}>
				<Stack
					sx={{ width: "100%", }}
					paddingTop={0}
					justifyContent={"center"}
					direction={"column"}
				>
					{showAlert && (
						<Alert
							sx={{
								position: "absolute",
								width: "35vw",
								top: "10px",
								right: "10px",
								opacity: "0.8",
							}}
							severity="info"
						>
							You don't have any active criteria.
						</Alert>
					)}
					<DataTable
						// className="all__data"
						data={workspace.data}
						loading={loading}
						getResults={getResults}
						stopLoading={stopLoading}
						resultsLoading={resultsLoading}
					/>
				</Stack>
			</div>
		</div>
	);
};


export default {
	routeProps: {
		path: "/data",
		element: <DataView />
	},
	name: 'uploadedData'
};