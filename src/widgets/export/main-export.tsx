"use client";

import Image from "next/image";
import React, { useCallback, useMemo } from "react";

import styled from "@emotion/styled";
import { FormatNumberWithFixed } from "@rms/lib/global";

import { Prisma } from "@prisma/client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@rms/components/ui/tabs";
import BackButton from "@rms/components/ui/back-button";
import { Button } from "@rms/components/ui/button";

type Props = {
  config: {
    logo: string;
    name: string;
    phone_number: string;
  };
  user: {
    first_name: string;
    last_name: string;
  };
  entry: Prisma.EntryGetPayload<{
    include: {
      currency: true;
      sub_entries: {
        include: {
          account_entry: true;
          entry: true;
          two_digit: true;

          three_digit: true;
          more_than_four_digit: true;
        };
      };
    };
  }>;
};
export default function MainExport(props: Props) {
  const handlePdf = useCallback(async () => {
    const actionDiv = document.getElementById("export-pdf");
    actionDiv.style.display = "none";

    print();

    actionDiv.style.display = "block";
  }, []);
  return (
    <Style>
      <Tabs defaultValue="1">
        <div id="export-pdf">
          <div id="action">
            <Button className="bg-black" color="dark" onClick={handlePdf}>
              Export
            </Button>
          </div>
          <TabsList id="export-tabs">
            <TabsTrigger value="1">Design 1</TabsTrigger>
            <TabsTrigger value="2">Design 2</TabsTrigger>
            <TabsTrigger value="3">Design 3</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="1" className="mt-5">
          <Tab1 {...props} />
        </TabsContent>

        <TabsContent value="2" className="mt-5">
          <Tab2 {...props} />
        </TabsContent>

        <TabsContent value="3" className="mt-5">
          <Tab3 {...props} />
        </TabsContent>
      </Tabs>
    </Style>
  );
}
const Style = styled.div`
  #action {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    justify-content: space-between;
  }

  width: 100%;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 9999999999;
  background-color: white;
  padding: 10px;
  margin: auto;
`;

const Style1 = styled.div`
  .by {
    div {
      width: 33%;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
`;
const Style2 = styled.div`
  h1 {
    font-size: 16pt;
  }
`;
function Tab2(props: Props) {
  const amount = useMemo(() => {
    var a = 0;
    props.entry.sub_entries.forEach((e) => {
      if (e.type === "Debit") {
        a += e.amount;
      }
    });
    return props.entry.currency.symbol + FormatNumberWithFixed(a);
  }, [props.entry.sub_entries, props.entry.currency.symbol]);
  return (
    <Style2 className="font-mono">
      <div className={"bg-center flex items-center"}>
        <Image
          src={`/api/media/${props.config.logo}`}
          width={80}
          height={80}
          style={{ borderRadius: "50%" }}
          alt="logo"
        />
        <h1 contentEditable className="text-4xl ">
          {props.config.name}
        </h1>
      </div>
      <div
        dir="auto"
        className="flex justify-center flex-col w-full items-center  titles"
      >
        <h1>سند صرف</h1>
        <h1>سند صرف رقم {props.entry.id}</h1>

        <h1>Payment Voucher</h1>
      </div>
      <div className="flex justify-between items-center">
        <h2>Date: {props.entry.to_date.toLocaleDateString()}</h2>
        <h2 dir="auto">التاريخ: {props.entry.to_date.toLocaleDateString()}</h2>
      </div>
      <div className="flex justify-center" dir="auto">
        <p>{props.entry.description}</p>
      </div>
      <h1 className="w-full text-[10pt] mt-10" dir="ltr">
        Amount: {amount}
      </h1>
      <div>
        <div className="flex justify-around mt-10 gap-20">
          <div>
            <h2 className="text-center">توقيع المدير</h2>

            <h2 className="text-center">Manager Sign</h2>
          </div>
          <div>
            <h2 className="text-center">المستلم</h2>
            <h2 className="text-center">Received By</h2>
            <h2 className="text-center" contentEditable>
              type here{" "}
            </h2>
          </div>
          <div>
            <h2 className="text-center">أعداد</h2>
            <h2 className="text-center">Prepared By</h2>
            <h2 className="text-center">
              {props.user.first_name} {props.user.last_name}
            </h2>{" "}
          </div>
        </div>
      </div>
    </Style2>
  );
}
function Tab3(props: Props) {
  const amount = useMemo(() => {
    var a = 0;
    props.entry.sub_entries.forEach((e) => {
      if (e.type === "Debit") {
        a += e.amount;
      }
    });
    return props.entry.currency.symbol + FormatNumberWithFixed(a);
  }, [props.entry.currency.symbol, props.entry.sub_entries]);
  return (
    <Style2 className="font-mono">
      <div className={"bg-center flex items-center"}>
        <Image
          src={`/api/media/${props.config.logo}`}
          width={80}
          height={80}
          style={{ borderRadius: "50%" }}
          alt="logo"
        />
        <h1 contentEditable className="text-4xl ">
          {props.config.name}
        </h1>
      </div>
      <div
        dir="auto"
        className="flex justify-center flex-col w-full items-center  titles"
      >
        <h1>سند صرف</h1>
        <h1>سند قبض رقم {props.entry.id}</h1>

        <h1>Receipt Voucher</h1>
      </div>
      <div className="flex justify-between items-center">
        <h2>Date: {props.entry.to_date.toLocaleDateString()}</h2>
        <h2 dir="auto">التاريخ: {props.entry.to_date.toLocaleDateString()}</h2>
      </div>
      <div className="flex justify-center" dir="auto">
        <p>{props.entry.description}</p>
      </div>
      <h1 className="w-full text-[10pt] mt-10" dir="ltr">
        Amount: {amount}
      </h1>
      <div>
        <div className="flex justify-around mt-10 gap-20">
          <div>
            <h2 className="text-center">توقيع المدير</h2>

            <h2 className="text-center">Manager Sign</h2>
          </div>
          <div>
            <h2 className="text-center">المستلم</h2>
            <h2 className="text-center">Received By</h2>
            <h2 className="text-center" contentEditable>
              type here{" "}
            </h2>
          </div>
          <div>
            <h2 className="text-center">أعداد</h2>
            <h2 className="text-center">Prepared By</h2>
            <h2 className="text-center">
              {props.user.first_name} {props.user.last_name}
            </h2>{" "}
          </div>
        </div>
      </div>
    </Style2>
  );
}

