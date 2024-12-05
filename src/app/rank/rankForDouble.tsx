'use client';

import { Card, Typography } from '@material-tailwind/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Loading from '../match-tracker/Loading';

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
  const [remainingMatches, setRemainingMatches] = useState<string[]>([]);

  const tableHeaders = [
    'Name',
    'Rank',
    'Points',
    'Series Win',
    'Series Lose',
    'Series Left',
    'Total Series Played',
    'Total Match Played',
  ];

  useEffect(() => {
    const getRanking = async () => {
      try {
        const resp = await axios.get('/api/rank?type=double');
        setTableRows(resp?.data ?? []);
        setIsLoading(false);
      } catch (error) {
        console.log('Error', error);
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
        console.log(resp.data.remainingMatches);
        setRemainingMatches(resp.data.remainingMatches ?? []);
        setIsLoading(false);
      } catch (error) {
        console.log('Error', error);
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
  const RemainingMatchList: React.FC<{ player: string }> = ({ player }) => {
    let filteredMatches = remainingMatches.filter((data) =>
      data.includes(player)
    );

    filteredMatches = filteredMatches.map((data) =>
      data.replace(player, '').replace('vs', '').trim()
    );
    return (
      <div>
        <h2 className="text-lg font-bold mb-4">
          Remaining Matches for {player}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match, index) => (
              <li key={index} className="text-gray-800">
                {match}
              </li>
            ))
          ) : (
            <li className="text-red-600">No matches found for {player}</li>
          )}
        </ul>
      </div>
    );
  };
  const MatchDataTable: React.FC<{ data: MatchData }> = ({ data }) => {
    return (
      <div className="flex flex-wrap gap-4 justify-center">
        {Object.entries(data).map(([player, games]) => (
          <div
            key={player}
            className="w-full sm:w-1/2 md:w-1/5 bg-white border border-gray-300 shadow-md rounded-lg p-4"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Player: {player}
            </h2>
            {/* Table inside the Card */}
            <table className="table-auto border-collapse w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">Game</th>
                  <th className="border border-gray-300 px-4 py-2">Wins</th>
                  <th className="border border-gray-300 px-4 py-2">Losses</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(games).map(([game, stats], index) => (
                  <tr
                    key={game}
                    className={index % 2 === 0 ? 'bg-gray-100' : ''}
                  >
                    <td className="border border-gray-300 px-4 py-2">{game}</td>
                    <td className="border border-gray-300 px-4 py-2 text-green-600">
                      {stats.win}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-red-600">
                      {stats.lose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <RemainingMatchList player={player} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      <div className="text-lg pb-4">
        <h2 className="text-xl font-bold mb-4">Point System</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-green-600">
            +4 points if series win in 2 matches
          </li>
          <li className="text-green-600">
            +2 points if series win in 3 matches
          </li>
          <li className="text-red-600">
            -4 points if series lose in 2 matches
          </li>
          <li className="text-red-600">
            -2 points if series lose in 3 matches
          </li>
        </ul>
      </div>
      <div className="flex justify-center items-center">
        <div className="text-lg pb-4 text-center">Double 1st Round Ranking</div>
      </div>
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
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? 'green' : 'gray'}`}
                      className="font-normal"
                    >
                      {name}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? 'green' : 'gray'}`}
                      className="font-normal"
                    >
                      {rank}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? 'green' : 'gray'}`}
                      className="font-normal"
                    >
                      {points ?? 0}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? 'green' : 'gray'}`}
                      className="font-normal"
                    >
                      {seriesWin}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? 'green' : 'gray'}`}
                      className="font-normal"
                    >
                      {seriesLose}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? 'green' : 'gray'}`}
                      className="font-normal"
                    >
                      {seriesLeft}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? 'green' : 'gray'}`}
                      className="font-normal"
                    >
                      {totalSeriesPlayed}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color={`${index < 4 ? 'green' : 'gray'}`}
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
      <div className="flex justify-center items-center">
        <div className="text-lg pb-4 text-center">Match statistics</div>
      </div>
      <MatchDataTable data={matchData} />
    </div>
  );
}

export default Ranking;
