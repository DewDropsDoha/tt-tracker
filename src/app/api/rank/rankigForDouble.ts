import { GoogleAuth } from "google-auth-library";
import { google } from "googleapis";
import { NextResponse } from "next/server";

const gcpAuth = new GoogleAuth({
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY?.split(String.raw`\n`).join("\n"),
    project_id: process.env.PROJECT_ID,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

interface GameStats {
  win: number;
  lose: number;
}

interface Info {
  name: string;
  seriesWin: number;
  seriesLose: number;
  totalSeriesPlayed: number;
  totalMatchPlayed: number;
  seriesLeft: number;
  wf?: number;
  rank?: number;
}

const data: { [key: string]: { [key: string]: GameStats } } = {};
const getCurrentScores = async () => {
  const sheetName = "double_match";
  const service = google.sheets({ version: "v4", auth: gcpAuth });
  const response = await service.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: `${sheetName}!A2:Z1000`,
  });
  return response.data.values;
};

const isWin = (score1: number, score2: number): boolean =>
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

const sortRankingForDouble = (info: Record<string, Info>): Info[] => {
  const players: Info[] = Object.entries(info).map(([name, stats]) => ({
    name,
    seriesWin: stats.seriesWin,
    seriesLose: stats.seriesLose || 0,
    wf: stats.wf,
    rank: 0,
    totalMatchPlayed: stats.totalMatchPlayed,
    totalSeriesPlayed: stats.totalSeriesPlayed,
    seriesLeft: stats.seriesLeft,
  }));

  players.sort((a, b) => {
    if (b.seriesWin !== a.seriesWin) {
      return b.seriesWin - a.seriesWin;
    }

    if (a.seriesLose !== b.seriesLose) {
      return a.seriesLose - b.seriesLose;
    }

    return (b.totalMatchPlayed || 0) - (a.totalMatchPlayed || 0);
  });

  players.forEach((player, index) => {
    player.rank = index + 1;
  });

  return players;
};

// const isNegative = (nu: number) => nu < 0;

// const getWf = (index: string, rank: Rank, diff: number) => {
//   const penalti = 1.5;
//   const wf = rank[index]?.wf;
//   const newDiff = isNegative(diff) ? diff * penalti : diff;
//   if (wf) return wf + newDiff;
//   return newDiff;
// };

const clearData = (): void => {
  for (const key in data) {
    delete data[key];
  }
};

export const getRankForDouble = async (): Promise<NextResponse> => {
  try {
    clearData();

    const currentScores = await getCurrentScores();
    if (!currentScores?.length) return NextResponse.json([], { status: 200 });

    for (let i = 1; i <= currentScores.length - 2; i = i + 3) {
      if (!currentScores[i].length) continue;

      const player1 = currentScores[i][0];
      const player2 = currentScores[i + 1][0];

      const score1 = currentScores[i][1];
      const score2 = currentScores[i + 1][1];

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
    const info: Record<string, Info> = {};
    for (const outerKey in data) {
      let seriesLose = 0;
      let seriesWin = 0;
      let totalMatchPlayed = 0;
      for (const innerKey in data[outerKey]) {
        if (data[outerKey][innerKey].win > data[outerKey][innerKey].lose)
          seriesWin++;
        else seriesLose++;

        totalMatchPlayed +=
          data[outerKey][innerKey].win + data[outerKey][innerKey].lose;
      }
      info[outerKey] = {
        name: outerKey,
        seriesLose,
        seriesWin,
        totalMatchPlayed,
        totalSeriesPlayed: seriesLose + seriesWin,
        seriesLeft: 7 - (seriesLose + seriesWin),
      };
    }
    const sortedInfo = sortRankingForDouble(info);
    return NextResponse.json(sortedInfo, { status: 200 });
  } catch (error) {
    console.error("Failed to show ranking data:", error);
    return NextResponse.json("Failed to show ranking data", { status: 500 });
  }
};
