import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { matchSheetNameMap } from './utils';

const isWin = (score1: string, score2: string): boolean =>
  Number(score1) > Number(score2);

const getWinCount = (player1: string, player2: string): number => {
  if (data[player1] && data[player1][player2])
    return data[player1][player2]?.win ?? 0;
  return 0;
};

const incWinCount = (player1: string, player2: string): number => {
  if (data[player1] && data[player1][player2]) {
    return data[player1][player2]?.win ? data[player1][player2].win + 1 : 1;
  }
  return getWinCount(player1, player2) + 1;
};

const getLoseCount = (player1: string, player2: string): number => {
  if (data[player1] && data[player1][player2])
    return data[player1][player2]?.lose ?? 0;
  return 0;
};

const incLoseCount = (player1: string, player2: string): number => {
  if (data[player1] && data[player1][player2]) {
    return data[player1][player2].lose ? data[player1][player2].lose + 1 : 1;
  }
  return getLoseCount(player1, player2) + 1;
};

interface GameStats {
  win: number;
  lose: number;
}
const data: { [key: string]: { [key: string]: GameStats } } = {};
const clearData = (): void => {
  for (const key in data) {
    delete data[key];
  }
};

const gcpAuth = new GoogleAuth({
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
    project_id: process.env.PROJECT_ID,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const getMatchesForDouble = async (
  type: keyof typeof matchSheetNameMap
) => {
  try {
    clearData();
    const service = google.sheets({ version: 'v4', auth: gcpAuth });
    const response = await service.spreadsheets.values.batchGet({
      spreadsheetId: process.env.SPREADSHEET_ID,
      ranges: matchSheetNameMap[type],
    });

    const players = response.data.valueRanges?.[0].values ?? [];
    const playedMatches = response.data.valueRanges?.[1].values ?? [];
    // const playedMatches = mockData;

    const matchSet = new Set();
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const match = [players[i][0], players[j][0]].sort().join(' vs ');
        matchSet.add(match);
      }
    }

    for (let i = 0; i < playedMatches.length - 1; i++) {
      if (playedMatches[i].length && playedMatches[i + 1].length) {
        const player1 = playedMatches[i][0];
        const player2 = playedMatches[i + 1][0];
        const score1 = playedMatches[i][1];
        const score2 = playedMatches[i + 1][1];

        if (!data[player1]) data[player1] = {};

        data[player1][player2] = {
          win: isWin(score1, score2)
            ? incWinCount(player1, player2)
            : getWinCount(player1, player2),
          lose: isWin(score1, score2)
            ? getLoseCount(player1, player2)
            : incLoseCount(player1, player2),
        };

        if (!data[player2]) data[player2] = {};
        data[player2][player1] = {
          win: isWin(score2, score1)
            ? incWinCount(player2, player1)
            : getWinCount(player2, player1),
          lose: isWin(score2, score1)
            ? getLoseCount(player2, player1)
            : incLoseCount(player2, player1),
        };
      }
    }

    for (const outerKey in data) {
      for (const innerKey in data[outerKey]) {
        const matchToBeDeleted = [outerKey, innerKey].sort().join(' vs ');
        if (data[outerKey] && data[outerKey][innerKey]) {
          if (
            data[outerKey][innerKey].win >= 2 ||
            data[outerKey][innerKey].lose >= 2
          ) {
            matchSet.delete(matchToBeDeleted);
          }
        }
      }
    }

    const remainingMatches = Array.from(matchSet).sort();

    return NextResponse.json({ remainingMatches, data });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json('Error fetching data');
  }
};
