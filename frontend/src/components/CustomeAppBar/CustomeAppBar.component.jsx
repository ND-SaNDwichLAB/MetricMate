import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import { useDispatch, useSelector } from "react-redux";
import { switchStatus } from '../../store/dataset_slice';


export default function CustomeAppBar() {

	const label = { inputProps: { 'aria-label': 'Switch demo' } };
	const workspace = useSelector((state) => state.workspace);
	const dispatch = useDispatch();


	return (
		<Box className=".my-first-step" sx={{ flexGrow: 1 }}>
			<AppBar position="static" sx={{ backgroundColor: "#191e28" }}>
				<Toolbar >
					<Switch className=".my-other-step" {...label} checked={workspace.status} onClick={() => {
						dispatch(switchStatus())
					}} />

				</Toolbar>
			</AppBar>
		</Box>
	);
}