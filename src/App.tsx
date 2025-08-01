import { useState, useEffect, useRef } from 'react'
import YouTubeEmbed, { type YouTubeEmbedRef } from './YouTubeEmbed'
import './App.css'

const POMODORO_DURATION = 60 * 20 // 20 minutes in seconds

type Phase = 'Pomodoro' | 'Short Break' | 'Long Break'

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

function App() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [phase, setPhase] = useState<Phase>('Pomodoro')
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_DURATION)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const youtubeRef = useRef<YouTubeEmbedRef>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    audioRef.current = new Audio()
  }, [])

  const playSound = (soundFile: string, onEndedCallback?: () => void) => {
    if (audioRef.current) {
      audioRef.current.src = `/public/${soundFile}`
      audioRef.current.onended = onEndedCallback || null
      audioRef.current.play()
    }
  }

  const startTimer = () => {
    if (timeRemaining < POMODORO_DURATION && timeRemaining > 0) {
      setIsActive(true)
      youtubeRef.current?.playVideo()
    } else {
      setIsCountingDown(true)
      playSound('starting_countdown.mp3', () => {
        setIsActive(true)
        setIsCountingDown(false)
        youtubeRef.current?.playVideo()
      })
    }
  }

  const cancelTimer = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsActive(false)
    setIsCountingDown(false)
    setPhase('Pomodoro')
    setTimeRemaining(POMODORO_DURATION)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const pauseTimer = () => {
    setIsActive(false)
    youtubeRef.current?.pauseVideo()
  }

  const resetTimer = () => {
    setIsActive(false)
    setPhase('Pomodoro')
    setTimeRemaining(POMODORO_DURATION)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1)
      }, 1000)
    } else if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current)
    } else if (isActive && timeRemaining === 0) {
      playSound('time_is_up.mp3')

      if (phase === 'Pomodoro') {
        setPomodoroCount(prevCount => prevCount + 1)
      }

      setPhase('Pomodoro')
      setTimeRemaining(POMODORO_DURATION)
      youtubeRef.current?.pauseVideo()
      setIsActive(false)
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

  useEffect(() => {
    const extractVideoId = (url: string) => {
      const youtubeRegex =
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      const match = url.match(youtubeRegex)
      return match ? match[1] : ''
    }

    setVideoId(extractVideoId(youtubeUrl))
  }, [youtubeUrl])

  return (
    <div className="pomodoro-app">
      <h1>Youtube Pomodoro Player</h1>
      <div className="youtube-input">
        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={youtubeUrl}
          onChange={e => setYoutubeUrl(e.target.value)}
        />
      </div>
      {videoId && <YouTubeEmbed ref={youtubeRef} videoId={videoId} />}
      <div className="phase-display">{phase}</div>
      <div className="timer-display">{formatTime(timeRemaining)}</div>
      <div className="controls">
        {isCountingDown ? (
          <button onClick={cancelTimer} className="cancel-button">
            Cancel
          </button>
        ) : !isActive ? (
          <button onClick={startTimer}>
            {timeRemaining < POMODORO_DURATION ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button onClick={pauseTimer}>Pause</button>
        )}
        <button
          onClick={resetTimer}
          disabled={
            isCountingDown || isActive || timeRemaining === POMODORO_DURATION
          }
        >
          Reset
        </button>
      </div>
      <div className="pomodoro-count">Pomodoros Completed: {pomodoroCount}</div>
    </div>
  )
}

export default App
