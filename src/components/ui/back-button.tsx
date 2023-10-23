"use client";
import { IconButton } from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
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
      <ArrowLeft className="h-4 w-4 text-xl" color="black" fontSize={30} />
    </IconButton>
  );
}
