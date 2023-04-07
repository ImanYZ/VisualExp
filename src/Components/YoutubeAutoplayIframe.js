import React, { useEffect, useRef } from "react"

const YoutubeAutoplayIframe = ({ url }) => {
  const iframeRef = useRef(null)
  useEffect(() => {
    if(!iframeRef.current) return;
    // iframeRef.current
    iframeRef.current.src = ""
    iframeRef.current.src = url
  }, [iframeRef])
  return (
    <iframe
      ref={iframeRef}
      width="100%"
      height="100%"
      src={url}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  )
}

export default YoutubeAutoplayIframe;