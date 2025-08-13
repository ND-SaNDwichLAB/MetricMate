<IconButton onClick={() => {
															// setFetchingResults(true);
															setCommitChanges(false);
															setOldExamplesTracker(null)
															setLoadingAssertion(true);

															//TODO: dispatch update assertion
															let old_passingInputs = [];
															let old_passingOutputs = [];
															oldExamplesTracker.positive.forEach((io) => {
																old_passingInputs.push(io.input);
																old_passingOutputs.push(io.output);
															});

															let old_failingInputs = [];
															let old_failingOutputs = [];
															oldExamplesTracker.negative.forEach((io) => {
																old_failingInputs.push(io.input);
																old_failingOutputs.push(io.output);
															});

															let new_passingInputs = [];
															let new_passingOutputs = [];
															assertion.POSITIVE_EXAMPLES.forEach((io) => {
																new_passingInputs.push(io.input);
																new_passingOutputs.push(io.output);
															});

															let new_failingInputs = [];
															let new_failingOutputs = [];
															assertion.NEGATIVE_EXAMPLES.forEach((io) => {
																new_failingInputs.push(io.input);
																new_failingOutputs.push(io.output);
															});


															dispatch(updateAssertionByExample({
																criteria_id: selectedCriterion,
																assertion_index: index,
																old_name: assertion.NAME,
																old_passingInputs: old_passingInputs,
																old_passingOutputs: old_passingOutputs,
																old_failingInputs: old_failingInputs,
																old_failingOutputs: old_failingOutputs,
																passingInputs: new_passingInputs,
																passingOutputs: new_passingOutputs,
																failingInputs: new_failingInputs,
																failingOutputs: new_failingOutputs

															})).then(() => {
																setLoadingAssertion(false);
															});
														}}
															sx={{ opacity: 0, ...commitChanges && { opacity: 1 } }}>
															<SaveIcon />
														</IconButton>

														<CircularProgress size={"16px"} sx={{ opacity: 0, ...fetchingResults && { opacity: 1 } }} />
