import { Card } from "@mui/joy";
import NexCiteButton from "@rms/components/button/nexcite-button";
import Authorized from "@rms/components/other/authorized";
import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import getAuth from "@rms/service/user-service";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function page() {
  const info = await getAuth();

  const user = await prisma.user.findFirst({
    where: { id: info.user.id, config_id: info.config.id },
    include: { role: true },
  });

  return (
    <Card className="m-auto max-w-[350px] hadow-sm border p-5 w-full ">
      <div className="flex gap-6    justify-between">
        <Image
          src={`/api/media/${info.config.logo}`}
          alt={info.config.name}
          width={100}
          height={100}
          className="rounded-full  h-[90px] w-[90px] border object-cover"
        />
        <div className="flex flex-col justify-between items-start w-full">
          <div className="flex  justify-center items-start gap-1">
            <h1 className="text-2xl">
              {user.first_name} {user.last_name}
            </h1>
            <h2 className="text-sm">{user.type}</h2>
          </div>

          <h3 className="opacity-90">@{user.username}</h3>
          <Authorized permission="Update_Profile" className="w-full">
            <Link href={`/admin/setting/user/form?id=${info.user.id}`}>
              {" "}
              <NexCiteButton className="bg-black w-full text-white p-2 rounded-md text-center inline-block">
                Edit
              </NexCiteButton>
            </Link>
          </Authorized>
        </div>
      </div>
      <hr className="mt-5" />

      <div className="flex flex-col gap-3 mt-6">
        <div className="flex justify-between items-center ">
          <h1 className="text-lg">Role</h1>
          <h1 className="text-lg">{user.role.name}</h1>
        </div>

        <div className="flex justify-between items-center ">
          <h1 className="text-lg">Create Date</h1>
          <h1 className="text-lg">{user.create_date.toDateString()}</h1>
        </div>
        <div className="flex justify-between items-center ">
          <h1 className="text-lg">Modified Date</h1>
          <h1 className="text-lg">{user.modified_date.toDateString()}</h1>
        </div>
      </div>
    </Card>
  );
}
