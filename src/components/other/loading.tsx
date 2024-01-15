"use client";
import { CircularProgress } from "@mui/material";
import React from "react";

export default function Loading() {
  return (
    <div className="w-full mt-10 flex justify-center items-center">
      <CircularProgress />
    </div>
  );
}
