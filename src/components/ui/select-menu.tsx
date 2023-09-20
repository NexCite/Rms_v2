import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@radix-ui/react-select";
import React from "react";

type Props = {
  data: string[];
  label: string;
  hit: string;
  onChange: (e: string) => void;
  default?: string;
  name?: string;
};
export default function SelectMenu(props: Props) {
  const [value, setValue] = React.useState<string>(props.default);

  return (
    <div>
      <Select
        defaultValue={value}
        onValueChange={(e) => {
          props.onChange(e);
          setValue(e);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{props.label}</SelectLabel>
            {props.data.map((res) => (
              <SelectItem key={res} value={res}>
                {res}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
