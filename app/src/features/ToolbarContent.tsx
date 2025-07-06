import { memo } from "react";
import { selectControlOfOwner, selectUsedOfOwner } from "./pixels/pixel.slice";
import { useAppSelector } from "$store/hooks";
import { useAccount } from "wagmi";
import { calculateScore } from "./user/calculateScore";
import { selectPixelEventsOfUser } from "./pixels/pixelEvents.slice";

type Props = {};
const ToolbarContent: React.FC<Props> = ({}) => {
  const { address: user } = useAccount();
  const owned = useAppSelector((state) => selectControlOfOwner(state, user));
  const staked = useAppSelector((state) => selectUsedOfOwner(state, user));
  const moves = useAppSelector((state) => selectPixelEventsOfUser(state, user));
  const score = calculateScore(owned, staked, moves);
  const place = 1;

  return (
    <>
      <div id="toolbar">
        <div className="logo hide-md">
          <div id="logo-text">
            <span>paintwars</span>
          </div>
        </div>
        <div id="scores-container">
          <div className="score-input">
            <p>Owned:</p>
            <p>{owned}</p>
          </div>
          <div className="score-input">
            <p>Staked:</p>
            <p>{staked.toFixed(2)}$</p>
          </div>
          <div className="score-input">
            <p>Moves:</p>
            <p>{moves}</p>
          </div>
          <div className="score-input">
            <p>Score:</p>
            <p>
              {score} (#{place})
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(ToolbarContent);
