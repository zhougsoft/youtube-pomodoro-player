import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import YouTube, { type YouTubeProps } from 'react-youtube'

const PAGE_ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : undefined

export interface YouTubeEmbedRef {
  playVideo: () => void
  pauseVideo: () => void
}

interface YouTubeEmbedProps {
  videoId: string
}

const YouTubeEmbed = forwardRef<YouTubeEmbedRef, YouTubeEmbedProps>(
  ({ videoId }, ref) => {
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      console.error(`YouTubeEmbed: invalid video id "${videoId}"`)
      return null
    }

    const playerRef = useRef<any>(null)

    useImperativeHandle(ref, () => ({
      playVideo: () => playerRef.current?.playVideo?.(),
      pauseVideo: () => playerRef.current?.pauseVideo?.(),
    }))

    const opts: YouTubeProps['opts'] = useMemo(
      () => ({
        playerVars: {
          origin: PAGE_ORIGIN,
          modestbranding: 1,
          rel: 0,
          loop: 1,
          playlist: videoId, // required by YT for single-video looping
          playsinline: 1,
        },
      }),
      [videoId]
    )

    const onReady: YouTubeProps['onReady'] = event => {
      playerRef.current = event.target

      // @ts-ignore
      const iframe = event.target.getIframe?.() as HTMLIFrameElement | undefined

      if (iframe) {
        iframe.setAttribute('title', `YouTube video ${videoId}`)
        iframe.setAttribute(
          'allow',
          'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'
        )
      }
    }

    const onError: YouTubeProps['onError'] = event => {
      console.error('YouTubeEmbed: player error', event?.data ?? event)
    }

    return (
      <div className="youtube-embed-container">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onError={onError}
        />
      </div>
    )
  }
)

export default YouTubeEmbed
