import * as React from 'react';
import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Input from '@mui/material/Input';

import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { uploadData } from '../../store/dashboard_slice';
import { generateUUID } from '../../store/util_functions';
import { fetchDataIndex } from '../../store/dashboard_slice';


const CusotmeCard = ({ title, date, id, handleOpen }) => {

	return (<Box sx={{ maxWidth: 275, height: 275 }}>
		<Card sx={{ backgroundColor: "#eee" }} variant="outlined">
			<CardContent>
				<Typography color="text.secondary" gutterBottom>
					{title}
				</Typography>

				<Typography sx={{ mb: 1.5 }} color="text.secondary" variant='caption'>
					{date}
				</Typography>

				<CardActions>
					<Button onClick={() => {
						if (handleOpen) {
							handleOpen();
						}

					}} size="small">Open</Button>
				</CardActions>
			</CardContent>
		</Card>
	</Box>)
}


const OpenUploadData = ({ openUploadData }) => {

	const dispatch = useDispatch();

	const [file, setFile] = useState(null);

	const navigate = useNavigate();


	const handleFileChange = (event) => {
		setFile(event.target.files[0]);
	};

	React.useEffect(() => {
		if (file) {
			console.log('File selected:', file);
			handleUpload();
			// navigate("/data");

		}
		// console.log('File:', file);

	}, [file]);


	const parseTSV = (tsvText) => {
		// Split the TSV file content by new lines to get each row
		const rows = tsvText.trim().split('\n');

		// Split each row by tabs to get individual values
		return rows.map(row => row.split('\t'));
	};

	const readFileAsText = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = () => resolve(reader.result);
			reader.onerror = () => reject(reader.error);

			reader.readAsText(file);
		});
	};


	const handleUpload = async () => {
		if (file) {

			// Read the file as text
			const fileContent = await readFileAsText(file);

			// console.log('handleUpload File content:', fileContent);

			const parsedData = parseTSV(fileContent);
			// console.log('handleUpload Parsed TSV data:', parsedData);
			const geneated_data_id = generateUUID();

			dispatch(uploadData({
				data_name: file.name.split('.').slice(0, -1).join('.'),//use the filename without the extension as the data name
				data_type: 'tsv',
				data_id: geneated_data_id,
				data_context: file.name.split('.').slice(0, -1).join('.'),
				data: parsedData
			})).then((response) => {
				if (response.payload.message != "Data uploaded successfully") {
					console.log("LOGLOG an error occured ", response);
					return
				}

				console.log('LOGLOG handleUpload Data uploaded:', response.payload);
				openUploadData(geneated_data_id, response.payload.data_index);
				//navigate to the data page

			});



		} else {
			console.log('handleUpload No file selected');
		}
	};


	return (<Box sx={{ maxWidth: 275, height: 275 }}>
		<Card variant="outlined">
			<CardContent>
				<Typography color="text.secondary" gutterBottom>
					Upload Data
				</Typography>


				<CardActions>
					<Input
						type="file"
						onChange={handleFileChange}
						inputProps={{ accept: '.csv, .tsv' }} // accept only CSV and TSV files
						style={{ display: 'none' }}
						id="file-upload"
					/>
					<label htmlFor="file-upload">
						<Button variant="contained" component="span">
							Choose File
						</Button>
					</label>

				</CardActions>
			</CardContent>
		</Card>
	</Box>)

}


function AllUploadedData() {

	const dashboardWorkspace = useSelector((state) => state.dashboard);

	const dispatch = useDispatch();

	//useeffect to fetch data index
	React.useEffect(() => {
		// console.log('Fetching data index');
		dispatch(fetchDataIndex());
	}, []);

	const navigate = useNavigate();

	const openUploadData = (data_id, data_index) => {
		// console.log('Open Upload Data');
		//add data to local storage

		let context = ""
		if (data_index) {
			context = data_index[data_id].context
		}
		else {
			context = dashboardWorkspace.data_index[data_id].context
		}

		// console.log('LOGLOG data_id:', data_id, dashboardWorkspace.data_index[data_id]);

		localStorage.setItem("data_context", context);

		navigate("/evaluate", { state: { data_id: data_id } });
	};

	return (
		<Stack sx={{ flexGrow: 1 }} m={5} direction="row" spacing={3} useFlexGap flexWrap="wrap">

			{Object.keys(dashboardWorkspace.data_index).map((data_id) =>
				<CusotmeCard key={data_id} title={dashboardWorkspace.data_index[data_id].name} date={dashboardWorkspace.data_index[data_id].uploaded_date} id={data_id} handleOpen={() => {
					openUploadData(data_id);
				}} />
			)}




			<OpenUploadData openUploadData={openUploadData} />


		</Stack>
	);
}



export default {
	routeProps: {
		path: "/",
		element: <AllUploadedData />
	},
	name: 'allUploadedData'
};