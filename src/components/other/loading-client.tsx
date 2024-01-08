"use client";
import React, { useEffect, useState } from "react";
import Loading from "../ui/loading";

export default function LoadingClient(props: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);
  return loading ? (
    <div className="w-full flex justify-center items-center my-10  ">
      <Loading />
    </div>
  ) : (
    props.children
  );
}
