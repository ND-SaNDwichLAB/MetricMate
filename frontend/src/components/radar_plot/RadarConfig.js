// Function to wrap text manually
const wrapText = (label, maxLineLength) => {
const words = label.split(" ");
let line = "";
const lines = [];
for (let word of words) {
	if ((line + word).length > maxLineLength) {
	lines.push(line.trim());
	line = word + " ";
	} else {
	line += word + " ";
	}
}
lines.push(line.trim());
return lines;
};



// export const RadarOptions = {
// scale: {
// 	ticks: {
// 		min: 0,
// 		max: 100,
// 		stepSize: 2,
// 		showLabelBackdrop: false,
// 		backdropColor: "rgba(203, 197, 11, 1)"
// 	},
// 	angleLines: {
// 		color: "rgba(255, 255, 255, .3)",
// 		lineWidth: 1
// 	},
// 	gridLines: {
// 		color: "rgba(255, 255, 255, .3)",
// 		circular: true
// 	}
// }
// };



export const RadarOptions = {
    scales: {
      r: {
        pointLabels: {
          callback: function (label) {
            return wrapText(label, 30); // Wrap text every 10 characters
          },
          font: {
            size: 12, // Adjust font size if needed
          },
        },
        ticks: {
          display: true, // Optional: Hide radial axis ticks
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  };
  