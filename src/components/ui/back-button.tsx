"use client";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
type Props = {};
export default function BackButton(props: Props) {
  const { back } = useRouter();
  const [isPadding, setPadding] = useTransition();
  return (
    <LoadingButton
      loading={isPadding}
      id="back-btn"
      disableElevation
      variant="outlined"
      className="min-w-[15px] h-[35px] text-black border-black hover:bg-gray-100 hover:border-black"
      onClick={() =>
        setPadding(() => {
          back();
        })
      }
    >
      <ChevronLeft className="h-4 w-4" />
    </LoadingButton>
  );
}
