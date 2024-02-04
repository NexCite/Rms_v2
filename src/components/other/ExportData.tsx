"use client";
import { Box, Button } from "@mui/material";
import NexCiteExportToCsv from "@nexcite/lib/nexcite_lib/lib/export-to-csv";
import React from "react";
import { MdFileDownload } from "react-icons/md";

export default function ExportData(props: { data: any; table: any }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "3px",
        padding: "8px",
        flexWrap: "wrap",
      }}
    >
      <Button
        size="small"
        className="nexcite-btn"
        variant="contained"
        disableElevation
        //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
        onClick={() => {
          NexCiteExportToCsv.handleExportRows<any>(props.data);
        }}
        startIcon={<MdFileDownload />}
      >
        Export All Data
      </Button>
      <Button
        size="small"
        className="nexcite-btn"
        variant="contained"
        disableElevation
        disabled={props.table.getPrePaginationRowModel().rows.length === 0}
        //export all rows, including from the next page, (still respects filtering and sorting)
        onClick={() =>
          NexCiteExportToCsv.handleSelectedExportRows<any>(
            props.table.getPrePaginationRowModel().rows
          )
        }
        startIcon={<MdFileDownload />}
      >
        Export All Rows
      </Button>
      <Button
        size="small"
        className="nexcite-btn"
        variant="contained"
        disableElevation
        disabled={props.table.getRowModel().rows.length === 0}
        //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
        onClick={() =>
          NexCiteExportToCsv.handleSelectedExportRows<any>(
            props.table.getRowModel().rows
          )
        }
        startIcon={<MdFileDownload />}
      >
        Export Page Rows
      </Button>
      <Button
        size="small"
        className="nexcite-btn"
        variant="contained"
        disableElevation
        disabled={
          !props.table.getIsSomeRowsSelected() &&
          !props.table.getIsAllRowsSelected()
        }
        //only export selected rows
        onClick={() =>
          NexCiteExportToCsv.handleSelectedExportRows(
            props.table.getSelectedRowModel().rows
          )
        }
        startIcon={<MdFileDownload />}
      >
        Export Selected Rows
      </Button>
    </Box>
  );
}
