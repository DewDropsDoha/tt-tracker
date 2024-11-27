import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { GoogleAuth } from "google-auth-library";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { getUserPermissions } from "../shared/auth0";

type MatchData = (string | number)[];

const gcpAuth = new GoogleAuth({
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY?.split(String.raw`\n`).join("\n"),
    project_id: process.env.PROJECT_ID,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const matchSheetNameMap = {
  single: ["player!A2:A1000", "single!A2:Z1000"],
  "single-quarterfinal": [
    "single_quarter_player!A2:A1000",
    "single_quarter_match!A2:Z1000",
  ],
  "single-semifinal": [
    "single_semi_player!A2:A1000",
    "single_semi_match!A2:Z1000",
  ],
  "single-final": [
    "single_final_player!A2:A1000",
    "single_final_match!A2:Z1000",
  ],
  double: ["double_player!A2:A1000", "double_match!A2:Z1000"],
  "double-semifinal": [
    "double_semi_player!A2:A1000",
    "double_semi_match!A2:Z1000",
  ],
  "double-final": [
    "double_final_player!A2:A1000",
    "double_final_match!A2:Z1000",
  ],
};

const appendSheetNameMap = {
  single: "single",
  "single-quarterfinal": "single_quarter_match",
  "single-semifinal": "single_semi_match",
  "single-final": "single_final_match",
  double: "double_match",
  "double-semifinal": "double_semi_match",
  "double-final": "double_final_match",
};

function addEmptyRows(data: MatchData[]) {
  return data.reduce<MatchData[]>((acc, item, index) => {
    if (index % 2 === 0) acc.push([]);
    acc.push(item);
    return acc;
  }, []);
}

const areBothSameSign = (num1: number, num2: number) => {
  return (num1 > 0 && num2 > 0) || (num1 < 0 && num2 < 0);
};

const count: Record<string, { dif: number; noOfMatch: number }> = {};
const getCount = (playedMatch: string, dif: number) => {
  if (count[playedMatch]) {
    if (count[playedMatch].dif) {
      if (areBothSameSign(count[playedMatch].dif, dif))
        return {
          dif,
          noOfMatch: count[playedMatch].noOfMatch + 2,
        };
      else
        return {
          dif,
          noOfMatch: count[playedMatch].noOfMatch + 1,
        };
    }
  }

  return {
    dif,
    noOfMatch: 1,
  };
};

const getMatchesV2 = async (type: keyof typeof matchSheetNameMap) => {
  try {
    const service = google.sheets({ version: "v4", auth: gcpAuth });
    const response = await service.spreadsheets.values.batchGet({
      spreadsheetId: process.env.SPREADSHEET_ID,
      ranges: matchSheetNameMap[type],
    });

    const players = response.data.valueRanges?.[0].values ?? [];
    const playedMatches = response.data.valueRanges?.[1].values ?? [];

    const matchSet = new Set();
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const match = [players[i][0], players[j][0]].sort().join(" vs ");
        matchSet.add(match);
      }
    }

    const playedMatchSet = new Set();

    for (let i = 0; i < playedMatches.length - 1; i++) {
      if (playedMatches[i].length && playedMatches[i + 1].length) {
        const player1 = playedMatches[i][0];
        const player2 = playedMatches[i + 1][0];
        const playedMatch = [player1, player2].sort().join(" vs ");

        count[playedMatch] = getCount(
          playedMatch,
          Number(playedMatches[i][1]) - Number(playedMatches[i + 1][1])
        );

        playedMatchSet.add(playedMatch);
      }
    }

    playedMatchSet.forEach((match) => {
      if (count[match as string].noOfMatch >= 3) matchSet.delete(match);
    });

    const remainingMatches = Array.from(matchSet).sort();

    return NextResponse.json(remainingMatches);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json("Error fetching data");
  }
};

