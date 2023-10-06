"use client";
import { CommonRouteKeys } from "@rms/models/CommonModel";
import { useRouter } from "next/navigation";
import React from "react";
import styled from "@emotion/styled";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";
type Props = {
  node?: CommonRouteKeys;
  title?: string;
};
export default function BackButton(props: Props) {
  const { back } = useRouter();
  return (
    <Style>
      <Button
        onClick={() => back()}
        className="w-10 h-10 "
        variant="outline"
        size="icon"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </Style>
  );
}
const Style = styled.div`
  align-items: center;
  display: flex;
  #back-btn {
    color: white;
    :hover {
      background-color: "#010101c7";
      color: "white";
    }
  }
`;
