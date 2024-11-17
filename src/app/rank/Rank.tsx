'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
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
        setTableRows(resp.data);
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
      <div className="text-xl pb-4 text-white">Single 1st Round Ranking</div>
      <Card className="overflow-auto bg-gray-500/50">
        <table className="w-full min-w-max table-auto text-left text-white">
          <thead>
            <tr>
              {tableHeaders.map((head) => (
                <th
                  key={head}
                  className="border-b border-gray-600 bg-gray-700 p-4"
                >
                  <Typography
                    variant="small"
                    color="white"
                    className="font-normal leading-none opacity-90"
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
                <tr key={name} className="even:bg-gray-600">
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal"
                    >
                      {name}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal"
                    >
                      {rank}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal"
                    >
                      {win}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal"
                    >
                      {lose}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color="white"
                      className="font-normal"
                    >
                      {matchLeft}
                    </Typography>
                  </td>
                  <td className={'py-2 px-4'}>
                    <Typography
                      variant="small"
                      color="white"
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

export default withPageAuthRequired(Ranking);
