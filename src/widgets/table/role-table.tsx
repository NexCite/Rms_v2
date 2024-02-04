"use client";

import { Prisma } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useMemo, useTransition } from "react";

import { MenuItem } from "@mui/material";
import NexCiteCard from "@nexcite/components/card/nexcite-card";
import Authorized from "@nexcite/components/other/authorized";
import { useToast } from "@nexcite/hooks/toast-hook";
import { deleteRoleById } from "@nexcite/service/role-service";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import Link from "next/link";

type Props = {
  data: Prisma.RoleGetPayload<{}>[];
};

export default function RoleTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();

  const toast = useToast();

  const columns = useMemo<MRT_ColumnDef<Prisma.RoleGetPayload<{}>>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "create_date",
        header: "Create Date",
        accessorFn: (e) => e.create_date.toLocaleDateString(),
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },

      {
        accessorKey: "modified_date",
        header: "Modified Date",
        accessorFn: (e) => e.modified_date.toLocaleDateString(),
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
    ],
    []
  );

  return (
    <NexCiteCard title="Role Table">
      <MaterialReactTable
        initialState={{ pagination: { pageSize: 100, pageIndex: 0 } }}
        state={{ showProgressBars: isPadding }}
        enableRowActions
        columns={columns}
        renderRowActionMenuItems={({
          row: {
            original: { id, name },
          },
        }) => [
          <Authorized permission="Update_Role" key={1}>
            <Link href={pathName + "/form?id=" + id}>
              <MenuItem className="cursor-pointer" disabled={isPadding}>
                Edit
              </MenuItem>
            </Link>
          </Authorized>,
          // <Authorized permission={"Reset"} key={2}>
          //   <MenuItem
          //     disabled={isPadding}
          //     className="cursor-pointer"
          //     onClick={() => {
          //       const isConfirm = confirm(
          //         `Do You sure you want to reset  ${name} id:${id} `
          //       );
          //       if (isConfirm) {
          //         setTransition(async () => {
          //           const result = await resetRole(id);

          //           toast.OpenAlert(result);
          //         });
          //       }
          //     }}
          //   >
          //     {isPadding ? <> reseting...</> : "Reset"}
          //   </MenuItem>
          // </Authorized>,
          <Authorized permission="Delete_Role" key={3}>
            <MenuItem
              disabled={isPadding}
              className="cursor-pointer"
              onClick={() => {
                const isConfirm = confirm(
                  `Do You sure you want to delete ${name} id:${id} `
                );
                if (isConfirm) {
                  setTransition(async () => {
                    var result = await deleteRoleById(id);

                    toast.OpenAlert(result);
                  });
                }
              }}
            >
              {isPadding ? <> deleting...</> : "Delete"}
            </MenuItem>
          </Authorized>,
        ]}
        data={props.data}
        enableGlobalFilter
      />
    </NexCiteCard>
  );
}
