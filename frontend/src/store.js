import { configureStore } from "@reduxjs/toolkit";

import DatasetReducer from "./store/dataset_slice";
import DashboardSlice from "./store/dashboard_slice";

export default configureStore({
  reducer: {
    workspace: DatasetReducer,
    dashboard: DashboardSlice,
  },
});