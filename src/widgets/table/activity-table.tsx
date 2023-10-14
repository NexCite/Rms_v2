"use client";

import { Prisma } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import {
  deleteMoreDigit,
  deleteThreeDigit,
  deleteTwoDigit,
} from "@rms/service/digit-service";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useStore } from "@rms/hooks/toast-hook";
import { Activity } from "@rms/models/CommonModel";

type Props = {
  data:Activity[]
};

export default function DigitTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();

  const store = useStore();
  const { push } = useRouter();

  const columns = useMemo<MRT_ColumnDef<Activity>[]>(
    () =>
      [
        {
          accessorKey: "id",
          header: "ID",
          Cell: ({ row: { original } }) => (
            <div
              className={`text-center rounded-sm ${
                original.type === "Deleted"
                  ? "bg-red-500"
                  : original.create_date.toLocaleTimeString() !==
                    original.last_modified_date.toLocaleTimeString()
                  ? "bg-yellow-400"
                  : ""
              }`}
            >
              {original.id}
            </div>
          ),
        },

        {
          accessorKey: "name",
          header: "Name",
        },
        {
          accessorKey: "type",
          header: "Type",
        },
        {
          accessorKey: "debit_credit",
          header: "Debit/Credit",
        },
      ]
       ,
    []
  );
  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h5">
            {props.node === "two"
              ? "Two Digit And More"
              : props.node === "three"
              ? "Tree Digit And More "
              : "More Digit Then Four "}{" "}
            Table
          </Typography>
        }
      />

      <MaterialReactTable
        enableRowActions
        columns={columns}
        renderRowActionMenuItems={({
          row: {
            original: { id, username },
          },
        }) => [
          <Authorized
            key={1}
            permission={
              props.node === "two"
                ? "Edit_Two_Digit"
                : props.node === "three"
                ? "Edit_Three_Digit"
                : "Edit_More_Than_Four_Digit"
            }
          >
            <MenuItem
              onClick={() => push(pathName + "/form?id=" + id)}
              className="cursor-pointer"
              disabled={isActive}
            >
              Edit
            </MenuItem>
          </Authorized>,
          <Authorized
            key={2}
            permission={
              props.node === "two"
                ? "Delete_Two_Digit"
                : props.node === "three"
                ? "Delete_Three_Digit"
                : "Delete_More_Than_Four_Digit"
            }
          >
            <MenuItem
              disabled={isActive}
              className="cursor-pointer"
              onClick={() => {
                const isConfirm = confirm(
                  `Do You sure you want to delete ${username} id:${id} `
                );
                if (isConfirm) {
                  setActiveTransition(async () => {
                    const result =
                      props.node === "two"
                        ? await deleteTwoDigit(id)
                        : props.node === "three"
                        ? await deleteThreeDigit(id)
                        : await deleteMoreDigit(id);

                    store.OpenAlert(result);
                  });
                }
              }}
            >
              {isActive ? <> deleting...</> : "Delete"}
            </MenuItem>
          </Authorized>,
        ]}
        data={props.value[props.node]}
      />
    </Card>
  );
}
