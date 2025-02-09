import {
	PayloadAction,
	createEntityAdapter,
	createSlice,
} from "@reduxjs/toolkit";
import { RootState } from "~/core/redux/store";
import { v4 as uuid } from "uuid";
import { InputResponse } from "~/lib/types/InputResponse";

export type InputSteps = Record<number, InputResponse>;
export type WorkerDataCollection = { id: string; inputSteps: InputSteps };
export const inputAdaptor = createEntityAdapter<WorkerDataCollection>();

const initialState = inputAdaptor.getInitialState();

const inputSlice = createSlice({
	name: "input",
	initialState: initialState,
	reducers: {
		addInputCollection: (state, { payload }: PayloadAction<InputSteps>) => {
			inputAdaptor.addOne(state, { id: uuid(), inputSteps: payload });
		},
		setInputObject: (
			state,
			action: PayloadAction<{ id: string; changes: InputSteps }>
		) => {
			inputAdaptor.updateOne(state, action);
		},
		saveLatestQueries: () => {
			//action for saving the 10 latest search queries
		},
		reset: () => initialState,
	},
});

export const {
	selectById: selectInputStepById,
	selectIds: selectInputStepIds,
	selectEntities: selectInputStepEntities,
	selectAll: selectAllInputSteps,
	selectTotal: selectTotalInputSteps,
} = inputAdaptor.getSelectors<RootState>((state) => state.input);

export const { addInputCollection, setInputObject, reset } = inputSlice.actions;
export default inputSlice.reducer;
