"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@material-tailwind/react";

type Props = {
  loading?: boolean;
  label: string;
  icon?: any;
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
      className="bg-black h-[40px]"
      type={props.type}
      disabled={props.loading}
      onClick={props.type === "button" ? props.onClick : undefined}
    >
      {props.loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          loading...
        </>
      ) : (
        props.label
      )}
    </Button>
  );
}
