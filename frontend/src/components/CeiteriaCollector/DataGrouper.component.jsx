import React from "react";

import "./DataGrouper.style.css";

import { useSelector, useDispatch } from "react-redux";
import { Divider, Stack, Typography, Button, CircularProgress, ClickAwayListener, Tooltip } from "@mui/material";
import { addCriterion, compareDataForCriteria, setActiveDataId } from "../../store/dataset_slice";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import CompareIcon from '@mui/icons-material/Compare';

import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Badge from '@mui/material/Badge';
import AssistantIcon from '@mui/icons-material/Assistant';

import Popover from '@mui/material/Popover';
import LoupeIcon from '@mui/icons-material/Loupe';
import { v4 as uuidv4 } from 'uuid';
import RemoveIcon from '@mui/icons-material/Remove';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';

import { newColorFind } from "../../utils/color_generator";
import { readableColor } from 'polished'
import AddIcon from '@mui/icons-material/Add';
import EditableTypography from "./EditableTypography";

const HtmlTooltip = styled(({ className, ...props }) => (
	<Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: '#ffffff00',
		opacity: 0.8,
		color: 'rgba(0, 0, 0, 0.87)',
		maxWidth: 220,
		fontSize: theme.typography.pxToRem(12),
		border: 'none',
	},
}));


