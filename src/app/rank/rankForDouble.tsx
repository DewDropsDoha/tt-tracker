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
  points?: number;
  rank?: number;
};
interface GameStats {
  win: number;
  lose: number;
}
type MatchData = { [key: string]: { [key: string]: GameStats } };
function Ranking() {
  const [isLoading, setIsLoading] = useState(true);
  const [tableRows, setTableRows] = useState<PlayerRow[]>([]);
  const [matchData, setMatchData] = useState<MatchData>({});

  const tableHeaders = [
    "Name",
    "Rank",
    "Points",
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

  useEffect(() => {
    const getMatchData = async () => {
      try {
        const resp = await axios.get(`/api/match?type=double`);
        setMatchData(resp.data.data ?? {});
        setIsLoading(false);
      } catch (error) {
        console.log("Error", error);
        setMatchData({});
      }
    };
    getMatchData();
  }, []);

  if (isLoading)
    return (
      <div className="pt-8">
        <Loading />
      </div>
    );
  const MatchDataTable: React.FC<{ data: MatchData }> = ({ data }) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center ">
        {Object.entries(data).map(([player, games]) => (
          <div
            key={player}
            className="w-full sm:w-1/2 md:w-1/6 bg-white border border-gray-300 shadow-md rounded-lg p-4"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Player: {player}
            </h2>
            <ul className="space-y-2">
              {Object.entries(games).map(([game, stats]) => (
                <li key={game} className="text-gray-700">
                  <p className="font-semibold">Opponent: {game}</p>
                  <p>
                    Wins: <span className="text-green-600">{stats.win}</span>
                  </p>
                  <p>
                    Losses: <span className="text-red-600">{stats.lose}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      <div className="text-lg pb-4">Double 1st Round Ranking</div>
      <Card className="overflow-auto">
        <table className="w-full min-w-max table-auto text-center">
          <thead>
            <tr>
              {tableHeaders.map((head) => (
                <th
                  key={head}
                  className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                >
                  <Typography
                    variant="small"
                    color="black"
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
              (
                {
                  name,
                  seriesWin,
                  seriesLose,
                  totalSeriesPlayed,
                  totalMatchPlayed,
                  seriesLeft,
                  points,
                  rank,
                },
                index
              ) => (
                <tr key={name} className="even:bg-blue-gray-50/50">
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? "green" : "gray"}`}
                      className="font-normal"
                    >
                      {name}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? "green" : "gray"}`}
                      className="font-normal"
                    >
                      {rank}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? "green" : "gray"}`}
                      className="font-normal"
                    >
                      {points ?? 0}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? "green" : "gray"}`}
                      className="font-normal"
                    >
                      {seriesWin}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? "green" : "gray"}`}
                      className="font-normal"
                    >
                      {seriesLose}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? "green" : "gray"}`}
                      className="font-normal"
                    >
                      {seriesLeft}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? "green" : "gray"}`}
                      className="font-normal"
                    >
                      {totalSeriesPlayed}
                    </Typography>
                  </td>
                  <td className={"py-2 px-4"}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? "green" : "gray"}`}
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
      <br />
      <MatchDataTable data={matchData} />
    </div>
  );
}

export default Ranking;
