import { memo, useEffect, useRef, useState } from "react";
import "./PixelDetails.scss";
import { useAppDispatch, useAppSelector } from "$store/hooks";

import ColorPickerPopover from "$features/pixels/modals/ColorPickerPopover/ColorPickerPopover";
import StakeAmountPopover from "$features/pixels/modals/StakeAmountPopover/StakeAmountPopover";
import StakeButton from "$features/pixels/modals/StakeModal/StakeButton";
import StakeModal from "$features/pixels/modals/StakeModal/StakeModal";
import {
  selectControlOfOwner,
  selectPixelById,
  selectTVL,
  setSelectedPixel,
} from "$features/pixels/pixel.slice";
import { selectPixelEventsOfPixel } from "$features/pixels/pixelEvents.slice";
import { PIXEL_IDS } from "$features/pixels/pixels.utils";
import Tooltip from "$features/shared/Tooltip/Tooltip";
import { usePXMTBalance } from "$features/shared/hooks/usePXMTBalance";
import { colorToString, shortenAddress } from "$features/shared/utils";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonSegmentContent,
  IonSegmentView,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  closeSharp,
  magnetSharp,
  pauseSharp,
  resizeSharp,
  shieldSharp,
  snowSharp,
  walletSharp,
} from "ionicons/icons";
import ActivityChart from "./ActivityChart/ActivityChart";
import PixelHistory from "./PixelHistory";

const PixelDetails: React.FC = () => {
  const balance = usePXMTBalance();
  const selectedPixelId = useAppSelector((state) => state.pixels.selectedPixel);
  const tvl = useAppSelector(selectTVL);
  const pixel = useAppSelector((state) =>
    selectPixelById(state, selectedPixelId ?? -1)
  );

  const [color, setColor] = useState<number>(pixel?.color ?? 0x000000);
  const [amount, setAmount] = useState<number>(0);
  const [isStaking, setIsStaking] = useState(false);

  return (
    <>
      <IonLabel className="section-title pixel-details-header">
        <div
          className="pixel"
          style={
            pixel
              ? ({
                  "--color": pixel.color
                    ? colorToString(pixel.color)
                    : "transparent",
                } as React.CSSProperties)
              : undefined
          }
        />
        <div className="name">
          {pixel ? (
            <div>
              pixel#<span>{pixel?.id ?? 0}</span> ({pixel?.x ?? 0},
              {pixel?.y ?? 0})
            </div>
          ) : (
            <div>No pixel selected</div>
          )}
        </div>
        <Tooltip text="Most funded projects" />
      </IonLabel>
      {pixel ? (
        <div className="section-content">
          <div className="content">
            <div className="info">
              <div className="info-title">history</div>
              <div className="color-blocks">
                <PixelHistory pixelId={selectedPixelId || 0} />
              </div>
            </div>
            <div className="info">
              <div className="info-title">owner</div>
              <div className="info-value">
                {shortenAddress(pixel?.owner ?? "")}
              </div>
            </div>
            <div className="info">
              <div className="info-title">staked</div>
              <div className="info-value">
                {pixel?.stakeAmount?.toFixed(2)}
                <div className="unit">{pixel && "$"}</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "2px",
                justifyContent: "space-evenly",
              }}
            >
              <IonButton
                className="input-button"
                style={{ color: "white" }}
                fill="outline"
                onClick={() => setIsStaking((curr) => !curr)}
              >
                <IonIcon icon={walletSharp} />
              </IonButton>
              <IonButton
                className="input-button"
                style={{ color: "white" }}
                fill="outline"
              >
                <IonIcon icon={snowSharp} />
              </IonButton>
              <IonButton
                className="input-button"
                style={{ color: "white" }}
                fill="outline"
              >
                <IonIcon icon={shieldSharp} />
              </IonButton>
              <IonButton
                className="input-button"
                style={{ color: "white" }}
                fill="outline"
              >
                <IonIcon icon={pauseSharp} />
              </IonButton>
              <IonButton
                className="input-button"
                style={{ color: "white" }}
                fill="outline"
              >
                <IonIcon icon={magnetSharp} />
              </IonButton>
            </div>
            {isStaking ? (
              <div>
                <div className="info">
                  <div className="info-title">Set new color</div>
                  <IonButton
                    fill="clear"
                    id="stake-color-input"
                    style={{
                      width: "36px",
                      height: "12px",
                      backgroundColor: color ? colorToString(color) : "white",
                    }}
                  />
                  <ColorPickerPopover color={color} onColorChange={setColor} />
                  <div className="info-value">
                    <IonButton
                      className="input-button"
                      fill="clear"
                      id="stake-trigger"
                    >
                      <IonLabel>
                        <span>Stake PXMT</span>
                      </IonLabel>
                    </IonButton>
                    <StakeAmountPopover
                      trigger={"stake-trigger"}
                      onStakeAmountSet={setAmount}
                    />
                  </div>
                </div>
                {color &&
                amount &&
                (!pixel.stakeAmount || amount !== pixel.stakeAmount) ? (
                  <StakeButton
                    amount={amount}
                    balance={balance}
                    color={color}
                    pixelId={pixel.id}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {/* <IonModal isOpen={!!pixel}>
        <IonHeader>
          <IonToolbar className="header-toolbar">
            <IonButtons slot="start">
              <IonButton>
                <div
                  className="pixel"
                  style={
                    {
                      "--color": pixel
                        ? colorToString(pixel.color!)
                        : "transparent",
                    } as any
                  }
                />
              </IonButton>
            </IonButtons>
            <IonTitle>
              <div className="name">
                pixel#<span>{pixel?.id ?? 0}</span> ({pixel?.x ?? 0},
                {pixel?.y ?? 0})
              </div>
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="section">
            <div className="content">
              <div className="info">
                <div className="info-title">history</div>
                <div className="color-blocks">
                  <PixelHistory pixelId={selectedPixelId || 0} />
                </div>
              </div>
              <div className="info">
                <div className="info-title">owner</div>
                <div className="info-value">
                  {shortenAddress(pixel?.owner ?? "")}
                </div>
              </div>
              <div className="info">
                <div className="info-title">staked</div>
                <div className="info-value">
                  {pixel?.stakeAmount!.toFixed(2)} <div className="unit">$</div>
                </div>
              </div>
            </div>
          </div>
          <IonSegmentContent id="third">
            {selectedPixelId && <ActivityChart pixelId={selectedPixelId!} />}
          </IonSegmentContent>
        </IonContent>
      </IonModal> */}
    </>
  );
};

export default memo(PixelDetails);
