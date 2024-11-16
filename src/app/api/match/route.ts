import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getUserPermissions } from '../shared/auth0';

type MatchData = (string | number)[];

const gcpAuth = new GoogleAuth({
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY,
    project_id: process.env.PROJECT_ID,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

function addEmptyRows(data: MatchData[]) {
  return data.reduce<MatchData[]>((acc, item, index) => {
    if (index % 2 === 0) acc.push([]);
    acc.push(item);
    return acc;
  }, []);
}

const getMatches = async () => {
  try {
    const service = google.sheets({ version: 'v4', auth: gcpAuth });
    const response = await service.spreadsheets.values.batchGet({
      spreadsheetId: process.env.SPREADSHEET_ID,
      ranges: ['player!A2:A1000', 'single!A2:Z1000'],
    });

    const players = response.data.valueRanges?.[0].values ?? [];
    const playedMatches = response.data.valueRanges?.[1].values ?? [];

    const matchSet = new Set();
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const match = [players[i][0], players[j][0]].sort().join(' vs ');
        matchSet.add(match);
      }
    }

    const playedMatchSet = new Set();
    for (let i = 0; i < playedMatches.length - 1; i++) {
      if (playedMatches[i].length && playedMatches[i + 1].length) {
        const player1 = playedMatches[i][0];
        const player2 = playedMatches[i + 1][0];
        const playedMatch = [player1, player2].sort().join(' vs ');
        playedMatchSet.add(playedMatch);
      }
    }

    playedMatchSet.forEach((match) => {
      matchSet.delete(match);
    });

    const remainingMatches = Array.from(matchSet).sort();

    return NextResponse.json(remainingMatches);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json('Error fetching data');
  }
};

const appendMatch = async (request: Request) => {
  // return NextResponse.json({ message: 'TESTING' }, { status: 200 });
  try {
    const requiredPermissions = ['write:table_tennis_score'];
    const permissions = await getUserPermissions();
    const hasAllPermissions = requiredPermissions.every((permission) =>
      permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      console.log('User does not have all required permissions.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newData = await request.json();
    if (!Array.isArray(newData)) {
      return NextResponse.json(
        { message: 'Invalid Request Body' },
        { status: 400 }
      );
    }

    const sheetName = 'single_ranking';
    const data = addEmptyRows(newData);
    const service = google.sheets({ version: 'v4', auth: gcpAuth });
    // @ts-expect-error There's more in service.spreadsheets.values
    const response = await service.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}`,
      valueInputOption: 'RAW',
      resource: { values: data },
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
      updatedRange.split('!')[1].split(':')[0].replace(/[A-Z]/g, ''),
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
                type: 'CUSTOM_FORMULA',
                values: [
                  {
                    userEnteredValue: '=B' + nextRow + '>B' + next2ndRow + '',
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
                type: 'CUSTOM_FORMULA',
                values: [
                  {
                    userEnteredValue: '=B' + next2ndRow + '>B' + nextRow + '',
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
    console.error('Error appending data:', error);
    return NextResponse.json(
      { message: 'Error appending data' },
      { status: 500 }
    );
  }
};

export const GET = getMatches;
export const POST = withApiAuthRequired(appendMatch);
