"use client";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Card,
  CardHeader,
  MenuItem,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Prisma } from "@prisma/client";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import { deleteVacationById } from "@rms/service/vacation-service";
import dayjs from "dayjs";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { DateRange } from "react-day-picker";
type CommonType = Prisma.VacationGetPayload<{
  include: {
    employee: {
      select: {
        id: true;
        first_name: true;
        last_name: true;
      };
    };
  };
}>;
type Props = {
  date?: [Date, Date];
  vacations: CommonType[];
  status: "Accepted" | "Pending" | "Deleted";
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
  };
}
export default function VacationTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();

  const store = useStore();

  const { push, replace } = useRouter();

  const [tabValue, setTabValue] = useState<"Accepted" | "Pending" | "Deleted">(
    props.status
  );

  const [selectDate, setSelectDate] = useState<DateRange>({
    from: props.date[0],
    to: props.date[1],
  });
  const replaceUrlPath = useCallback(
    (status?: string) => {
      setTransition(() => {
        replace(
          pathName +
            `?status=${
              status || "Pending"
            }&from_date=${selectDate?.from?.getTime()}&to_date=${selectDate?.to?.getTime()}`,
          {}
        );
      });
    },
    [replace, pathName, selectDate]
  );
  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      let status: "Accepted" | "Pending" | "Deleted";
      switch (newValue) {
        case 0: {
          status = "Accepted";
          break;
        }
        case 1: {
          status = "Pending";
          break;
        }
        case 2: {
          status = "Deleted";
          break;
        }
      }
      setTabValue(status);

      replaceUrlPath(status);
    },
    [replaceUrlPath]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setTransition(() => {
        replaceUrlPath();
      });
    },
    [replaceUrlPath]
  );

  const columns = useMemo<MRT_ColumnDef<CommonType>[]>(
    () => [
      {
        header: "Status",
        accessorKey: "status",
      },
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
                : (original as any).create_date?.toLocaleTimeString() !==
                  (original as any).modified_date?.toLocaleTimeString()
                ? "bg-yellow-400"
                : ""
            }`}
          >
            {original.id}
          </div>
        ),
      },
      {
        accessorKey: "employee",
        header: "Employee",
        columnDefType: "data",
        id: "employee",
        accessorFn: (p) => p.employee?.first_name + p.employee?.last_name,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "from_date",
        header: "Date From",
        columnDefType: "data",
        id: "from_date",
        accessorFn: (p) => p.from_date?.toLocaleDateString(),
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "to_date",
        header: "Date To",
        columnDefType: "data",
        id: "to_date",
        accessorFn: (p) => p.to_date?.toLocaleDateString(),
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "description",
        header: "Description",
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
    <div className="w-full">
      <Card>
        <CardHeader
          title={<Typography variant="h5">Vacation Table</Typography>}
        />

        <form
          className=" grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4  h-full  overflow-auto  justify-between rms-container p-5"
          onSubmit={handleSubmit}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              slotProps={{ textField: { size: "small" } }}
              label="From Date"
              defaultValue={dayjs(selectDate.from)}
              onChange={(e) => {
                setSelectDate((prev) => ({ ...prev, from: e?.toDate() }));
              }}
            />
            <DatePicker
              slotProps={{ textField: { size: "small" } }}
              label="To Date"
              defaultValue={dayjs(selectDate.to)}
              onChange={(e) => {
                setSelectDate((prev) => ({ ...prev, to: e?.toDate() }));
              }}
            />
          </LocalizationProvider>

          <LoadingButton
            variant="contained"
            className="hover:bg-blue-gray-900  hover:text-brown-50 capitalize bg-black text-white"
            disableElevation
            loadingIndicator="Loading…"
            loading={isPadding}
            type="submit"
          >
            Search
          </LoadingButton>
        </form>

        <div
          className="text-center pb-4"
          style={{
            width: 250,
            margin: "25px 10px 0px auto",
          }}
        >
          <div
            style={{
              fontSize: 20,
              backgroundColor: "#3c6097",
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              padding: "10px 0px",
              color: "white",
            }}
          >
            Total {tabValue}
          </div>

          <div
            className="font-bold p-3"
            style={{
              fontSize: 25,
              borderBottomLeftRadius: 6,
              borderBottomRightRadius: 6,
              border: "1px solid #194c99",
              borderTop: "0px",
              color: "#3c6097",
            }}
          >
            {props.vacations?.length || 0}
          </div>
        </div>

        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={
                tabValue === "Accepted" ? 0 : tabValue === "Pending" ? 1 : 2
              }
              onChange={handleTabChange}
            >
              {/* {statusArray.slice().map((item, index) => ( */}
              <Tab label={"Accepted"} {...a11yProps(1)} />
              <Tab label={"Pending"} {...a11yProps(2)} />
              <Tab label={"Deleted"} {...a11yProps(3)} />
              {/* ))} */}
            </Tabs>
          </Box>

          <MaterialReactTable
            state={{
              showProgressBars: false,
              showSkeletons: false,

              showLoadingOverlay: isPadding,
              isLoading: false,
            }}
            enableRowActions
            columns={columns as any}
            renderRowActionMenuItems={({
              row: {
                original: { id },
              },
            }) => [
              <Authorized permission="Edit_Vacation" key={1}>
                <Link href={pathName + "/form?id=" + id}>
                  <MenuItem className="cursor-pointer" disabled={isPadding}>
                    Edit
                  </MenuItem>
                </Link>
              </Authorized>,
              <Authorized permission="View_Vacation" key={2}>
                <Link href={pathName + "/" + id}>
                  <MenuItem className="cursor-pointer" disabled={isPadding}>
                    View
                  </MenuItem>
                </Link>
              </Authorized>,
              <Authorized permission="Delete_Vacation" key={3}>
                <MenuItem
                  disabled={isPadding}
                  className="cursor-pointer"
                  onClick={() => {
                    const isConfirm = confirm(
                      `Do You sure you want to delete vacation id:${id} `
                    );
                    if (isConfirm) {
                      setTransition(async () => {
                        const result = await deleteVacationById(id);

                        store.OpenAlert(result);
                      });
                    }
                  }}
                >
                  {isPadding ? <> deleting...</> : "Delete"}
                </MenuItem>
              </Authorized>,
            ]}
            data={props.vacations}
          />
        </Box>
      </Card>
    </div>
  );
}
