import * as Player from "@livepeer/react/player";
import { getSrc } from "@livepeer/react/external";
import { PauseIcon, PlayIcon } from "lucide-react";
import { ApiStrings } from "@/lib/apiStrings";

// const playbackId = "f5eese9wwl88k4g8";

// fetch the playback info on the server, using React Server Components
// or regular API routes
export const getPlaybackSource = async (id: any) => {
//   const playbackInfo = await livepeer.playback.get(playbackId);
    const playbackInfoRes = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/${id}`);
    console.log(playbackInfoRes, 'playback info response')

  const src = getSrc(playbackInfoRes.playbackInfo);

  return src;
};

export const DemoPlayer = ({ src }: { src: Src[] | null }) => {
  return (
    <Player.Root src={src}>
      <Player.Container>
        <Player.Video title="Live stream" />

        <Player.Controls className="flex items-center justify-center">
          <Player.PlayPauseTrigger className="w-10 h-10">
            <Player.PlayingIndicator asChild matcher={false}>
              <PlayIcon />
            </Player.PlayingIndicator>
            <Player.PlayingIndicator asChild>
              <PauseIcon />
            </Player.PlayingIndicator>
          </Player.PlayPauseTrigger>
        </Player.Controls>
      </Player.Container>
    </Player.Root>
  );
};