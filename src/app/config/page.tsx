import { getUserInfo } from "@rms/lib/auth";
import { getConfig } from "@rms/service/config-service";
import ConfigWidget from "@rms/widgets/config/config-widget";
import { env } from "process";
import React from "react";

export default async function page(props: {
  params: {};
  searchParams: { key: string };
}) {
  if (props.searchParams.key !== env.CONFIG_KEY)
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <div className="animate-spin w-3">:( ):</div>
      </div>
    );

  // return <ConfigWidget value={await getConfig()}  user={await getUserInfo()}/>;
  return <div></div>;
}
