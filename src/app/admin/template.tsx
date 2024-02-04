import { Box, Stack } from "@mui/joy";
import AppBar from "@nexcite/components/layout/AppBar";
import SideBar from "@nexcite/components/layout/SideBar";
import { findAuth } from "@nexcite/service/AuthService";
import React from "react";

export default async function Template(props: { children: React.ReactNode }) {
  const auth = await findAuth();
  return (
    <Stack direction={"row"} gap={5}>
      <SideBar {...auth} />

      <Stack
        sx={{
          marginLeft: "250px",
          overflow: "auto",
          maxHeight: "100vh",
          width: "100%",
        }}
      >
        <AppBar {...auth}></AppBar>
        <Box
          sx={{
            padding: 5,
          }}
        >
          {props.children}
        </Box>
      </Stack>
    </Stack>
  );
}
