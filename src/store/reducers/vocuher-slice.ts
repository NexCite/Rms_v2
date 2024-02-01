"use client";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { VocuherStoreModel } from "@rms/models/AppStoreMoodel";
import dayjs from "dayjs";
import { MRT_PaginationState, MRT_TableState } from "material-react-table";

export interface VoucherState {
  date?: Date;
  tableState?: Partial<MRT_TableState<any>>;
  id?: number;
  init?: boolean;
  pagination?: MRT_PaginationState;
}
var json = global.window?.sessionStorage.getItem(`vocuher-state`);
var initialState: VoucherState = {
  init: false,
};

if (json) {
  initialState = {
    init: true,
    ...JSON.parse(json),
  };
} else {
  initialState = {
    init: true,
    date: dayjs().toDate(),
  };
}

export const voucherSlice = createSlice({
  name: "voucher",
  initialState,
  reducers: {
    setVocuherState(state, action: PayloadAction<VoucherState>) {
      const { init, date, id, pagination, tableState } = action.payload;
      state.init = init;
      state.date = date;
      state.id = id;
      state.pagination = pagination;
      state.tableState = tableState as any;
      window.sessionStorage.setItem(`vocuher-state`, JSON.stringify(state));
    },
    setVocuherDate(state, action: PayloadAction<Date>) {
      const date = action.payload;
      state.date = date;
      window.sessionStorage.setItem(
        `vocuher-state`,
        JSON.stringify({ ...state, date })
      );
    },

    setVoucherTablePagenation(
      state,
      action: PayloadAction<MRT_PaginationState>
    ) {
      const pagination = action.payload;
      state.pagination = pagination;
      window.sessionStorage.setItem(
        `vocuher-state`,
        JSON.stringify({ ...state, tableState: { state } })
      );
    },
    initVoucherState(state) {
      const storage =
        (window.sessionStorage.getItem(`vocuher-state`) as VocuherStoreModel) ||
        undefined;
      if (storage) {
        state = { ...storage, init: true };
      } else {
        state = { init: true };
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  initVoucherState,
  setVocuherState,
  setVocuherDate,
  setVoucherTablePagenation,
} = voucherSlice.actions;

export default voucherSlice.reducer;
