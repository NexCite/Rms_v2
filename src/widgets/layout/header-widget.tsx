"use client";
import RouteModel from "@rms/models/RouteModel";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useRef } from "react";
import styled from "styled-components";
import SideBarWidget from "./side-bar-widget";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "@rms/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { ArrowDownIcon } from "lucide-react";
interface Props {
  route: RouteModel[];
  children: React.ReactNode;
  config: {
    logo: string;
    name: string;
  };
}
export default function HeaderWidget(props: Props) {
  const pathName = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, [scrollRef]);
  return (
    <SideBarStyle>
      <nav>
        <div id="logo">
          <Image
            src={`/api/media/${props.config.logo}`}
            width={100}
            height={100}
            alt="logo"
          />
          <h1>{props.config.name}</h1>
        </div>
        <ul style={{ overflow: "auto" }}>
          {props.route.map((res) => (
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
      </nav>
      <div className="divide-y-2 w-full" />
      <div id="layout">
        <SideBarWidget
          route={props.route.filter((res) => pathName.startsWith(res.path))[0]}
        />

        <main className="w-full">
          <div className="p-3" ref={scrollRef}>
            {props.children}
          </div>
        </main>

        <Button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-10 right-5 opacity-70 rounded-[50%] h-[50px] w-[50px] hover:opacity-100"
        >
          <ArrowDownIcon />
        </Button>
      </div>
    </SideBarStyle>
  );
}

const SideBarStyle = styled.div`
  display: flex;
  flex-direction: column;
  /* row-gap: 10px; */
  width: 100%;
  height: 99dvh;
  nav {
    box-shadow: rgb(8 8 8 / 15%) -1px 1px 0px;

    padding: 10px;
    /* padding: 15px 0px; */
    height: 115px;
    #logo {
      display: flex;
      align-items: center;
      img {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: contain;
      }
      h1 {
        text-shadow: 0px 0px 1px #0000007a;

        font-size: 20pt;
        font-weight: 500 !important;
      }
    }
    > ul {
      margin: 0px;
      padding: 0px;
      list-style: none;
      display: flex;
      flex-direction: row;
      column-gap: 5px;
      width: 100%;
      align-items: center;
      justify-content: center;
      li {
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

            font-size: 12pt;
            color: #000000d2;
          }
        }
      }
    }
  }
  #layout {
    display: flex;
  }
  main {
    height: 85vh;
    overflow-y: auto;
  }
`;
