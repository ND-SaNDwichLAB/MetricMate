import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";

const EditableTypography = ({ initialText, onSave, placeholder, status, textStyle }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [text, setText] = useState(initialText);

	useEffect(() => {
		setText(initialText);
	}, [initialText]);
	useEffect(() => {
		if (status) {
			setIsEditing(true);
		}
	}, [status]);

	const handleDoubleClick = () => {
		setIsEditing(true);
	};

	const handleBlur = () => {
		setIsEditing(false);
		if (onSave) {
			onSave(text);
		}
	};

	const handleChange = (e) => {
		setText(e.target.value);
	};

	return isEditing ? (
		<input
			type="text"
			value={text}
			onChange={handleChange}
			onBlur={handleBlur}
			placeholder="Start typing..."
			autoFocus

			style={{
				border: "none",
				outline: "none",
				background: "#03141612",
				cursor: "text",
				fontSize: "1rem",
				lineHeight: "2rem",
				width: "100%",
			}}
		/>
	) : (
		<Typography
			variant="body1"
			sx={{ fontWeight: "bold", cursor: "pointer", ...textStyle && textStyle }}
			onClick={handleDoubleClick}
		>
			{text.length > 0 ? text : placeholder}
		</Typography>
	);
};

export default EditableTypography;