function Tab1(props: Props) {
  const amount = useMemo(() => {
    var a = 0;
    props.entry.sub_entries.forEach((e) => {
      if (e.type === "Debit") {
        a += e.amount;
      }
    });
    return props.entry.currency.symbol + FormatNumberWithFixed(a);
  }, [props.entry.currency.symbol, props.entry.sub_entries]);
  return (
    <Style1 className="font-mono">
      <div id="pdf">
        <div className="flex items-center justify-between">
          <div className={"bg-center flex items-center"}>
            <Image
              src={`/api/media/${props.config.logo}`}
              width={80}
              height={80}
              style={{ borderRadius: "50%" }}
              alt="logo"
            />
            <h1 contentEditable className="text-4xl ">
              {props.config.name}
            </h1>
          </div>
          <div className="flex flex-col">
            <h1 className=" text-lg text-end">#{props.entry.id}</h1>
            <h1 className=" text-lg text-end">
              {props.entry.to_date.toLocaleDateString()}
            </h1>
            <h1 className=" text-lg text-end" contentEditable>
              {props.config.phone_number}
            </h1>
          </div>
        </div>
        <hr className="my-12 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />

        <h1 dir="auto" className="mb-10 text-xl">
          {props.entry.title}
        </h1>
        <h1
          className="mb-10 text-center  text-xl"
          dir="auto"
          style={{ border: "solid black 1px", padding: 10 }}
        >
          {props.entry.description}
        </h1>

        <h1 className="flex items-center gap-10">
          <span style={{ fontSize: "17pt" }}>Amount:</span>
          <span style={{ fontSize: "16pt", fontWeight: "bold" }}>{amount}</span>
        </h1>

        <div>
          <div className="flex justify-around mt-20 gap-20">
            <div>
              <h2 className="text-center">توقيع المدير</h2>

              <h2 className="text-center">Manager Sign</h2>
            </div>
            <div>
              <h2 className="text-center">المستلم</h2>
              <h2 className="text-center">Received By</h2>
              <h2 className="text-center" contentEditable>
                type here{" "}
              </h2>
            </div>
            <div>
              <h2 className="text-center">أعداد</h2>
              <h2 className="text-center">Prepared By</h2>
              <h2 className="text-center">
                {props.user.first_name} {props.user.last_name}
              </h2>{" "}
            </div>
          </div>
        </div>
      </div>
    </Style1>
  );
}
