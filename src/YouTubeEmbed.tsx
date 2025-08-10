import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const SCRIPT_SRC = 'https://www.youtube.com/iframe_api'
const PAGE_ORIGIN = typeof window !== 'undefined' ? window.location.origin : ''

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export interface YouTubeEmbedRef {
  playVideo: () => void
  pauseVideo: () => void
}

let apiPromise: Promise<void> | null = null

function loadYouTubeAPI(): Promise<void> {
  if (apiPromise) return apiPromise

  apiPromise = new Promise<void>((resolve, reject) => {
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }

    window.onYouTubeIframeAPIReady = () => resolve()

    if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.onerror = reject
      document.head.appendChild(script)
    }
  })

  return apiPromise
}

interface YouTubeEmbedProps {
  videoId: string
}

const YouTubeEmbed = forwardRef<YouTubeEmbedRef, YouTubeEmbedProps>(
  ({ videoId }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<any>(null)

    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      console.error(`YouTubeEmbed: invalid video id "${videoId}"`)
      return null
    }

    useImperativeHandle(ref, () => ({
      playVideo: () => playerRef.current?.playVideo(),
      pauseVideo: () => playerRef.current?.pauseVideo(),
    }))

    useEffect(() => {
      let cancelled = false

      loadYouTubeAPI()
        .then(() => {
          if (cancelled || !containerRef.current) return

          const playerVars: Record<string, any> = {
            origin: PAGE_ORIGIN,
            modestbranding: 1,
            rel: 0,
            loop: 1,
            playlist: videoId,
            playsinline: 1,
          }

          playerRef.current = new window.YT.Player(containerRef.current, {
            videoId,
            playerVars,
            events: {
              onReady: (event: any) => {
                const iframe = event.target.getIframe() as HTMLIFrameElement
                iframe.setAttribute('title', `YouTube video ${videoId}`)
                iframe.setAttribute(
                  'allow',
                  'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'
                )
              },
            },
          })
        })
        .catch(err => console.error('YouTubeEmbed: failed to load API', err))

      return () => {
        cancelled = true
        playerRef.current?.destroy?.()
      }
    }, [videoId])

    return <div ref={containerRef} className="youtube-embed-container" />
  }
)

export default YouTubeEmbed
