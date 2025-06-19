// import * as Player from "@livepeer/react/player";
import * as Player from "@livepeer/react/player";
import { getSrc } from "@livepeer/react/external";
import { PauseIcon, PlayIcon } from "@livepeer/react/assets";


const playbackId = "f5eese9wwl88k4g8";

// fetch the playback info on the server, using React Server Components
// or regular API routes
export const getPlaybackSource = async (playbackId: any) => {
  const response = await fetch(`/livepeer/${playbackId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch playback info');
  }

  const playbackInfo = await response.json();
  const src = getSrc(playbackInfo);

  return src;
};

// pass the parsed playback info Src[] into the player
export const PlayerComponent = ({ src }: { src: Src[] | null }) => {
  return (
    <Player.Root src={src}>
      <Player.Container>
        <Player.Video />

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