const getMatchesV1 = async (type: keyof typeof matchSheetNameMap) => {
  try {
    const service = google.sheets({ version: "v4", auth: gcpAuth });
    const response = await service.spreadsheets.values.batchGet({
      spreadsheetId: process.env.SPREADSHEET_ID,
      ranges: matchSheetNameMap[type],
    });

    const players = response.data.valueRanges?.[0].values ?? [];
    const playedMatches = response.data.valueRanges?.[1].values ?? [];

    const matchSet = new Set();
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const match = [players[i][0], players[j][0]].sort().join(" vs ");
        matchSet.add(match);
      }
    }

    const playedMatchSet = new Set();
    for (let i = 0; i < playedMatches.length - 1; i++) {
      if (playedMatches[i].length && playedMatches[i + 1].length) {
        const player1 = playedMatches[i][0];
        const player2 = playedMatches[i + 1][0];
        const playedMatch = [player1, player2].sort().join(" vs ");
        playedMatchSet.add(playedMatch);
      }
    }

    playedMatchSet.forEach((match) => {
      matchSet.delete(match);
    });

    const remainingMatches = Array.from(matchSet).sort();

    return NextResponse.json(remainingMatches);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json("Error fetching data");
  }
};

const getMatches = async (request: Request) => {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const type = params.get("type") as keyof typeof matchSheetNameMap;
  if (!type) return NextResponse.json("Match type missing!", { status: 400 });

  if (type === "double") {
    return getMatchesV2(type as keyof typeof matchSheetNameMap);
  }

  return getMatchesV1(type as keyof typeof matchSheetNameMap);
};

const appendMatch = async (request: Request) => {
  try {
    const requiredPermissions = ["write:table_tennis_score"];
    const permissions = await getUserPermissions();
    const hasAllPermissions = requiredPermissions.every((permission) =>
      permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      console.log("User does not have all required permissions.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;
    if (!type && !Array.isArray(data)) {
      return NextResponse.json(
        { message: "Invalid Request Body" },
        { status: 400 }
      );
    }

    const sheetName =
      appendSheetNameMap[type as keyof typeof appendSheetNameMap];
    const values = addEmptyRows(data);
    const service = google.sheets({ version: "v4", auth: gcpAuth });
    // @ts-expect-error There's more in service.spreadsheets.values
    const response = await service.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}`,
      valueInputOption: "RAW",
      resource: { values: values },
    });

    const spreadsheet = await service.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });
    const sheet = spreadsheet?.data?.sheets?.find(
      (s) => s?.properties?.title === sheetName
    );
    const sheetId = sheet?.properties?.sheetId;

    // @ts-expect-error There's more in response
    const updatedRange = response.data?.updates?.updatedRange;
    const startRow = parseInt(
      updatedRange.split("!")[1].split(":")[0].replace(/[A-Z]/g, ""),
      10
    );
    const nextRow = startRow + 1;
    const next2ndRow = nextRow + 1;

    const requests = [
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [
              {
                sheetId: sheetId,
                startRowIndex: startRow,
                endRowIndex: nextRow,
                startColumnIndex: 0,
                endColumnIndex: 2,
              },
            ],
            booleanRule: {
              condition: {
                type: "CUSTOM_FORMULA",
                values: [
                  {
                    userEnteredValue: "=B" + nextRow + ">B" + next2ndRow + "",
                  },
                ],
              },
              format: {
                backgroundColor: { red: 0.686, green: 0.882, blue: 0.686 },
              },
            },
          },
        },
      },
      {
        addConditionalFormatRule: {
          rule: {
            ranges: [
              {
                sheetId: sheetId,
                startRowIndex: nextRow,
                endRowIndex: next2ndRow,
                startColumnIndex: 0,
                endColumnIndex: 2,
              },
            ],
            booleanRule: {
              condition: {
                type: "CUSTOM_FORMULA",
                values: [
                  {
                    userEnteredValue: "=B" + next2ndRow + ">B" + nextRow + "",
                  },
                ],
              },
              format: {
                backgroundColor: { red: 0.686, green: 0.882, blue: 0.686 },
              },
            },
          },
        },
      },
    ];

    // @ts-expect-error There's more in service.spreadsheets
    await service.spreadsheets.batchUpdate({
      spreadsheetId: `${process.env.SPREADSHEET_ID}`,
      resource: {
        requests: requests,
      },
    });

    // @ts-expect-error There's more in response
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error("Error appending data:", error);
    return NextResponse.json(
      { message: "Error appending data" },
      { status: 500 }
    );
  }
};

export const GET = getMatches;
export const POST = withApiAuthRequired(appendMatch);
