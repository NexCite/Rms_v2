"use client";

import { Prisma } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import { deleteCategoryById } from "@rms/service/category-service";
import { deleteSubCategoryById } from "@rms/service/sub-category-service";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { useStore } from "@rms/hooks/toast-hook";
import Link from "next/link";

type Props =
  | {
      node: "category";
      data: Prisma.CategoryGetPayload<{}>[];
    }
  | {
      node: "sub_category";
      data: Prisma.SubCategoryGetPayload<{}>[];
    };

export default function CategoryTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setPadding] = useTransition();

  const store = useStore();
  const { push } = useRouter();

  const columns = useMemo<MRT_ColumnDef<any>[]>(
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
    <Card>
      <CardHeader
        title={
          <Typography variant="h5">
            {props.node === "category" ? "Category" : "SubCategory"} Table
          </Typography>
        }
      ></CardHeader>
      <MaterialReactTable
        state={{ showProgressBars: isPadding }}
        enableRowActions
        columns={columns}
        renderRowActionMenuItems={({
          row: {
            original: { id, name },
          },
        }) => [
          <Authorized permission="Edit_Currency" key={1}>
            <Link href={pathName + "/form?id=" + id}>
              <MenuItem className="cursor-pointer" disabled={isPadding}>
                Edit
              </MenuItem>
            </Link>
          </Authorized>,

          <Authorized permission="Delete_Currency" key={3}>
            <MenuItem
              disabled={isPadding}
              className="cursor-pointer"
              onClick={() => {
                const isConfirm = confirm(
                  `Do You sure you want to delete ${name} id:${id} `
                );
                if (isConfirm) {
                  setPadding(async () => {
                    var result;
                    if (props.node === "category") {
                      result = await deleteCategoryById(id);
                    } else {
                      result = await deleteSubCategoryById(id);
                    }

                    store.OpenAlert(result);
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
    </Card>
  );
}
