import type { CustomChartData } from "@/type/ChartData";
import { useMemo, type ReactNode } from "react";
import type { DefaultLegendContentProps, TooltipContentProps } from "recharts";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  type ReferenceAreaProps, // Import ReferenceAreaProps
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type { AxisInterval, AxisTick } from "recharts/types/util/types";

type CustomLineChartProps = CustomChartData & {
  xTicks?: readonly AxisTick[];
  tickLine?: boolean;
  interval?: AxisInterval;
  formatXAxis?: (value: any, index: number) => any;
  formatYAxis?: (value: string | number, index: number) => any;
  formatTooltipLabel?: (label?: string | number) => ReactNode;
  formatTooltipValue?: (value: any) => ReactNode; // Use ReferenceAreaProps directly
  referenceAreas?: ReferenceAreaProps[];
};

function CustomLineChart(props: CustomLineChartProps) {
  const data = useMemo(
    () =>
      props.xAxis.map((xa, i) => {
        const element: { [key: string]: number | string } = {
          _name: xa,
        };
        for (let d of props.data) {
          element[d.dataKey] = d.data[i];
        }
        return element;
      }),
    [props.data, props.xAxis],
  );

  const domain = useMemo(() => {
    if (props.min !== undefined && props.max !== undefined)
      return [props.min, props.max];
    if (props.min !== undefined) return [props.min];
    if (props.max !== undefined) return [props.max];
    return undefined;
  }, [props.min, props.max]);

  return (
    <ResponsiveContainer width={"100%"} height={"100%"}>
      <LineChart data={data}>
        <CartesianGrid stroke="#ccc" strokeDasharray="0" vertical={false} />

        <XAxis
          dataKey="_name"
          axisLine={false}
          padding={{ left: 30, right: 15 }}
          tickLine={props.tickLine ?? false}
          ticks={props.xTicks}
          interval={props.interval ?? 0}
          tickFormatter={props.formatXAxis}
          tick={{
            dy: 10,
            fontSize: 12,
            fontFamily: "arial",
            fill: "#000000",
          }}
        />

        {props.referenceAreas && props.referenceAreas.length > 0 && (
          <>
            {props.referenceAreas.map((ra, i) => (
              // @ts-expect-error
              <ReferenceArea
                key={`reference-area-${i}`}
                fill="#000"
                fillOpacity={0.1}
                {...ra}
              />
            ))}
          </>
        )}

        {/* <XAxis
          dataKey="_name"
          axisLine={false}
          padding={{ left: 30, right: 15 }}
          tickLine={false}
          tick={{ dy: 10, fontSize: 12, fontFamily: "arial", fill: "#000000" }}
          //   tickLine={false}
          //   ticks={props.xTicks}
          //   interval={0}
          //   tickFormatter={props.formatXAxis}
        /> */}
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fontFamily: "arial", fill: "#000000" }}
          tickFormatter={props.formatYAxis}
          domain={domain}
          ticks={props.yAxis}
        />
        <Tooltip
          content={(tooltipProps) =>
            renderTooltip({
              ...tooltipProps,
              formatTooltipLabel: props.formatTooltipLabel,
              formatTooltipValue: props.formatTooltipValue,
            })
          }
        />
        <Legend content={renderLegend} />
        {props.data.map((d) => (
          <Line
            key={d.dataKey}
            type="linear"
            dataKey={d.dataKey}
            stroke={d.color}
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// function renderLegend(payload?: readonly LegendPayload[]) {
function renderLegend({ payload }: DefaultLegendContentProps) {
  return (
    <ul className="mt-4 flex list-none justify-center gap-4">
      {payload &&
        payload.map((entry, index) => (
          <li
            key={`item-${index}`}
            className="mb-1 flex flex-wrap items-center"
          >
            {/* Rectangle with line color */}
            <div
              className="me-2 h-2.5 w-7.5"
              style={{
                backgroundColor: entry.color,
              }}
            ></div>
            {/* Data key */}
            <span className="text-sm capitalize">{entry.value}</span>
          </li>
        ))}
    </ul>
  );
}

function renderTooltip({
  active,
  payload,
  label,
  formatTooltipLabel,
  formatTooltipValue,
}: {
  formatTooltipLabel?: (label?: string | number) => ReactNode;
  formatTooltipValue?: (value: any) => ReactNode;
} & TooltipContentProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        {formatTooltipLabel ? formatTooltipLabel(label) : <p>{label}</p>}
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}:{" "}
            {formatTooltipValue ? formatTooltipValue(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
}

export default CustomLineChart;
