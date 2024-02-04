"use client";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import { Prisma } from "@prisma/client";
import Authorized from "@nexcite/components/other/Authorized";
import { useToast } from "@nexcite/hooks/toast-hook";
import {
  deleteEmployeeById,
  resetEmployee,
} from "@nexcite/service/employee-service";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useTransition } from "react";

type Props = {
  employees: Prisma.EmployeeGetPayload<{}>[];
};

export default function EmployeesTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();

  const toast = useToast();

  const columns = useMemo<MRT_ColumnDef<Prisma.EmployeeGetPayload<{}>>[]>(
    () => [
      {
        header: "Status",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "status",
      },

      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "id",
        header: "ID",
        Cell: ({ row: { original } }) => (
          <div
            className={`text-center rounded-sm ${
              original.status === "Deleted"
                ? "bg-red-500"
                : original.create_date.toLocaleTimeString() !==
                  original.modified_date.toLocaleTimeString()
                ? "bg-yellow-400"
                : ""
            }`}
          >
            {original.id}
          </div>
        ),
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "username",
        header: "UserName",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "first_name",
        header: "First Name",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "last_name",
        header: "Last Name",
      },

      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "phone_number",
        header: "Phone number",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "email",
        header: "Email",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "gender",
        header: "Gender",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "country",
        header: "Country",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "address1",
        header: "Address 1",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "address2",
        header: "Address 2",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "create_date",
        header: "Create Date",
        accessorFn: (e) => e.create_date.toLocaleDateString(),
      },

      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "modified_date",
        header: "Modified Date",
        accessorFn: (e) => e.modified_date.toLocaleDateString(),
      },
    ],
    []
  );

  return (
    <div>
      <Card variant="outlined">
        <CardHeader
          title={<Typography variant="h5">Employee Table</Typography>}
        />

        <MaterialReactTable
          initialState={{ pagination: { pageSize: 100, pageIndex: 0 } }}
          state={{ showProgressBars: isPadding }}
          columns={columns}
          data={props.employees}
          enableRowActions
          renderRowActionMenuItems={({
            row: {
              original: { id, username },
            },
          }) => [
            <Authorized permission="Update_Employee" key={1}>
              <Link href={pathName + "/form?id=" + id}>
                <MenuItem className="cursor-pointer" disabled={isPadding}>
                  Edit
                </MenuItem>
              </Link>
            </Authorized>,
            <Authorized permission="View_Employee" key={1}>
              <Link href={pathName + "/" + id}>
                <MenuItem className="cursor-pointer" disabled={isPadding}>
                  View
                </MenuItem>
              </Link>
            </Authorized>,
            <Authorized permission={"Reset"} key={2}>
              <MenuItem
                disabled={isPadding}
                className="cursor-pointer"
                onClick={() => {
                  const isConfirm = confirm(
                    `Do You sure you want to reset ${username} id:${id} `
                  );
                  if (isConfirm) {
                    setTransition(async () => {
                      const result = await resetEmployee(id);

                      toast.OpenAlert(result);
                    });
                  }
                }}
              >
                {isPadding ? <> reseting...</> : "Reset"}
              </MenuItem>
            </Authorized>,
            <Authorized permission="Delete_Employee" key={3}>
              <MenuItem
                disabled={isPadding}
                className="cursor-pointer"
                onClick={() => {
                  const isConfirm = confirm(
                    `Do You sure you want to delete ${username} id:${id} `
                  );
                  if (isConfirm) {
                    setTransition(async () => {
                      const result = await deleteEmployeeById(id);

                      toast.OpenAlert(result);
                    });
                  }
                }}
              >
                {isPadding ? <> deleting...</> : "Delete"}
              </MenuItem>
            </Authorized>,
          ]}
        />
      </Card>
    </div>
  );
}
