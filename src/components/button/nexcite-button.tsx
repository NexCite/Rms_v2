"use client";
import LoadingButton from "@mui/lab/LoadingButton";
import React from "react";

export default function NexCiteButton(props: {
  isPadding: boolean;
  label?: string;
  onClick?: (props: any) => any;
}) {
  return (
    <LoadingButton
      variant="contained"
      className="nexcite-btn"
      fullWidth
      onClick={props.onClick}
      disableElevation
      type={props.onClick ? "button" : "submit"}
      loading={props.isPadding}
    >
      {props.label ?? "Save"}
    </LoadingButton>
  );
}
