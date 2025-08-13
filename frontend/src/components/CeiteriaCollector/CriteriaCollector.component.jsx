import * as React from 'react';
import { CircularProgress, Divider, Icon, IconButton, Stack } from '@mui/material';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from "react-redux";
import { deleteCriteria, fetchCriteria, setCriteriaStatus } from '../../store/dataset_slice';
import CreateCriteria from './CreateCriteria.component';
import CheckIcon from '@mui/icons-material/Check';
import ToggleButton from '@mui/material/ToggleButton';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { newColorFind } from "../../utils/color_generator";
import { readableColor } from 'polished'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Zoom from '@mui/material/Zoom';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';


export const CriteriaCollector = ({ expandedState, setExpandedState, loading, verticalSize, setVerticalSize }) => {
	const [open, setOpen] = React.useState(false);
	const [selectedCriterion, setSelectedCriterion] = React.useState(null);

	const [loadingCriteria, setLoadingCriteria] = React.useState(false);

	const [expanded, setExpanded] = React.useState(true);
	const [hoveredCriterion, setHoveredCriterion] = React.useState(null);

	const workspace = useSelector((state) => state.workspace);

	const dispatch = useDispatch();

	const theme = useTheme();

	const transitionDuration = {
		enter: theme.transitions.duration.enteringScreen,
		exit: theme.transitions.duration.leavingScreen,
	};
	React.useEffect(() => {
		if (verticalSize[0] === 10) {
			setExpanded(false);
		}
	}, [verticalSize]);


	return (<Stack className="all_criteria"
		sx={{
			width: "100%", height: `${verticalSize[0]}%`,  //expanded ? "50vh" : "fit-content",
			// overflowY: expanded ? "auto" : "hidden",
			// flex: expandedState == 2 ? 2 : 1,
			backgroundColor: "#f0f0edaa", borderRadius: "7px",
			position: "relative",
			overflow: "scroll"
		}}
		alignItems={"center"} spacing={3} paddingTop={0}>
		<Stack direction={"row"} sx={{
			width: "100%", borderBottom: "1px solid #BCBCC8", justifyContent: "space-between",
			alignItems: "center", position: "sticky", top: "0px", backgroundColor: "#f0f0ed", zIndex: 100
		}} paddingTop={2}>
			<Typography
				sx={{ padding: "0px", margin: "0px", paddingLeft: "10px" }}
				variant="subtitle2" gutterBottom>All Criteria</Typography>
			<IconButton sx={{ padding: "0px", margin: "0px" }}
				onClick={
					() => {
						if (expanded) {
							setVerticalSize([10, 90]);
						} else {
							setVerticalSize([90, 10]);
						}

						setExpanded(!expanded)
					}
				}>
				{expanded && <ExpandLessIcon />}
				{!expanded && <ExpandMoreIcon />}

			</IconButton>

		</Stack>


		<Stack direction="row" sx={{ '& button': { m: 1, fontSize: "12px" }, display: "none" }}>

			<Button
				variant='outlined'
				size='small'
				startIcon={<AccountCircleIcon />}
				disabled={loading || loadingCriteria}
				onClick={() => {
					setOpen(true);
				}}> Manually Add Criteria </Button>
			<Button
				variant='outlined'
				size='small'
				startIcon={<SmartToyIcon />}
				disabled={loading || loadingCriteria}
				onClick={() => {
					setLoadingCriteria(true);
					dispatch(fetchCriteria()).then(() => {
						setLoadingCriteria(false);
					});
				}}> Recommend Criteria </Button>
		</Stack>
		{expanded && <>
			{(loading || loadingCriteria) &&
				<Stack minHeight={"5vh"} minWidth={"25vw"} justifyContent={"center"} justifyItems={"center"}
					alignContent={"center"} alignItems={"center"}>
					<CircularProgress />
				</Stack>}

			{(!loading && !loadingCriteria) && Object.keys(workspace.criteria).map(criterion_id => {
				const criterion = workspace.criteria[criterion_id];

				// if the criterion is deleted, do not show it
				if (criterion.status === "deleted") {
					return null;
				}


				return (<Stack key={`CRT_${criterion.criterion_name}`}
					sx={{
						width: "90%", marginTop: "4px", backgroundColor: "#ecf2f3aa",
						border: "1px gray solid", borderRadius: "10px",
						...criterion.status == "off" && { opacity: "0.7", border: "1px gray dashed" },
						paddingX: "10px",
						paddingY: "8px",

					}} direction={"column"} spacing={0.5} justifyContent={"center"} alignItems={"center"}

				>

					<Stack direction="row"
						spacing={0}
						sx={{
							justifyContent: "space-between",
							alignItems: "center",
							width: "100%",
							backgroundColor: newColorFind(criterion.id), color: readableColor(newColorFind(criterion.id)),
							borderRadius: "5px",
							paddingX: "5px",
						}}
					>

						<Typography gutterBottom variant="h6" fontSize={"18px"} sx={{ margin: "0px !important", padding: "0px !important", textTransform: "uppercase" }}>
							{criterion.criterion_name}
						</Typography>

						<Stack direction="row" spacing={0} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
							<IconButton onClick={() => {
								dispatch(deleteCriteria({ "criteriaId": criterion.id }))
							}}>
								<DeleteIcon />
							</IconButton>
							<ToggleButton
								sx={{ width: "18px", height: "18px", opacity: "0.7" }}
								value="check"
								selected={criterion.status == "on"}
								onChange={() => {
									dispatch(setCriteriaStatus({ "criteriaId": criterion.id }))
								}}
							>
								<CheckIcon sx={{ color: readableColor(newColorFind(criterion.id)) }} />
							</ToggleButton>
						</Stack>

					</Stack>

					<Divider sx={{ width: '100%', marginY: 1 }} />

					{criterion.assertions && criterion.assertions
						.filter(assertion => assertion.status !== "deleted")
						.slice(0, 3) // Take only the first 3 items
						.map((assertion, index) => (
							<Stack
								key={index}
								direction={"row"}
								sx={{
									margin: "0px",
									border: `1px ${newColorFind(criterion.id)} solid`,
									borderRadius: "10px",
									justifyContent: "flex-start",
									alignItems: "flex-start",
									alignSelf: "flex-start",
									opacity: assertion.status == "draft" ? "0.7" : "1",
									...assertion.status == "draft" && { border: `1px ${newColorFind(criterion.id)} dashed` },
									"&:hover": {
										opacity: "1",
									},
								}}
							>
								<Typography fontSize={"14px"} variant="h6" sx={{}}>
									{assertion.name}
								</Typography>
							</Stack>
						))}
					{criterion.assertions && criterion.assertions.filter(assertion => assertion.status !== "deleted").length > 3 && (
						<Typography
							sx={{
								paddingX: "15px",
								fontSize: "14px",
								color: "gray",
								textAlign: "center",
							}}
						>
							+{criterion.assertions.filter(assertion => assertion.status !== "deleted").length - 3} more
						</Typography>
					)}
					<Stack direction="row"
						spacing={0}
						sx={{
							justifyContent: "flex-end",
							alignItems: "center",
						}} >
						{/* <Button size="small" color='error'>Delete</Button> */}
						<Button size="small" onClick={() => { setOpen(true); setSelectedCriterion(criterion.id) }}>Expand</Button>
					</Stack>
				</Stack>)
			})
			}
			<Zoom
				in={expanded}
				timeout={transitionDuration}
				style={{
					transitionDelay: `${expanded ? transitionDuration.exit : 0}ms`,
				}}
				unmountOnExit
			>
				<Fab className="add_criteria" size="small" color="primary" aria-label="add"
					sx={{
						position: 'sticky',
						bottom: "10px",
						right: "10px",
					}}
					disabled={loading || loadingCriteria}
					onClick={() => {
						setOpen(true);
					}}
				>
					<AddIcon />
				</Fab>
			</Zoom>

			{/* if there is no criteria say there is nothing to see here */}
			{(!loading && !loadingCriteria && Object.keys(workspace.criteria).length === 0) &&
				<Typography variant="body2" sx={{ color: "gray" }}>There is nothing to see here</Typography>}
			<CreateCriteria open={open} setOpen={setOpen}
				selectedCriterion={selectedCriterion} setSelectedCriterion={setSelectedCriterion} />
		</>}




	</Stack >)

}