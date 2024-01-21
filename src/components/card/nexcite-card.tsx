"use client";
import { Card, Typography } from "@mui/joy";
import React from "react";

export default function NexCiteCard(props: {
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card>
      <Typography fontSize={23} className={props.className ?? ""}>
        {props.title}
      </Typography>

      {props.children}
    </Card>
  );
}
