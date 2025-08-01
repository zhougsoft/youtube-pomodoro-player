import { useState, useEffect, useRef } from 'react'
import './App.css'

const POMODORO_DURATION = 20 * 60 // 20 minutes in seconds

type Phase = 'Pomodoro' | 'Short Break' | 'Long Break'

function App() {
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_DURATION)
  const [isActive, setIsActive] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [phase, setPhase] = useState<Phase>('Pomodoro')
  const [pomodoroCount, setPomodoroCount] = useState(0)

  const intervalRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playSound = (soundFile: string, onEndedCallback?: () => void) => {
    if (audioRef.current) {
      audioRef.current.src = `/public/${soundFile}`
      audioRef.current.onended = onEndedCallback || null
      audioRef.current.play()
    }
  }

  useEffect(() => {
    audioRef.current = new Audio() // Initialize Audio object
  }, [])

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1)
      }, 1000)
    } else if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current)
    } else if (isActive && timeRemaining === 0) {
      playSound('time_is_up.mp3')
      handlePhaseEnd()
    }

    if (timeRemaining === 5 * 60 && phase === 'Pomodoro') {
      playSound('5_mins_remaining.mp3')
    } else if (timeRemaining === 1 * 60 && phase === 'Pomodoro') {
      playSound('1_min_remaining.mp3')
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, timeRemaining, phase])

  const handlePhaseEnd = () => {
    if (phase === 'Pomodoro') {
      setPomodoroCount(prevCount => prevCount + 1)
    }
    setPhase('Pomodoro')
    setTimeRemaining(POMODORO_DURATION)
    setIsActive(false)
  }

  const startTimer = () => {
    setIsCountingDown(true);
    playSound('starting_countdown.mp3', () => {
      setIsActive(true);
      setIsCountingDown(false);
    });
  };

  const cancelTimer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsActive(false);
    setIsCountingDown(false);
    setPhase('Pomodoro');
    setTimeRemaining(POMODORO_DURATION);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const pauseTimer = () => {
    setIsActive(false)
  }

  const resetTimer = () => {
    setIsActive(false)
    setPhase('Pomodoro')
    setTimeRemaining(POMODORO_DURATION)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <div className='pomodoro-app'>
      <h1>Pomodoro Timer</h1>
      <div className='phase-display'>{phase}</div>
      <div className='timer-display'>{formatTime(timeRemaining)}</div>
      <div className='controls'>
        {isCountingDown ? (
          <button onClick={cancelTimer} className="cancel-button">Cancel</button>
        ) : !isActive ? (
          <button onClick={startTimer}>Start</button>
        ) : (
          <button onClick={pauseTimer}>Pause</button>
        )}
        <button onClick={resetTimer} disabled={isCountingDown}>Reset</button>
      </div>
      <div className='pomodoro-count'>Pomodoros Completed: {pomodoroCount}</div>
    </div>
  )
}

export default App
