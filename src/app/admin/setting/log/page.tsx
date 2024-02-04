import { getLogs } from "@nexcite/service/log-service";
import LogTable from "@nexcite/widgets/table/log-table";
import React from "react";

export default async function page(props: {
  params: {};
  searchParams: {
    date?: string;

    user_id?: string;
  };
}) {
  var date: Date | undefined = undefined,
    user_id: number | undefined = undefined;
  if (!Number.isNaN(+props.searchParams.user_id)) {
    user_id = +props.searchParams.user_id;
  }
  if (!Number.isNaN(+props.searchParams.date)) {
    date = new Date(+props.searchParams.date);
  }

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <LogTable
        date={date}
        data={(await getLogs({ date: date, user_id: user_id })).result}
      />{" "}
    </div>
  );
}
