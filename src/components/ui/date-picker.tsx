import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@rms/lib/utils";
import format from "date-fns/format";
import { Calendar } from "./calendar";

type Props = {
  default?: Date;
  onChange: (e?: Date) => void;
  maxDate?: Date;
  minDate?: Date;
};

export default function DatePicker(props: Props) {
  const [value, setValue] = useState<Date | undefined>(props.default);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal ",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>From Date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white">
        <Calendar
          fromDate={props.minDate}
          toDate={props.maxDate}
          mode="single"
          selected={value}
          onSelect={(e) => {
            setValue(e);
            props.onChange(e);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
