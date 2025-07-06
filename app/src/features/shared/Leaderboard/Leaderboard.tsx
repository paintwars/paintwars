import React, { useState } from "react";
import { IonSegment, IonSegmentButton, IonLabel } from "@ionic/react";
import { useAccount } from "wagmi";
import "./Leaderboard.scss";
import {
  selectControlOfOwner,
  selectUsedOfOwner,
} from "$features/pixels/pixel.slice";
import { selectPixelEventsOfUser } from "$features/pixels/pixelEvents.slice";
import { calculateScore } from "$features/user/calculateScore";
import { useAppSelector } from "$store/hooks";

interface LeaderboardMenuProps {}

const LeaderboardMenu: React.FC<LeaderboardMenuProps> = () => {
  // const allUsersOwned = useAppSelector((state) =>
  //   selectOwnersSortedByControl(state, user)
  // );
  // const allUsersStaked = useAppSelector((state) =>
  //   selectOwnersSortedByStake(state, user)
  // );
  // const dataByPixels = allUsersOwned.map(({ owner, count }) => ({
  //   user: owner,
  //   value: count,
  // }));
  // const dataByStaked = allUsersStaked.map(({ owner, totalStaked }) => ({
  //   user: owner,
  //   value: totalStaked,
  // }));
  const { address: user } = useAccount();
  const owned = useAppSelector((state) => selectControlOfOwner(state, user));
  const staked = useAppSelector((state) => selectUsedOfOwner(state, user));
  const moves = useAppSelector((state) => selectPixelEventsOfUser(state, user));
  const score = calculateScore(owned, staked, moves);
  const [open, setOpen] = useState(false);
  const [segment, setSegment] = useState<"first" | "second">("first");

  const dataByScore = [
    { user: "me", value: score },
    { user: "Pepe", value: 1292 },
    { user: "Giorgeow", value: 434 },
    // ...
  ];
  const dataByPixels = [
    { user: "me", value: owned },
    { user: "Pepe", value: 2 },
    { user: "Giorgeow", value: 1 },
    // ...
  ];

  const currentData = () => {
    switch (segment) {
      case "first":
        return dataByScore;
      case "second":
        return dataByPixels;
    }
  };

  return (
    <div className={`leaderboard-menu ${open ? "open" : ""}`}>
      <button
        className="toggle-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close leaderboard" : "Open leaderboard"}
      >
        {open ? "<" : ">"}
      </button>

      <div className="leaderboard-content">
        <IonSegment
          value={segment}
          onIonChange={(e) => setSegment(e.detail.value as any)}
        >
          <IonSegmentButton
            value="first"
            className={segment === "first" ? "selected" : ""}
          >
            <IonLabel>Score</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton
            value="second"
            className={segment === "second" ? "selected" : ""}
          >
            <IonLabel>Pixels</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <ul>
          {currentData().map((item, idx) => (
            <li
              key={idx}
              className={
                // highlight if it's your real address *or* the "me" placeholder
                item.user === "me" ||
                item.user?.toLowerCase() === user?.toLowerCase()
                  ? "highlighted"
                  : ""
              }
            >
              <span className="user-name">{item.user}</span>
              <span className="user-value">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default React.memo(LeaderboardMenu);
