import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'

interface YouTubeEmbedProps {
  videoId: string
}

export interface YouTubeEmbedRef {
  playVideo: () => void
  pauseVideo: () => void
}

const YouTubeEmbed = forwardRef<YouTubeEmbedRef, YouTubeEmbedProps>(
  ({ videoId }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useImperativeHandle(ref, () => ({
      playVideo: () => {
        if (iframeRef.current) {
          iframeRef.current.contentWindow?.postMessage(
            '{"event":"command","func":"playVideo","args":""}',
            '*'
          )
        }
      },
      pauseVideo: () => {
        if (iframeRef.current) {
          iframeRef.current.contentWindow?.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            '*'
          )
        }
      },
    }))

    useEffect(() => {
      // This effect ensures the iframe is ready to receive commands
      // In a more robust implementation, you'd listen for the YouTube Iframe API's onReady event.
      // For this project's scope, we'll assume it's ready shortly after mounting.
    }, [videoId])

    return (
      <div className="youtube-embed-container">
        <iframe
          ref={iframeRef}
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video player"
        ></iframe>
      </div>
    )
  }
)

export default YouTubeEmbed
