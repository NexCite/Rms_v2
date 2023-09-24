import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "./button";
import { Check, ChevronsUpDown, XCircle } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command";
import { cn } from "@rms/lib/utils";
import { FormLabel } from "./form";
type Props = {
  data: any[];
  label: string;
  hit: string;
  onChange: (e: number) => void;
  default?: number;
  name?: string;
  disabled?: boolean;
};
export default function SearchSelect(props: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<number>(props.default);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={props.disabled}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value
              ? (() => {
                  var data = props.data.find((res) => value === res.id);

                  if (data?.symbol) {
                    return `${data?.symbol}`;
                  } else if (data?.name) {
                    return `${data.id} ${data.name}`;
                  } else if (data?.username) {
                    return `${data?.id} ${data?.username}`;
                  } else {
                    return undefined;
                  }
                })()
              : `Search ${props.label}`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="shadow-md w-full z-50 ">
          <Command className="w-full bg-white z-50">
            <CommandInput placeholder={`Search ${props.hit}`} />
            <CommandEmpty>No result.</CommandEmpty>
            <CommandGroup className="w-full p-0  max-h-[200px] overflow-y-auto bg-white z-50">
              {props.data.map((res, i) => (
                <CommandItem
                  key={i}
                  onSelect={(currentValue) => {
                    var ress = value === res.id ? undefined : res.id;
                    setValue(ress);
                    props.onChange(ress);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === res.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {res.symbol ? "" : res.id + " "}
                  {res.symbol ?? res.name ?? res.username}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
