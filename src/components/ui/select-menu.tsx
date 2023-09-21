import React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@rms/components/ui/select";
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
    <Select
      defaultValue={value}
      onValueChange={(e) => {
        props.onChange(e);
        setValue(e);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={props.hit} />
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
  );
}
