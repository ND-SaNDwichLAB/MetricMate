export function shortenTextWithPhrases(text, alwaysShowPhrases, visibleChars = 100) {
	// Handle the case where alwaysShowPhrases is empty
	if (!alwaysShowPhrases || alwaysShowPhrases.length === 0) {
		return text.length > visibleChars ? text.slice(0, visibleChars).trim() + "..." : text;
	}

	// Iterate through the alwaysShowPhrases and extract their positions in the text
	let indices = alwaysShowPhrases.map(phrase => {
		let startIndex = text.indexOf(phrase);
		return startIndex !== -1 ? { phrase, startIndex, endIndex: startIndex + phrase.length } : null;
	}).filter(index => index); // Remove phrases not found in the text

	// Sort the phrases by their starting position
	indices.sort((a, b) => a.startIndex - b.startIndex);

	// Create the shortened version of the text
	let shortenedText = '';
	let lastEndIndex = 0;

	indices.forEach(({ phrase, startIndex, endIndex }, i) => {
		// Add ellipsis between non-contiguous phrases
		if (startIndex > lastEndIndex) {
			shortenedText += '... ';
		}

		// Append the phrase
		shortenedText += phrase;

		// Update the last end index
		lastEndIndex = endIndex;

		// Add ellipsis at the end if this is the last phrase and there's more text
		if (i === indices.length - 1 && endIndex < text.length) {
			shortenedText += '...';
		}
	});

	return shortenedText.trim();
}

// Example usage
// const text = "Hello, I'm your physician assistant bot here to gather some information about your symptoms. I understand you're experiencing a persistent cough. Could you please tell me how long this cough has been bothering you?";
// const alwaysShowPhrases = ["assistant bot here to gather some information", "Could you please tell me how long"];

// const shortenedText = shortenTextWithPhrases(text, alwaysShowPhrases);
// console.log(shortenedText);
// Output: "... assistant bot here to gather some information... Could you please tell me how long..."
