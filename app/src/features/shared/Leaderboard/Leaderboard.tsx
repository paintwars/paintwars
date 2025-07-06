// src/components/LeaderboardMenu.tsx
import React, { useState } from "react";
import { IonSegment, IonSegmentButton, IonLabel } from "@ionic/react";
import { useAccount } from "wagmi";
import "./Leaderboard.scss";

interface LeaderboardMenuProps {}

const LeaderboardMenu: React.FC<LeaderboardMenuProps> = () => {
  // const { address: user } = useAccount();
  const user = "User2";
  const [open, setOpen] = useState(false);
  const [segment, setSegment] = useState<"first" | "second">("first");

  // TODO: Replace with real data
  const dataByScore = [
    { user: "User1", value: 1234 },
    { user: "User2", value: 2664623464624636 },
    { user: "User3", value: 1234 },
    // ...
  ];
  const dataByPixels = [
    { user: "UserA", value: 98 },
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
