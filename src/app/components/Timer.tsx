import React, { useState, useEffect } from 'react';

type MatchTimerProps = {
  isActive: boolean;
};

const MatchTimer: React.FC<MatchTimerProps> = ({ isActive }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isActive) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const resetTimer = () => {
    setTime(0);
  };

  useEffect(() => {
    if (!isActive) resetTimer();
  }, [isActive]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
  };

  return <span>{formatTime(time)}</span>;
};

export default MatchTimer;
