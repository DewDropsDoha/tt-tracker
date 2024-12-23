'use client';

import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaMinusSquare,
  FaTableTennis,
} from 'react-icons/fa';
import ReactSelect from '../components/ReactSelect/ReactSelect';
import MatchTimer from '../components/Timer';
import CountdownTimer from './CountdownTimer';
import Loading from './Loading';

function MatchTracker() {
  const searchParams = useSearchParams();
  const [matchType, setMatchType] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [player1Stats, setPlayer1Stats] = useState<(string | number)[]>([]);
  const [player2Stats, setPlayer2Stats] = useState<(string | number)[]>([]);
  const [isMatchActive, setIsMatchActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [winnerMessage, setWinnerMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [matches, setMatches] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [resetCountdown, setResetCountdown] = useState(0);
  const [serve, setServe] = useState([1]);

  const playerColors = {
    player1: '#3B82F6',
    player2: '#7AB2D3',
  };

  const handleMatchSelection = (value: string) => {
    setSelectedMatch(value);
    const players = value.split('vs');
    setPlayer1(players[0]?.trim());
    setPlayer2(players[1]?.trim());
  };

  useEffect(() => {
    const type = searchParams.get('type') ?? 'single';
    setMatchType(type);
  }, [searchParams]);

  useEffect(() => {
    if (!matchType) return;
    const getRemainingMatches = async () => {
      try {
        const resp = await axios.get(`/api/match?type=${matchType}`);
        if (matchType === 'single') setMatches(resp.data);
        else setMatches(resp.data.remainingMatches);
        setIsLoading(false);
      } catch (error) {
        console.log('Error', error);
        setErrorMessage('Error fetching matches!');
      }
    };
    getRemainingMatches();
  }, [matchType]);

  const startMatch = () => {
    if (!player1 && !player1) {
      setErrorMessage('Select Match!');
      return;
    }

    setScore1(0);
    setScore2(0);
    setPlayer1Stats([player1]);
    setPlayer2Stats([player2]);
    setIsMatchActive(true);
    setWinnerMessage('');
    setErrorMessage('');
    setResetCountdown(0);
  };

  const resetMatch = () => {
    setPlayer1('');
    setPlayer2('');
    setScore1(0);
    setScore2(0);
    setPlayer1Stats([]);
    setPlayer2Stats([]);
    setIsMatchActive(false);
    setWinnerMessage('');
    setErrorMessage('');
    setSelectedMatch('');
    setResetCountdown(0);
  };

  useEffect(() => {
    const checkForWinner = () => {
      if (score1 > 10 && score1 - score2 > 1) {
        formatScore();
        setWinnerMessage(`${player1} won!`);
        setIsMatchActive(false);
      } else if (score2 > 10 && score2 - score1 > 1) {
        formatScore();
        setWinnerMessage(`${player2} won!`);
        setIsMatchActive(false);
      }
    };

    checkForWinner();
  }, [score1, score2, player1, player2]);

  const switchPlayerSide = () => {
    setPlayer1(player2);
    setPlayer2(player1);
  };

  const handleScore1 = () => {
    if (!isMatchActive && !winnerMessage) {
      setServe([1]);
      return;
    } else if (winnerMessage) return;

    setScore1(score1 + 1);
    setPlayer1Stats((prev) => [...prev, 1]);
    setPlayer2Stats((prev) => [...prev, 0]);
    setServe((prev) => {
      if (prev.length < 21) {
        if (prev.length % 2 === 0) {
          return [...prev, prev[prev.length - 1] === 1 ? 2 : 1];
        }
        return [...prev, prev[prev.length - 1]];
      } else {
        return [...prev, prev[prev.length - 1] === 1 ? 2 : 1];
      }
    });
  };

  const handleScore2 = () => {
    if (!isMatchActive && !winnerMessage) {
      setServe([2]);
      return;
    } else if (winnerMessage) return;

    setScore2(score2 + 1);
    setPlayer1Stats((prev) => [...prev, 0]);
    setPlayer2Stats((prev) => [...prev, 1]);
    setServe((prev) => {
      if (prev.length < 21) {
        if (prev.length % 2 === 0) {
          return [...prev, prev[prev.length - 1] === 1 ? 2 : 1];
        }
        return [...prev, prev[prev.length - 1]];
      } else {
        return [...prev, prev[prev.length - 1] === 1 ? 2 : 1];
      }
    });
  };

  const handleDecreaseScore1 = () => {
    const score = score1 - 1;
    if (score < 0) return;
    setScore1(score);
    setPlayer1Stats((prev) => prev.slice(0, -1));
    setPlayer2Stats((prev) => prev.slice(0, -1));
    setServe((prev) => prev.slice(0, -1));
  };

  const handleDecreaseScore2 = () => {
    const score = score2 - 1;
    if (score < 0) return;
    setScore2(score);
    setPlayer1Stats((prev) => prev.slice(0, -1));
    setPlayer2Stats((prev) => prev.slice(0, -1));
    setServe((prev) => prev.slice(0, -1));
  };

  const formatScore = () => {
    const player1Sum = player1Stats
      .slice(1)
      .reduce((acc, value) => Number(acc) + Number(value), 0);
    const player2Sum = player2Stats
      .slice(1)
      .reduce((acc, value) => Number(acc) + Number(value), 0);

    setPlayer1Stats((prev) => [prev[0], player1Sum, '-', ...prev.slice(1)]);
    setPlayer2Stats((prev) => [prev[0], player2Sum, '-', ...prev.slice(1)]);
  };

  const uploadScore = () => {
    const body = { type: matchType, data: [player1Stats, player2Stats] };
    const uploadScore = async () => {
      try {
        setIsUploading(true);
        await axios.post('/api/match', body);
        setMatches((prevMatches) =>
          prevMatches.filter((match) => match !== selectedMatch)
        );
        setResetCountdown(3);
      } catch (error) {
        console.log('Error', error);
        setErrorMessage('Upload failed! Try again!');
      } finally {
        setIsUploading(false);
      }
    };
    uploadScore();
  };

  if (isLoading)
    return (
      <div className="pt-8">
        <Loading />
      </div>
    );
  const scoreBox = () => (
    <div className="flex items-center justify-center mt-4">
      <div className="rounded-lg shadow-2xl p-4 sm:p-8 text-center min-w-[320px] sm:min-w-[420px] overflow-hidden">
        <div className="text-xl pb-4">Match Tracker</div>

        <div className="h-12">
          {!isMatchActive && !winnerMessage && (
            <div className="mb-2">
              <ReactSelect
                matches={matches}
                handleMatchSelection={handleMatchSelection}
                selectedMatch={selectedMatch}
              />
            </div>
          )}

          {isMatchActive && !winnerMessage && (
            <div className="pt-2">
              Timer: <MatchTimer isActive={isMatchActive} />
            </div>
          )}
        </div>

        <div>
          <div className="pb-4 text-lg">Score</div>

          {winnerMessage && (
            <>
              <div className="text-green-600 text-xl font-bold pb-2">
                {winnerMessage}
              </div>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', paddingBottom: '8px' }}>
                  <thead>
                    <tr style={{ color: playerColors.player1 }}>
                      {player1Stats.map((item, index) => (
                        <td key={`${index}-${item}`}>{item}</td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ color: playerColors.player2 }}>
                      {player2Stats.map((item, index) => (
                        <td key={`${index}-${item}`}>{item}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {!resetCountdown && winnerMessage && (
                <button
                  onClick={uploadScore}
                  className="bg-green-600 text-white w-full py-2 px-6 my-2 rounded shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {!isUploading && <>Upload Score</>}
                  {isUploading && (
                    <div>
                      Uploading Score ...{' '}
                      <div className="mt-2">
                        <Loading />
                      </div>
                    </div>
                  )}
                </button>
              )}

              {resetCountdown !== 0 && winnerMessage && (
                <div className="bg-green-600 text-white w-full py-2 px-6 my-2 rounded shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed">
                  <p>
                    Uploaded successfully! <br />
                    Resetting in{' '}
                    <CountdownTimer
                      countdown={resetCountdown}
                      onFinish={resetMatch}
                    />{' '}
                    seconds ...
                  </p>
                </div>
              )}
            </>
          )}

          <div
            className="flex flex-row justify-between gap-6"
            style={{
              opacity: isMatchActive ? 1 : 0.7,
            }}
          >
            <div
              className="flex-1 text-center rounded cursor-pointer h-[144px]  text-white"
              style={{ backgroundColor: playerColors.player1 }}
              onClick={handleScore1}
            >
              <div className="flex items-center justify-center pt-2 h-8">
                {serve[serve.length - 1] === 1 && (
                  <FaTableTennis size={24} style={{ color: 'red' }} />
                )}
              </div>
              <div className="pt-2 text-5xl font-bold">{score1}</div>
              <div className="pt-4 text-xl font-bold">{player1}</div>
            </div>
            <div
              className="flex-1 text-center rounded cursor-pointer h-[144px]  text-white"
              style={{ backgroundColor: playerColors.player2 }}
              onClick={handleScore2}
            >
              <div className="flex items-center justify-center pt-2 h-8">
                {serve[serve.length - 1] === 2 && (
                  <FaTableTennis size={24} style={{ color: 'red' }} />
                )}
              </div>
              <div className="pt-2 text-5xl font-bold">{score2}</div>
              <div className="pt-4 text-xl font-bold">{player2}</div>
            </div>
          </div>

          <div className="h-12">
            {!isMatchActive && !winnerMessage && (
              <div
                className="flex items-center justify-center pt-4"
                onClick={switchPlayerSide}
              >
                <div className="cursor-pointer flex items-center space-x-2">
                  <FaArrowCircleRight color={playerColors.player1} />
                  <FaArrowCircleLeft color={playerColors.player2} />
                </div>
              </div>
            )}

            {isMatchActive && (
              <div>
                {player1Stats[player1Stats.length - 1] === 1 && (
                  <div className="flex justify-start items-center p-2.5">
                    <FaMinusSquare
                      size={28}
                      style={{
                        color: playerColors.player1,
                        paddingBottom: '4px',
                      }}
                      onClick={handleDecreaseScore1}
                    />
                  </div>
                )}

                {player2Stats[player2Stats.length - 1] === 1 && (
                  <div className="flex justify-end items-center p-2.5">
                    <FaMinusSquare
                      size={28}
                      style={{
                        color: playerColors.player2,
                        paddingBottom: '4px',
                      }}
                      onClick={handleDecreaseScore2}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-8 justify-between my-4">
          <button
            onClick={resetMatch}
            disabled={!isMatchActive && !winnerMessage}
            className="w-28 bg-red-600 text-white py-2 px-6 rounded shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={startMatch}
            disabled={isMatchActive || !!winnerMessage}
            className="w-28 bg-green-600 text-white py-2 px-6 rounded shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Start
          </button>
        </div>

        <p style={{ color: 'red', fontWeight: 'bold' }}>{errorMessage ?? ''}</p>
      </div>
    </div>
  );

  return scoreBox();
}

export default withPageAuthRequired(MatchTracker);
