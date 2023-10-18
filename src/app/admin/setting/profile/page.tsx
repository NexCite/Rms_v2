import Authorized from "@rms/components/ui/authorized";
import { getUserInfo } from "@rms/lib/auth";
import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function page() {
  const config = await prisma.config.findFirst();
  const userInfo = await getUserInfo();
  const config_id = await getConfigId();

  const user = await prisma.user.findFirst({
    where: { id: userInfo.id, config_id },
  });

  return (
    <div className="m-auto max-w-max hadow-sm border p-5 ">
      <div className="flex gap-6  s ">
        <Image
          src={`/api/media/${config.logo}`}
          alt={config.name}
          width={100}
          height={100}
          className="rounded-full"
        />
        <div className="flex flex-col justify-between items-start ">
          <div className="flex  justify-center items-start gap-1">
            <h1 className="text-2xl">
              {user.first_name} {user.last_name}
            </h1>
            <h2 className="text-sm">{user.type}</h2>
          </div>

          <h3 className="opacity-90">@{user.username}</h3>
          <Authorized permission="Edit_Profile" className="w-full">
            <Link
              href={`/admin/setting/user/form?id=${userInfo.id}`}
              className="bg-black w-full text-white p-2 rounded-md text-center inline-block"
            >
              Edit
            </Link>
          </Authorized>
        </div>
      </div>
      <hr className="mt-5" />

      <div className="flex flex-col gap-3 mt-6">
        <div className="flex justify-between items-center ">
          <h1 className="text-lg">Country</h1>
          <h1 className="text-lg">{user.country}</h1>
        </div>
        <div className="flex justify-between items-center ">
          <h1 className="text-lg">Address1</h1>
          <h1 className="text-lg">{user.address1}</h1>
        </div>
        <div className="flex justify-between items-center ">
          <h1 className="text-lg">Address2</h1>
          <h1 className="text-lg">{user.address2}</h1>
        </div>
        <div className="flex justify-between items-center ">
          <h1 className="text-lg">Gender</h1>
          <h1 className="text-lg">{user.gender}</h1>
        </div>
        <div className="flex justify-between items-center ">
          <h1 className="text-lg">Phone Number</h1>
          <h1 className="text-lg">{user.phone_number}</h1>
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
    </div>
  );
}
