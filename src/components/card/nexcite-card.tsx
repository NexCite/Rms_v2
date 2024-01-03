"use client";
import { Card, CardHeader, Divider } from "@mui/material";
import React from "react";

export default function NexCiteCard(props: {
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      elevation={0}
      variant="outlined"
      className={`rounded-xl ${props.className ?? ""}`}
    >
      <CardHeader title={props.title} />
      <Divider />
      {props.children}
    </Card>
  );
}
