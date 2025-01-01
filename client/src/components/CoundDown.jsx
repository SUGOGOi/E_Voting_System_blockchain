import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client';

const CoundDown = () => {
    const [countdown, setCountdown] = useState(0); // Raw countdown in seconds
    const [isPaused, setIsPaused] = useState(true);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const socket = React.useRef(null);
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${String(hours).padStart(2, '0')} hr :${String(minutes).padStart(2, '0')} min :${String(seconds).padStart(2, '0')} sec `;
    };

    useEffect(() => {
        // Connect to the backend WebSocket
        socket.current = io('http://localhost:5000');

        // Listen for countdown updates
        socket.current.on('countdown', ({ countdownValue, isPaused }) => {
            setCountdown(countdownValue);
            setIsPaused(isPaused);
        });

        return () => {
            socket.current.disconnect();
        };
    }, []);
    const handleSetCountdown = () => {
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        socket.current.emit('setCountdown', totalSeconds);
      };
    
      const handleStart = () => {
        socket.current.emit('startCountdown');
      };
    
      const handlePause = () => {
        socket.current.emit('pauseCountdown');
      };
    
      const handleReset = () => {
        socket.current.emit('resetCountdown');
        setHours(0);
        setMinutes(0);
        setSeconds(0);
      };
    return (
        <div>
            <h2>{formatTime(countdown)}</h2>
        </div>
    )
}

export default CoundDown