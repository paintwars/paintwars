// src/components/LeaderboardMenu.tsx
import React, { useState } from "react";
import { IonSegment, IonSegmentButton, IonLabel } from "@ionic/react";
import { useAccount } from "wagmi";
import "./Leaderboard.scss";
import { useAppSelector } from "$store/hooks";
import {
  selectOwnersSortedByControl,
  selectOwnersSortedByStake,
} from "$features/pixels/pixel.slice";

interface LeaderboardMenuProps {}

const LeaderboardMenu: React.FC<LeaderboardMenuProps> = () => {
  const { address: user } = useAccount();
  const allUsersOwned = useAppSelector((state) =>
    selectOwnersSortedByControl(state, user)
  );
  const allUsersStaked = useAppSelector((state) =>
    selectOwnersSortedByStake(state, user)
  );
  const dataByPixels = allUsersOwned.map(({ owner, count }) => ({
    user: owner,
    value: count,
  }));
  const dataByStaked = allUsersStaked.map(({ owner, totalStaked }) => ({
    user: owner,
    value: totalStaked,
  }));

  const [open, setOpen] = useState(false);
  const [segment, setSegment] = useState<"pixels" | "staked">("pixels");

  const currentData = () =>
    segment === "pixels" ? dataByPixels : dataByStaked;

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
            value="pixels"
            className={segment === "pixels" ? "selected" : ""}
          >
            <IonLabel>Pixels</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton
            value="staked"
            className={segment === "staked" ? "selected" : ""}
          >
            <IonLabel>Staked</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <ul>
          {currentData().map((item, idx) => (
            <li
              key={idx}
              className={
                item.user.toLowerCase() === user?.toLowerCase()
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
