"use client";
import LoadingButton from "@mui/lab/LoadingButton";
import React from "react";

export default function NexCiteButton(props: {
  isPadding?: boolean;
  label?: string;
  onClick?: (props: any) => any;
  type?: "button" | "submit";
  children?: React.ReactNode;
}) {
  return (
    <LoadingButton
      variant="contained"
      className="nexcite-btn"
      fullWidth
      onClick={props.onClick}
      disableElevation
      type={props.type ?? "submit"}
      loading={props.isPadding}
    >
      {props.label ?? props.children ?? "Save"}
    </LoadingButton>
  );
}
