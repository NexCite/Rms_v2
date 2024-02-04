"use client";
import { Button } from "@mui/joy";

import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";
type Props = {};
export default function BackButton(props: Props) {
  const { back } = useRouter();
  return (
    <Button
      sx={{
        color: "black",
        fontSize: 20,
        borderColor: "transparent",
        ":hover": {
          bgcolor: "transparent",
        },
      }}
      variant="outlined"
      startDecorator={<MdArrowBack />}
      onClick={() => {
        back();
      }}
    ></Button>
  );
}
