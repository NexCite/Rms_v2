"use client";
import { Tab, Tabs } from "@mui/material";
import { Prisma } from "@prisma/client";
import React, { useMemo, useState } from "react";
import { MdTableChart } from "react-icons/md";
import TableViewIcon from "@mui/icons-material/TableView";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import GroupIcon from "@mui/icons-material/Group";
import TabPanel from "@mui/lab/TabPanel";
import ChartOfAccountTable from "../table/chart-of-account-table";
import ChartOfAccountAccountsTable from "../table/char-of-account-table-account";
import { AccountGrouped } from "@rms/lib/global";

type Props = {};

export default function ChartOfAccountView(props: Props) {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <>
      <Tabs
        value={tabIndex}
        onChange={(e, i) => {
          setTabIndex(i);
        }}
      >
        <Tab
          icon={<TableViewIcon />}
          iconPosition="start"
          label="Chart Of Account"
          value={0}
        />
        <Tab
          iconPosition="start"
          icon={<GroupIcon />}
          label="Clients"
          value={1}
        />
        <Tab
          icon={<PersonAddIcon />}
          iconPosition="start"
          label="IB's"
          value={2}
        />
        <Tab
          icon={<AssignmentReturnIcon />}
          iconPosition="start"
          label="Suppliers"
          value={3}
        />{" "}
        <Tab
          icon={<AssignmentReturnIcon />}
          iconPosition="start"
          label="Employee"
          value={4}
        />
      </Tabs>
      <div style={{ display: tabIndex === 0 ? "block" : "none" }}>
        <ChartOfAccountTable />
      </div>
      <div style={{ display: tabIndex === 1 ? "block" : "none" }}>
        <ChartOfAccountAccountsTable node={"Client"} />
      </div>
      <div style={{ display: tabIndex === 2 ? "block" : "none" }}>
        <ChartOfAccountAccountsTable node={"IB"} />
      </div>
      <div style={{ display: tabIndex === 3 ? "block" : "none" }}>
        <ChartOfAccountAccountsTable node={"Supplier"} />
      </div>
      <div style={{ display: tabIndex === 4 ? "block" : "none" }}>
        <ChartOfAccountAccountsTable node={"Employee"} />
      </div>
    </>
  );
}
