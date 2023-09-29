import { getLogs } from "@rms/service/log-service";
import { LogTable } from "@rms/widgets/table/log-table";
import React from "react";

export default async function page(props: {
  params: {};
  searchParams: {
    date?: string;

    user_id?: string;
    page: string;
  };
}) {
  var date: Date | undefined = undefined,
    user_id: number | undefined = undefined,
    page: number | undefined = undefined;
  if (!Number.isNaN(+props.searchParams.user_id)) {
    user_id = +props.searchParams.user_id;
  }
  if (!Number.isNaN(+props.searchParams.date)) {
    date = new Date(props.searchParams.date);
  }
  if (!Number.isNaN(+props.searchParams.page)) {
    page = +props.searchParams.page;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <LogTable
        data={
          (await getLogs({ date: date, page: page, user_id: user_id })).result
        }
      />{" "}
    </div>
  );
}
