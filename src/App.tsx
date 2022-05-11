import { FC, useEffect, useRef, useState } from "react";
import "./App.css";
import Peer, { MediaConnection } from "skyway-js";

const App: FC = () => {
  const videoEl = useRef<HTMLVideoElement>(null);
  const targetVideoEl = useRef<HTMLVideoElement>(null);
  const [peerId, setPeerId] = useState<string>("");
  const [targetPeerId, setTargetPeerId] = useState<string>("");
  const localStreamRef = useRef<MediaStream>();
  const peerRef = useRef<Peer>();
  useEffect(() => {
    // カメラ映像取得
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // 成功時にvideo要素にカメラ映像をセットし、再生
        if (videoEl.current !== null) {
          videoEl.current.srcObject = stream;
          void videoEl.current.play().catch((e) => console.error(e));
          // 着信時に相手にカメラ映像を返せるように、グローバル変数に保存しておく
          localStreamRef.current = stream;
        }
      })
      .catch((error) => {
        // 失敗時にはエラーログを出力
        console.error("mediaDevice.getUserMedia() error:", error);
        return;
      });
    const peer = new Peer({ key: "1dd51641-bec7-407c-aea4-dd52b869a73b" });
    peer.on("open", () => {
      setPeerId(peer.id);
    });
    peer.on('call', mediaConnection => {
        console.log("着信")
        mediaConnection.answer(localStreamRef.current);
        setEventListener(mediaConnection);
    });
    peerRef.current = peer;
  }, []);

  const setEventListener = (mediaConnection: MediaConnection) => {
    mediaConnection.on("stream", (stream) => {
      console.log("stream")
      // video要素にカメラ映像をセットして再生
      if (targetVideoEl.current !== null) {
        targetVideoEl.current.srcObject = stream;
        void targetVideoEl.current.play();
      }
    });
    mediaConnection.on("close", () => {
        console.log("close");
    });
    mediaConnection.on("error", () => {
        console.log("error");
    })
  };

  return (
    <div className="App">
      <video
        id="my-video"
        ref={videoEl}
        width="400px"
        autoPlay
        muted
        playsInline
      />
      <p>{peerId}</p>
      <input
        type="text"
        value={targetPeerId}
        onInput={({ currentTarget }) => setTargetPeerId(currentTarget.value)}
      />
      {peerRef.current !== undefined && localStreamRef !== undefined && (
        <button
          onClick={() => {
            const mediaConnection = peerRef.current!.call(
              targetPeerId,
              localStreamRef.current!
            );
            setEventListener(mediaConnection);
          }}
        >
          発信
        </button>
      )}
      <video
        id="their-video"
        ref={targetVideoEl}
        width="400px"
        autoPlay
        muted
        playsInline
      />
    </div>
  );
};

export default App;
