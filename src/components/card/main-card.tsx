import { Typography } from "@mui/material";
import React from "react";

type Props = {
  children: React.ReactNode;
  title?: string;
  className?: string;
};
export default function MainCard(props: Props) {
  return (
    <div className={`px-5 py-5 border   rounded-md ${props.className ?? ""}`}>
      {props.title && (
        <Typography mb={4} variant={"h6"}>
          {props.title}
        </Typography>
      )}
      {props.children}
    </div>
  );
}
