"use client";
import { ButtonIcon } from "@radix-ui/react-icons";
import React from "react";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

type Props = {
  loading?: boolean;
  lable: string;
} & (
  | {
      type: "button";
      onClick: (e: any) => void;
    }
  | {
      type: "submit";
    }
);
export default function LoadingButton(props: Props) {
  return (
    <Button
      className="bg-black w-[100px] h-[40px]"
      type={props.type}
      disabled={props.loading}
      color="dark"
    >
      {props.loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          loading...
        </>
      ) : (
        <>{props.lable}</>
      )}
    </Button>
  );
}