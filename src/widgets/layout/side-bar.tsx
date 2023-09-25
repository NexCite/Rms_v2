"use client";
import React from "react";

import RouteModel from "@rms/models/RouteModel";

import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Accordion,
  AccordionHeader,
  AccordionBody,
  Alert,
} from "@material-tailwind/react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Props = {
  routers: RouteModel[];
  config: {
    logo: string;
    name: string;
  };
};
export function Sidebar(props: Props) {
  const pathName = usePathname();

  const handleOpen = (value) => {
    setOpen(open === value ? -1 : value);
  };

  const [open, setOpen] = React.useState(
    props.routers.find((res) => pathName.startsWith(res.path))?.index ?? -1
  );

  return (
    <Card className="h-full w-full p-3">
      <div className="flex flex-col items-center">
        <Image
          src={`/api/media/${props.config.logo}`}
          alt={props.config.name}
          width={100}
          height={100}
          className="rounded-full"
        />
      </div>
      <hr className="divide-x-0" />
      <List>
        {props.routers
          .filter((res) => !res.end)
          .map((res, i) =>
            res.children.length === 0 ? (
              <></>
            ) : (
              <Accordion
                key={res.title}
                open={open === res.index}
                icon={
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`mx-auto h-4 w-4 transition-transform ${
                      open === res.index ? "rotate-180" : ""
                    }`}
                  />
                }
              >
                <ListItem className="p-0" selected={open === res.index}>
                  <div>{res.icon}</div>
                  <AccordionHeader
                    onClick={() => handleOpen(res.index)}
                    className="border-b-0 p-3 "
                  >
                    <Typography
                      color="blue-gray"
                      className="mr-auto font-normal"
                    >
                      {res.title}
                    </Typography>
                  </AccordionHeader>
                </ListItem>
                <AccordionBody className="py-1">
                  <List className="p-0" key={res.index}>
                    {res.children
                      .filter((res) => !res.hide)
                      .map((res) => (
                        <Link as={res.path} href={res.path} key={i}>
                          <ListItem
                            className={
                              pathName === res.path
                                ? "dark:bg-white dark:text-black bg-black text-white"
                                : "hover:text-white hover:bg-black"
                            }
                          >
                            {res.title}
                          </ListItem>
                        </Link>
                      ))}
                  </List>
                </AccordionBody>
              </Accordion>
            )
          )}
      </List>
      <List className="mt-auto">
        {props.routers
          .filter((res) => res.end)
          .map((res, i) =>
            res.children.length === 0 ? (
              <></>
            ) : (
              <Accordion
                key={res.title}
                open={open === res.index}
                icon={
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`mx-auto h-4 w-4 transition-transform ${
                      open === res.index ? "rotate-180" : ""
                    }`}
                  />
                }
              >
                <ListItem className="p-0" selected={open === res.index}>
                  <div>{res.icon}</div>
                  <AccordionHeader
                    onClick={() => handleOpen(res.index)}
                    className="border-b-0 p-3 "
                  >
                    <Typography
                      color="blue-gray"
                      className="mr-auto font-normal"
                    >
                      {res.title}
                    </Typography>
                  </AccordionHeader>
                </ListItem>
                <AccordionBody className="py-1">
                  <List className="p-0" key={res.index}>
                    {res.children
                      .filter((res) => !res.hide)
                      .map((res) => (
                        <Link as={res.path} href={res.path} key={i}>
                          <ListItem
                            className={
                              pathName === res.path
                                ? "dark:bg-white dark:text-black bg-black text-white"
                                : "hover:text-white hover:bg-black"
                            }
                          >
                            {res.title}
                          </ListItem>
                        </Link>
                      ))}
                  </List>
                </AccordionBody>
              </Accordion>
            )
          )}
      </List>
    </Card>
  );
}

// export default function SideBar(props: Props) {
//   const pathName = usePathname();

//   return props.route?.children ? (
//     <Style className=" w-full max-h-full">
//       <ul style={{ overflow: "auto" }}>
//         {props.route.children
//           .filter((res) => !res.hide)
//           .sort((a, b) => a.index - b.index)
//           .map((res) => (
//             <li key={res.title}>
//               <Link
//                 href={res.path}
//                 id={pathName.startsWith(res.path) ? "active" : undefined}
//               >
//                 <h1>{res.title}</h1>
//               </Link>
//             </li>
//           ))}
//       </ul>

//       <div className="divide-y-2 w-full" />
//     </Style>
//   ) : (
//     <div></div>
//   );
// }

// const Style = styled.div`
//   display: flex;
//   justify-content: start;
//   align-items: start;
//   flex-direction: column;
//   box-shadow: rgb(8 8 8 / 15%) 1px 0px 0px;
//   height: 85dvh;

//   width: 150px;
//   gap: 7px;

//   ul {
//     gap: 7px;
//     height: 100%;
//     margin: auto;
//     text-align: center;
//     padding: 5px;
//     list-style: none;
//     display: flex;
//     flex-direction: column;
//     width: 150px;
//     align-items: center;

//     li {
//       display: flex;

//       width: 100%;
//       border-radius: 0.25rem;

//       #active {
//         background-color: #000000;

//         h1 {
//           color: #ffffff;
//         }
//         svg {
//           color: #fefefe;
//         }
//       }
//       :hover {
//         background-color: #000000;

//         h1 {
//           color: #ffffff;
//         }
//         svg {
//           color: #fefefe;
//         }
//       }
//       a {
//         width: 100%;
//         padding: 14px;
//         border-radius: 0.25rem;

//         #active {
//           background-color: #000000;

//           h1 {
//             color: #ffffff;
//           }
//           svg {
//             color: #fefefe;
//           }
//         }
//         display: flex;
//         align-items: center;
//         gap: 6px;
//         text-decoration: none;
//         svg {
//           color: black;
//         }
//         h1 {
//           text-shadow: 0px 0px 1px #0000007a;
//           width: 100%;
//           align-items: center;
//           font-size: 12pt;
//           color: #000000d2;
//         }
//       }
//     }
//   }
// `;
