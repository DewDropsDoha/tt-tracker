'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import Loading from '../match-tracker/Loading';
import { Card, Typography } from '@material-tailwind/react';

type PlayerRow = {
  name: string;
  win: number;
  lose: number;
  rank: number;
  totalPlayed: number;
  matchLeft: number;
};

function Ranking() {
  const [isLoading, setIsLoading] = useState(true);
  const [tableRows, setTableRows] = useState<PlayerRow[]>([]);

  const tableHeaders = [
    'Name',
    'Rank',
    'Win',
    'Lose',
    'Match Left',
    'Total Played',
  ];

  useEffect(() => {
    const getRanking = async () => {
      try {
        const resp = await axios.get('/api/rank');
        console.log("Rank", resp.data)
        setTableRows(resp?.data ?? []);
        setIsLoading(false);
      } catch (error) {
        console.log('Error', error);
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
      <div className="text-lg pb-4">Single 1st Round Ranking</div>
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
              ({ name, rank, win, lose, matchLeft, totalPlayed }) => (
                <tr key={name} className="even:bg-blue-gray-50/50">
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {name}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {rank}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {win}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {lose}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {matchLeft}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                    >
                      {totalPlayed}
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
