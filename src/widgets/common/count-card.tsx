"use client";

export default function CountCard(props: {
  label: string;
  count: number | string;
}) {
  return (
    <div
      className="flex w-64 justify-between p-5 items-center"
      style={{ border: "1.5px solid black", borderRadius: 3, minHeight: 80 }}
    >
      <span>{props.label}</span>

      <span>{props.count}</span>
    </div>
  );
}
