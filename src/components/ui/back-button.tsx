"use client";
import { IconButton } from "@mui/material";

import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";
type Props = {};
export default function BackButton(props: Props) {
  const { back } = useRouter();
  return (
    <IconButton
      size="large"
      onClick={() => {
        back();
      }}
    >
      <MdArrowBack className="h-4 w-4 text-xl" color="black" fontSize={30} />
    </IconButton>
  );
}
