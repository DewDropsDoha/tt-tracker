import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getRankForDouble } from './rankigForDouble';

type Rank = {
  [index: string]: {
    win: number;
    lose: number;
    wf?: number;
  };
};

type Player = {
  name: string;
  win: number;
  lose: number;
  rank?: number;
  totalPlayed?: number;
  matchLeft?: number;
};

const gcpAuth = new GoogleAuth({
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
    project_id: process.env.PROJECT_ID,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const getCurrentScores = async () => {
  const sheetName = 'single';
  const service = google.sheets({ version: 'v4', auth: gcpAuth });
  const response = await service.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${sheetName}!A2:Z1000`,
  });
  return response.data.values;
};

const isWin = (score1: number, score2: number): boolean =>
  Number(score1) > Number(score2);

const getWinCount = (index: string, rank: Rank): number => {
  if (index in rank) return rank[index]?.win ?? 0;
  return 0;
};

const incWinCount = (index: string, rank: Rank): number => {
  if (index in rank) {
    return rank[index].win ? rank[index].win + 1 : 1;
  }
  return getWinCount(index, rank) + 1;
};

const getLoseCount = (index: string, rank: Rank): number => {
  if (index in rank) return rank[index]?.lose ?? 0;
  return 0;
};

const incLoseCount = (index: string, rank: Rank): number => {
  if (index in rank) {
    return rank[index].lose ? rank[index].lose + 1 : 1;
  }
  return getLoseCount(index, rank) + 1;
};

const sortRankingV2 = (rank: Rank): Player[] => {
  const players = Object.entries(rank).map(([name, stats]) => ({
    name,
    win: stats.win,
    lose: stats.lose || 0,
    wf: stats.wf,
    rank: 0,
    totalPlayed: 0,
    matchLeft: 0,
  }));

  players.sort((a, b) => {
    if (b.win !== a.win) {
      return b.win - a.win;
    }
    // If wins are the same, compare by losses (fewer losses ranked first)
    if (a.lose !== b.lose) {
      return a.lose - b.lose;
    }
    // If both wins and losses are the same, compare by wf (higher wf ranked first)
    return (b.wf || 0) - (a.wf || 0);
  });

  const noOfPlayers = players.length;

  players.forEach((player, index) => {
    player.rank = index + 1;
    player.totalPlayed = player.win + player.lose;
    player.matchLeft = noOfPlayers - player.totalPlayed - 1;
  });

  return players;
};
const isNegative = (nu: number) => nu < 0;

const getWf = (index: string, rank: Rank, diff: number) => {
  const penalti = 1.5;
  const wf = rank[index]?.wf;
  const newDiff = isNegative(diff) ? diff * penalti : diff;
  if (wf) return wf + newDiff;
  return newDiff;
};

const getRanks = async (): Promise<NextResponse> => {
  try {
    const rank: Rank = {};
    const currentScores = await getCurrentScores();
    if (!currentScores) return NextResponse.json([]);

    for (let i = 1; i <= currentScores.length - 2; i = i + 3) {
      if (!currentScores[i].length) continue;
      const index1 = currentScores[i][0];
      const index2 = currentScores[i + 1][0];
      const sc1 = currentScores[i][1];
      const sc2 = currentScores[i + 1][1];

      rank[index1] = {
        win: isWin(sc1, sc2)
          ? incWinCount(index1, rank)
          : getWinCount(index1, rank),
        wf: getWf(index1, rank, sc1 - sc2),
        lose: isWin(sc1, sc2)
          ? getLoseCount(index1, rank)
          : incLoseCount(index1, rank),
      };
      rank[index2] = {
        win: isWin(sc2, sc1)
          ? incWinCount(index2, rank)
          : getWinCount(index2, rank),
        wf: getWf(index2, rank, sc2 - sc1),
        lose: isWin(sc2, sc1)
          ? getLoseCount(index2, rank)
          : incLoseCount(index2, rank),
      };
    }

    const sortedRanking = sortRankingV2(rank);
    return NextResponse.json(sortedRanking, { status: 200 });
  } catch (error) {
    console.error('Failed to show ranking data:', error);
    return NextResponse.json('Failed to show ranking data', { status: 500 });
  }
};

const getRankBasedOnType = async (request: Request): Promise<NextResponse> => { 
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const type = params.get("type") ;
  if (!type) return NextResponse.json("Match type missing!", { status: 400 });

  if (type === "double") {
    return getRankForDouble();
  }

  return getRanks();
}

export const GET = getRankBasedOnType;
