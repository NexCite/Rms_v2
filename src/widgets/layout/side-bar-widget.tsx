"use client";
import React from "react";
import { usePathname } from "next/navigation";
import styled from "styled-components";

import Link from "next/link";
import RouteModel from "@rms/models/RouteModel";

interface Props {
  route: RouteModel;
}
export default function SideBar(props: Props) {
  const pathName = usePathname();

  return props.route?.children ? (
    <Style className=" w-full max-h-full">
      <ul style={{ overflow: "auto" }}>
        {props.route.children
          .filter((res) => !res.hide)
          .sort((a, b) => a.index - b.index)
          .map((res) => (
            <li key={res.title}>
              <Link
                href={res.path}
                id={pathName.startsWith(res.path) ? "active" : undefined}
              >
                <h1>{res.title}</h1>
              </Link>
            </li>
          ))}
      </ul>

      <div className="divide-y-2 w-full" />
    </Style>
  ) : (
    <div></div>
  );
}

const Style = styled.div`
  display: flex;
  justify-content: start;
  align-items: start;
  flex-direction: column;
  box-shadow: rgb(8 8 8 / 15%) 1px 0px 0px;
  height: 85dvh;

  width: 150px;
  gap: 7px;

  ul {
    gap: 7px;
    height: 100%;
    margin: auto;
    text-align: center;
    padding: 5px;
    list-style: none;
    display: flex;
    flex-direction: column;
    width: 150px;
    align-items: center;

    li {
      display: flex;

      width: 100%;
      border-radius: 0.25rem;

      #active {
        background-color: #000000;

        h1 {
          color: #ffffff;
        }
        svg {
          color: #fefefe;
        }
      }
      :hover {
        background-color: #000000;

        h1 {
          color: #ffffff;
        }
        svg {
          color: #fefefe;
        }
      }
      a {
        width: 100%;
        padding: 14px;
        border-radius: 0.25rem;

        #active {
          background-color: #000000;

          h1 {
            color: #ffffff;
          }
          svg {
            color: #fefefe;
          }
        }
        display: flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
        svg {
          color: black;
        }
        h1 {
          text-shadow: 0px 0px 1px #0000007a;
          width: 100%;
          align-items: center;
          font-size: 12pt;
          color: #000000d2;
        }
      }
    }
  }
`;
