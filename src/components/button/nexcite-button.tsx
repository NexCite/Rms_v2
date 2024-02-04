"use client";
import Button from "@mui/joy/Button";
import React from "react";

export default function NexCiteButton(props: {
  isPadding?: boolean;
  label?: string;
  onClick?: (props: any) => any;
  type?: "button" | "submit";
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: any;
}) {
  return (
    <Button
      style={{ textTransform: "capitalize" }}
      className={`nexcite-btn ${props.className ?? ""}`}
      onClick={props.onClick}
      variant="solid"
      disabled={props.isPadding || props.disabled}
      type={props.type ?? "submit"}
      loading={props.isPadding}
      startDecorator={props.icon}
    >
      {props.label ?? props.children ?? "Save"}
    </Button>
  );
}
