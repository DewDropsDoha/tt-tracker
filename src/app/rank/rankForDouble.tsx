"use client";

import { Card, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "../match-tracker/Loading";

type PlayerRow = {
  name: string;
  seriesWin: number;
  seriesLose: number;
  totalSeriesPlayed: number;
  totalMatchPlayed: number;
  seriesLeft: number;
  wf?: number;
  rank?: number;
};

function Ranking() {
  const [isLoading, setIsLoading] = useState(true);
  const [tableRows, setTableRows] = useState<PlayerRow[]>([]);

  const tableHeaders = [
    "Name",
    "Rank",
    "Wf",
    "Series Win",
    "Series Lose",
    "Series Left",
    "Total Series Played",
    "Total Match Played",
  ];

  useEffect(() => {
    const getRanking = async () => {
      try {
        const resp = await axios.get("/api/rank?type=double");
        setTableRows(resp?.data ?? []);
        setIsLoading(false);
      } catch (error) {
        console.log("Error", error);
        setTableRows([]);
      }
    };
    getRanking();
  }, []);

  if (isLoading)
    return (
      <div className="pt-8">
        <Loading />
      </div>
    );

  return (
    <div className="w-full h-full">
      <div className="text-lg pb-4">Double 1st Round Ranking</div>
      <Card className="overflow-auto">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {tableHeaders.map((head) => (
                <th
                  key={head}
                  className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map(
              ({
                name,
                seriesWin,
                seriesLose,
                totalSeriesPlayed,
                totalMatchPlayed,
                seriesLeft,
                wf,
                rank,
              }) => (
                <tr key={name} className="even:bg-blue-gray-50/50">
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {name}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {rank}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {wf ?? 0}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {seriesWin}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {seriesLose}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {seriesLeft}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {totalSeriesPlayed}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {totalMatchPlayed}
                    </Typography>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default Ranking;
