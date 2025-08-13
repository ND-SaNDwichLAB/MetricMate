const colorMap = {};
const selectedColors = {};

const generateColor = () => {
	let randomColorString = "#";
	const arrayOfColorFunctions = "0123456789abcdef";
	for (let x = 0; x < 6; x++) {
		let index = Math.floor(Math.random() * 16);
		let value = arrayOfColorFunctions[index];

		randomColorString += value;
	}
	return randomColorString;
};

export const newColorFind = id => {
	// If already generated and assigned, return
	if (colorMap[id]) return colorMap[id];

	// Generate new random color
	let newColor;

	do {
		newColor = generateColor();
	} while (selectedColors[newColor]);

	// Found a new random, unassigned color
	colorMap[id] = newColor;
	selectedColors[newColor] = true;

	// Return next new color
	return newColor;
}