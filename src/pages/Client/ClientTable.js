


import React from "react";
import dynamic from "next/dynamic";

// charts import
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// @material-tailwind/react
import {
  Button,
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Input,
  TypographyProps,
} from "@material-tailwind/react";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  DocumentMagnifyingGlassIcon,
  FlagIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";

// deepmerge
import merge from "deepmerge";

// area chart
interface ChartsPropsType {
  height: number;
  series: object[];
  options: object;
}

function AreaChart({
  height = 90,
  series,
  colors,
  options,
}: Partial<ChartsPropsType> & {
  colors: string | string[];
}) {
  const chartOptions = React.useMemo(
    () => ({
      colors,
      ...merge(
        {
          chart: {
            height: height,
            type: "area",
            zoom: {
              enabled: false,
            },
            toolbar: {
              show: false,
            },
          },
          title: {
            show: "",
          },
          dataLabels: {
            enabled: false,
          },
          legend: {
            show: false,
          },
          markers: {
            size: 0,
            strokeWidth: 0,
            strokeColors: "transparent",
          },
          stroke: {
            curve: "smooth",
            width: 2,
          },
          grid: {
            show: false,
            xaxis: {
              lines: {
                show: false,
              },
            },
            padding: {
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            },
          },
          tooltip: {
            theme: "light",
          },
          yaxis: {
            labels: {
              show: false,
            },
          },
          xaxis: {
            axisTicks: {
              show: false,
            },
            axisBorder: {
              show: false,
            },
            labels: {
              show: false,
            },
          },
          fill: {
            type: "gradient",
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.4,
              opacityTo: 0.6,
              stops: [0, 100],
            },
          },
        },
        options ? options : {}
      ),
    }),
    [height, colors, options]
  );

  return (
    <Chart
      type="area"
      height={height}
      series={series as ApexAxisChartSeries}
      options={chartOptions as any}
    />
  );
}

const TABLE_ROW = [
  {
    img: "/logos/btc.png",
    digitalAsset: "BTC",
    detail: "Bitcoin",
    price: "$46,727.30",
    change: "+2.92%",
    volume: "$45.31B",
    market: "$915.61B",
    color: "green",
    trend: 4,
  },
  {
    img: "/logos/eth.png",
    digitalAsset: "ETH",
    detail: "Ethereum",
    price: "$2,609.30",
    change: "+6.80%",
    volume: "$23.42B",
    market: "$313.58B",
    color: "green",
  },
  {
    img: "/logos/usdt.png",
    digitalAsset: "USDT",
    detail: "TetherUS",
    price: "$1.00",
    change: "-0.01%",
    volume: "$94.37B",
    market: "$40,600",
    color: "red",
  },
  {
    img: "/logos/sol.png",
    digitalAsset: "SOL",
    detail: "Solana",
    price: "$1.00",
    change: "+6.35%",
    volume: "$3.48B",
    market: "$43.26B",
    color: "green",
  },
  {
    img: "/logos/xrp.png",
    digitalAsset: "XRP",
    detail: "Ripple",
    price: "$100.19",
    change: "-0.95%",
    volume: "$1.81B",
    market: "$32.45B",
    color: "red",
  },
];

const TABLE_HEAD = [
  {
    head: "Digital Asset",
    customeStyle: "!text-left",
  },
  {
    head: "Price",
    customeStyle: "text-right",
  },
  {
    head: "Change",
    customeStyle: "text-right",
  },
  {
    head: "Volume",
    customeStyle: "text-right",
  },
  {
    head: "Market Cap",
    customeStyle: "text-right",
  },
  {
    head: "Trend",
    customeStyle: "text-right",
  },
  {
    head: "Actions",
    customeStyle: "text-right",
  },
];

function TablesExample8() {
  return (
    <section className="m-10">
      <Card className="h-full w-full">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none flex flex-wrap gap-4 justify-between mb-4"
        >
          <div>
            <Typography variant="h6" color="blue-gray">
              Cryptocurrency Market Overview
            </Typography>
            <Typography
              variant="small"
              className="text-gray-600 font-normal mt-1"
            >
              Compare different cryptocurrencies, and make informed investment.
            </Typography>
          </div>
          <div className="flex items-center w-full shrink-0 gap-4 md:w-max">
            <div className="w-full md:w-72">
              <Input
                size="lg"
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <Button
              variant="outlined"
              className="flex items-center gap-2"
            >
              24h
              <ChevronDownIcon strokeWidth={3} className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardBody className="overflow-scroll !px-0 py-2">
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr>
                {TABLE_HEAD.map(({ head, customeStyle }) => (
                  <th
                    key={head}
                    className={`border-b border-gray-300 !p-4 pb-8 ${customeStyle}`}
                  >
                    <Typography
                      color="blue-gray"
                      variant="small"
                      className="!font-bold"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_ROW.map(
                (
                  {
                    img,
                    digitalAsset,
                    detail,
                    price,
                    change,
                    volume,
                    market,
                    color,
                  },
                  index
                ) => {
                  const isLast = index === TABLE_ROW.length - 1;
                  const classes = isLast
                    ? "!p-4"
                    : "!p-4 border-b border-gray-300";
                  return (
                    <tr key={digitalAsset}>
                      <td className={classes}>
                        <div className="flex items-center gap-4 text-left">
                          <img
                            src={img}
                            alt={digitalAsset}
                            className="border rounded-md p-1 h-10 w-10"
                          />
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="!font-semibold"
                            >
                              {digitalAsset}
                            </Typography>
                            <Typography
                              variant="small"
                              className="!font-normal text-gray-600"
                            >
                              {detail}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="!font-normal text-gray-600 text-right"
                        >
                          {price}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color={color as TypographyProps["color"]}
                          className="!font-bold text-right"
                        >
                          {change}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="!font-normal text-gray-600 text-right"
                        >
                          {volume}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="!font-normal text-gray-600 text-right"
                        >
                          {market}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <div className="max-w-[12rem] ml-auto h-12 -translate-y-6">
                          <AreaChart
                            colors={["#2196F373"]}
                            options={{}}
                            series={[
                              {
                                name: "2023 Sales",
                                data: [
                                  30, 40, 500, 420, 700, 350, 500, 330, 900,
                                ],
                              },
                            ]}
                          />
                        </div>
                      </td>
                      <td className={classes}>
                        <div className="flex justify-end gap-4">
                          <IconButton variant="text" size="sm">
                            <DocumentMagnifyingGlassIcon className="h-5 w-5 text-gray-900" />
                          </IconButton>
                          <IconButton variant="text" size="sm">
                            <FlagIcon className="h-5 w-5 text-gray-900" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </section>
  );
}

export default TablesExample8;