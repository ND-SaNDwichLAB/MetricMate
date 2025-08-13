import { Stack } from '@mui/material';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import React, { useEffect, useSetState, useState } from 'react';
import RadarPlot from '../radar_plot/RadarPlot';
import { useDispatch, useSelector } from "react-redux";

import { DataView } from '../DataView/DataView';
import Joyride from 'react-joyride';


const StyledTabs = styled((props) => (
	<Tabs
		{...props}
		TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
	/>
))({
	'& .MuiTabs-indicator': {
		display: 'flex',
		justifyContent: 'center',
		backgroundColor: 'transparent',
	},
	'& .MuiTabs-indicatorSpan': {
		maxWidth: 40,
		width: '100%',
		backgroundColor: 'black',
	},
});


const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
	({ theme }) => ({
		textTransform: 'none',
		fontWeight: theme.typography.fontWeightRegular,
		fontSize: theme.typography.pxToRem(15),
		marginRight: theme.spacing(1),
		color: 'rgba(0, 0, 0, 0.7)',
		'&.Mui-selected': {
			color: 'black',
		},
		'&.Mui-focusVisible': {
			backgroundColor: 'rgba(100, 95, 228, 0.32)',
		},
	}),
);



function CustomTabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
			style={{ backgroundColor: 'white' }}
		>
			{value === index && <Box sx={{}}>{children}</Box>}
		</div>
	);
}

CustomTabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.number.isRequired,
	value: PropTypes.number.isRequired,
};




function Page() {

	const [steps, setSteps] = useState([
		{
			content: (
				<div>
					<h3>All data</h3>
					<p>This is all your uploaded data.</p>
				</div>
			),
			placement: 'center',
			target: '.demo__about',
		},
		{
			content: (
				<div>
					<h3>This is a single datapoint</h3>
					<p>Each row represents a single datapoint. You can use this data to define your evaluation criteria.</p>
				</div>
			),
			placement: 'left',
			target: '.single__data',
		},
		{
			content: (
				<div>
					<h3>Click here to add criteria</h3>
					<p></p>
				</div>
			),
			placement: 'right',
			target: '.add_criteria',
		},
		{
			content: (
				<div>
					<h3>All added criteria will appear here</h3>
					<p></p>
				</div>
			),
			placement: 'right',
			target: '.all_criteria',
		}, {
			content: (
				<div>
					<h3>Run Evaluation</h3>
					<p>After you're happy with your criteria click this button to run the evaluation.</p>
				</div>
			),
			placement: 'left',
			target: '.run_criteria',
		},

	]);
	const [state, setState] = useState({
		run: true,
		loading: false,
		stepIndex: 0,
		modal_open: false,
	});

	const [value, setValue] = React.useState(1);

	const dispatch = useDispatch();
	const workspace = useSelector((state) => state.workspace);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	useEffect(() => {
		if (!workspace.status) {
			setValue(1);
		}
		if (workspace.status) {
			setState({ ...state, run: false });
		}


	}, [workspace.status]);


	return (<Stack spacing={2} sx={{ height: "100%" }}>
		<Joyride
			// callback={handleJoyrideCallback}
			continuous
			run={state.run}
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
		/>

		<Box className="demo__about" sx={{}}>
			<StyledTabs
				value={value}
				onChange={handleChange}
				aria-label="styled tabs example">

				<StyledTab label="Run Evaluation" value={1} />
				{workspace.status && <StyledTab label="View Evaluation Analytics" value={2} />}
			</StyledTabs>
			<Box sx={{ p: 1, height: "100%" }}>

				<CustomTabPanel value={value} index={1}>
					<DataView />
				</CustomTabPanel>
				{<CustomTabPanel value={value} index={2}>
					<RadarPlot />
				</CustomTabPanel>}
			</Box>
		</Box>

	</Stack>

	);
}


export default {
	routeProps: {
		path: "/evaluate",
		element: <Page />
	},
	name: 'page'
};