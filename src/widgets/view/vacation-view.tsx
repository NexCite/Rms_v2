"use client";
import Authorized from "@rms/components/ui/authorized";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import {
  CardContent,
  CardHeader,
  Typography,
  Button,
  Card,
  Divider,
} from "@mui/material";

interface Props {
  value: Prisma.VacationGetPayload<{
    include: { media: true; employee: true };
  }>;
}

export default function VacationView(props: Props) {
  const vacation = useMemo(() => {
    return props.value;
  }, [props]);

  return (
    <Card className=" m-auto" style={{ maxWidth: 750 }}>
      <CardHeader
        title={
          <Typography variant="h5">{`(${vacation.employee_id}) ${vacation.employee.first_name} ${vacation.employee.last_name}`}</Typography>
        }
      />
      <CardContent className="">
        <div
          className="flex justify-between items-end"
          style={{ width: "100%" }}
        >
          <p>
            From:{vacation.from_date.toLocaleDateString()} - To:
            {vacation.to_date.toLocaleDateString()}
          </p>

          <Authorized className="w-fit" permission="Edit_Vacation">
            <Link
              href={`/admin/human_resources/vacation/form?id=${vacation.id}`}
            >
              <Button
                variant="contained"
                disableElevation
                className={
                  "hover:bg-blue-gray-900   hover:text-brown-50 capitalize bg-black text-white"
                }
              >
                Edit
              </Button>
            </Link>
          </Authorized>
        </div>

        <Divider className="mt-8 mb-8" />

        <div className="flex">
          <Image
            alt="Vacation Media"
            src={vacation.media?.path}
            width={200}
            height={320}
          />

          {vacation.description && (
            <div style={{ marginLeft: !vacation.media && "2em" }}>
              <p className="font-bold">Description</p>

              <p>{vacation.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