export const DataGrouper = ({ expandedState, setExpandedState, verticalSize, setVerticalSize }) => {
	const [groups, setGroups] = React.useState([]); // Array of groups, each group is an array of items
	const [expanded, setExpanded] = React.useState(false);
	const [compareLoading, setCompareLoading] = React.useState(false);

	const [suggestedCriteria, setSuggestedCriteria] = React.useState({});
	const [anchorEl, setAnchorEl] = React.useState(null);
	// const [activeDataId, setActiveDataId] = React.useState(null);



	const workspace = useSelector((state) => state.workspace);
	const dispatch = useDispatch();

	const handleDrop = (e, groupIndex) => {
		e.preventDefault();
		const item = e.dataTransfer.getData("text/plain");

		if (item) {

			// Check if the item already exists in any group
			const itemExists = groups.some((group) => group.includes(item));
			if (itemExists) {
				// console.log(`Item "${item}" already exists in a group. Ignoring.`);
				return;
			}


			if (groupIndex === null) {
				// Create a new group
				setGroups((prevGroups) => [...prevGroups, [item]]);
			} else {
				// Add to an existing group
				setGroups((prevGroups) => {
					const updatedGroups = [...prevGroups];
					updatedGroups[groupIndex].push(item);
					return updatedGroups;
				});
			}
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
	};

	const handleDeleteGroup = (groupIndex) => {
		let newGroups = [...groups]
		console.log("suggested criteria ", suggestedCriteria)
		let newSuggestedCriteria = { ...suggestedCriteria }

		newGroups[groupIndex] = [];
		delete newSuggestedCriteria[`group_${groupIndex + 1}`];

		setGroups([...newGroups]);
		setSuggestedCriteria({ ...newSuggestedCriteria });
	}

	const handleEditName = (groupIndex, newName) => {
		let newSuggestedCriteria = { ...suggestedCriteria }

		newSuggestedCriteria[`group_${groupIndex + 1}`]["criteria_title"] = newName

		setSuggestedCriteria({ ...newSuggestedCriteria });
	}

	React.useEffect(() => {
		console.log("suggested criteria", suggestedCriteria);
	}, [suggestedCriteria]);

	React.useEffect(() => {
		if (verticalSize[1] === 10) {
			setExpanded(false);
		}
	}, [verticalSize]);

	if (!workspace.status) {
		return <></>
	}

	return (
		<Stack sx={{
			// flex: expandedState == 2 ? 2 : 1,
			width: "100%", height: `${verticalSize[1]}%`,  //expanded ? "50vh" : "fit-content",
			overflow: "scroll",
			// maxHeight: "40vh",
			// overflowY: expanded ? "auto" : "hidden",
			backgroundColor: "#f0f0edaa", borderRadius: "7px",
			position: "relative",

		}} alignItems={"center"} spacing={3} paddingTop={3}>
			<Stack direction={"row"} sx={{
				width: "100%", borderBottom: "1px solid #BCBCC8", justifyContent: "space-between",
				alignItems: "center",
			}}>
				<Stack direction={"row"} alignItems={"center"} spacing={1} sx={{
					position: "sticky", top: "0px",
					backgroundColor: "#f0f0ed",
					zIndex: 100, width: "100%"
				}} paddingTop={2}>
					<Typography
						sx={{ padding: "0px", margin: "0px", paddingLeft: "10px" }}
						variant="subtitle2" gutterBottom>Data Stage</Typography>
					{suggestedCriteria.length > 0 &&
						<Badge badgeContent={suggestedCriteria.length} color="primary" >
							<AssistantIcon sx={{ color: "#9e9e9e", cursor: "pointer" }}
								size="small"
								onClick={(e) => {
									setAnchorEl(anchorEl ? null : e.currentTarget);
								}} />
						</Badge>}
				</Stack>

				<IconButton sx={{ padding: "0px", margin: "0px" }}
					onClick={
						() => {

							if (expanded) {
								setVerticalSize([90, 10]);
							} else {
								setVerticalSize([10, 90]);
							}

							setExpanded(!expanded)
						}
					}>
					{expanded && <ExpandLessIcon />}
					{!expanded && <ExpandMoreIcon />}

				</IconButton>

			</Stack>
			{expanded && <>
				{/* Existing Groups */}
				{groups.map((group, groupIndex) => (
					<Stack
						key={`group_${groupIndex}`}
						className="drop-zone"
						onDrop={(e) => handleDrop(e, groupIndex)}
						onDragOver={handleDragOver}
						sx={{
							padding: "10px",
							border: "1px solid #ccc",
							borderRadius: "8px",
							backgroundColor: "#f9f9f9",
						}}

					>
						<Stack direction={"row"} spacing={1}>

							{!suggestedCriteria[`group_${groupIndex + 1}`] || suggestedCriteria[`group_${groupIndex + 1}`].length <= 0
								&& <Typography variant="body2" sx={{ fontWeight: "bold" }}>
									Group {groupIndex + 1}
								</Typography>}
							{suggestedCriteria[`group_${groupIndex + 1}`] && suggestedCriteria[`group_${groupIndex + 1}`].length > 0 &&
								<Stack direction="row"
									spacing={0}
									sx={{
										justifyContent: "space-between",
										alignItems: "center",
										width: "100%",
										backgroundColor: newColorFind(suggestedCriteria[`group_${groupIndex + 1}`][0]["id"]), color: readableColor(newColorFind(suggestedCriteria[`group_${groupIndex + 1}`][0]["id"])),
										borderRadius: "5px",
										paddingX: "5px",
									}}
								>
									{/* <Typography variant="body2" sx={{ fontWeight: "bold", cursor: "pointer" }} >

										{suggestedCriteria[`group_${groupIndex + 1}`][0]['criteria_title']} AHHH
									</Typography> */}

									<EditableTypography
										initialText={
											suggestedCriteria[`group_${groupIndex + 1}`][0]["criteria_title"]
										}
										onSave={(newText) => handleEditName(groupIndex, newText)}
									/>


									<Stack direction={"row"}>
										<Tooltip title="Add Criteria">
											<IconButton
												sx={{ padding: "0px", margin: "0px" }}
												onClick={() => {
													const new_uuid = uuidv4()

													//add the criteria to the workspace and remove the suggested criteria
													dispatch(addCriterion({
														id: suggestedCriteria[`group_${groupIndex + 1}`][0]['id'],
														criterion_name: suggestedCriteria[`group_${groupIndex + 1}`][0]['criteria_title'],
														definition: suggestedCriteria[`group_${groupIndex + 1}`][0]['criteria_description'],
														assertions: [],
														examples: [],
														results: [],
														status: "off"
													}));

													//remove the suggested criteria by key

													const newSuggestedCriteria = { ...suggestedCriteria } //.filter((c) => c.criteria_title !== criteria.criteria_title);
													newSuggestedCriteria[`group_${groupIndex + 1}`] = {};
													setSuggestedCriteria(newSuggestedCriteria);

													//remove group too
													let newGroups = [...groups] //.filter((g, index) => index !== groupIndex);
													newGroups[groupIndex] = [];
													setGroups(newGroups);


												}}>
												<AddIcon sx={{ color: readableColor(newColorFind(suggestedCriteria[`group_${groupIndex + 1}`][0]["id"])) }} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete Group">
											<IconButton
												sx={{ padding: "0px", margin: "0px" }}
												onClick={() => {
													handleDeleteGroup(groupIndex)
												}}>
												<DeleteIcon sx={{ color: readableColor(newColorFind(suggestedCriteria[`group_${groupIndex + 1}`][0]["id"])) }} />
											</IconButton>
										</Tooltip>
									</Stack>
								</Stack>}
						</Stack>
						<Stack direction={"column"} divider={<Divider orientation="horizontal" />}>
							{group.map((item, itemIndex) => (
								<Stack
									key={`group_${groupIndex}_item_${itemIndex}`}
									direction="row"
									spacing={1}
									sx={{
										cursor: "pointer",
										alignItems: "center", // Vertically align items
										//onhover
										"&:hover": { backgroundColor: "#f2fcfd" },
									}}

									onMouseEnter={() => dispatch(setActiveDataId(item))}
									onMouseLeave={() => dispatch(setActiveDataId(null))}
								>
									<Stack sx={{ flex: 1 }}>
										{workspace.activeDataId !== item ? <Typography variant="caption" fontSize="14px" sx={{ textAlign: "left" }}>
											{item}
										</Typography>
											:
											<IconButton
												size="small"
												onClick={() => {
													const newGroups = groups.map((g, index) => {
														return g.filter((i) => i !== item);
													});
													setGroups(newGroups);
												}}
												sx={{ alignSelf: "center" }} // Ensure alignment with text
											>
												<DeleteIcon fontSize="9" />
											</IconButton>
										}
									</Stack>
									<HtmlTooltip arrow
										title={
											<Paper elevation={3} sx={{ padding: "5px" }} variant="elevation" >
												<Typography color="inherit" variant="body2" fontSize={"12px"}>{workspace.data[item]?.input || ''}</Typography>
											</Paper>
										}
									>
										{/* <Tooltip title={workspace.data[item]?.input || ''} arrow placement="bottom-start"> */}
										<Typography
											sx={{
												display: "-webkit-box",
												overflow: "hidden",
												WebkitBoxOrient: "vertical",
												WebkitLineClamp: 2,
												textOverflow: "ellipsis",
												flex: 5, // Adjust width to be proportional
												textAlign: "left", // Ensure text is aligned consistently
												"&:hover": {
													border: "1px solid #ccc",
													padding: "5px",
												}
											}}
											variant="caption"
											fontSize="12px"
										>
											{workspace.data[item]?.input}
										</Typography>
										{/* </Tooltip> */}
									</HtmlTooltip>

									<HtmlTooltip arrow placement="bottom-end"
										title={
											<Paper elevation={3} sx={{ padding: "5px" }} variant="elevation">
												<Typography color="inherit" variant="body2" fontSize={"12px"}>{workspace.data[item]?.output || ''}</Typography>
											</Paper>
										}
									>
										{/* <Tooltip title={workspace.data[item]?.output || ''} arrow placement="bottom-end"> */}
										<Typography
											sx={{
												display: "-webkit-box",
												overflow: "hidden",
												WebkitBoxOrient: "vertical",
												WebkitLineClamp: 2,
												textOverflow: "ellipsis",
												flex: 5, // Adjust width to be proportional
												textAlign: "left",
												"&:hover": {
													border: "1px solid #ccc",
													padding: "5px",
												}
											}}
											variant="caption"
											fontSize="12px"
										>
											{workspace.data[item]?.output}
										</Typography>
										{/* </Tooltip> */}
									</HtmlTooltip>

								</Stack>

							))}


							<Stack
								sx={{
									padding: "10px",
									border: "2px dashed #ccc",
									borderRadius: "8px",
									backgroundColor: "#f0f0f0",
								}}
							>
								<Typography sx={{ color: "#666" }} variant="body2">
									Drop to Add
								</Typography>
							</Stack>
						</Stack>

					</Stack>
				))}

				{/* Create New Group if there is less than two groups */}
				{groups.length < 2 && <Stack
					className="drop-zone"
					onDrop={(e) => handleDrop(e, null)}
					onDragOver={handleDragOver}
					sx={{
						padding: "10px",
						border: "2px dashed #ccc",
						borderRadius: "8px",
						backgroundColor: "#f0f0f0",
					}}
				>
					<Typography sx={{ color: "#666" }} variant="body2">
						Drop Here to Create New Group
					</Typography>
				</Stack>}

				{(groups.length >= 1) && <Fab size="small"
					variant="extended"
					sx={{
						position: "absolute",
						bottom: "10px",
						right: "10px"
					}}
					disabled={compareLoading}
					onClick={() => {
						setCompareLoading(true);
						//collect the data in the groups
						let groupData = {};
						groups.forEach((group, index) => {
							let groupItems = [];
							group.forEach((item) => {
								groupItems.push(workspace.data[item]);
							});
							groupData[`group_${index + 1}`] = groupItems;
						});


						dispatch(compareDataForCriteria({ "groups": groupData }))
							.then((data) => {
								setCompareLoading(false);
								console.log("Compare results data ", data);
								//check if the returned data has the criteria
								if (data.payload && data.payload.suggested_criteria) {
									//add the suggested criteria to the state
									setSuggestedCriteria({ ...data.payload.suggested_criteria });
								}

							});

					}}
				>
					{compareLoading ? <CircularProgress size={18} sx={{ mr: 1, animationDuration: '20s !important' }} color="inherit" /> :
						<CompareIcon sx={{ mr: 1 }} />}
					Compare
				</Fab>}
			</>}
			<Popover id={"suggested_crt_popper"}
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				placement={"bottom-end"}

			>
				<Paper>
					<Stack direction={"column"} paddingY={1} paddingX={3} >
						<Typography sx={{ padding: "5px" }} variant="h6">Suggested Criteria</Typography>

						{/* iterate over the suggested criteria and show them */}

						{Object.keys(suggestedCriteria).map((criteria, index) => (
							<Stack key={`suggested_criteria_${index}`} direction={"column"}
								sx={{
									padding: "10px",
									width: "100%",
									backgroundColor: "#F9FEFE",
								}} >
								<Stack direction={"row"} spacing={1} alignContent={"center"} alignItems={"center"} >
									<Tooltip title="Add Criteria">
										<IconButton
											sx={{ padding: "0px", margin: "0px" }}
											onClick={() => {
												const new_uuid = uuidv4()

												//add the criteria to the workspace and remove the suggested criteria
												dispatch(addCriterion({
													id: new_uuid,
													criterion_name: criteria.criteria_title,
													definition: "",
													assertions: [],
													examples: [],
													results: [],
													status: "draft"
												}));

												//remove the suggested criteria
												const newSuggestedCriteria = suggestedCriteria.filter((c) => c.criteria_title !== criteria.criteria_title);
												setSuggestedCriteria(newSuggestedCriteria);


											}}>
											<LoupeIcon />
										</IconButton>
									</Tooltip>
									<Typography variant="body2" sx={{ fontWeight: "700" }}>{criteria.criteria_title}</Typography>

								</Stack>
								<Typography variant="caption">{criteria.criteria_description}</Typography>
								<Divider orientation="horizontal" />
							</Stack>
						))}

					</Stack>
				</Paper>
			</Popover>
		</Stack >
	);
};
