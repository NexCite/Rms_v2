"use client";
import { Card, Typography } from "@mui/joy";
import React from "react";
import Loading from "../other/loading";

export default function NexCiteCard(props: {
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    if (global.window) {
      setLoaded(true);
    }
  }, []);

  return (
    <Card>
      {!loaded ? (
        <Loading />
      ) : (
        <>
          {" "}
          <Typography fontSize={30} className={props.className ?? ""}>
            {props.title}
          </Typography>
          {props.children}
        </>
      )}
    </Card>
  );
}
