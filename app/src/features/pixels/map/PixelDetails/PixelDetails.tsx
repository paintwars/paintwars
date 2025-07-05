import { memo, useEffect, useState } from "react";
import "./PixelDetails.scss";
import { useAppSelector, useAppDispatch } from "$store/hooks";

import {
  IonButtons,
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonLabel,
  IonFooter,
  IonSegment,
  IonSegmentView,
  IonSegmentContent,
  IonSegmentButton,
} from "@ionic/react";
import { closeSharp } from "ionicons/icons";
import {
  selectControlOfOwner,
  selectPixelById,
  selectTVL,
  setSelectedPixel,
} from "$features/pixels/pixel.slice";
import { colorToString, shortenAddress } from "$features/shared/utils";
import ActivityChart from "./ActivityChart/ActivityChart";
import StakeModal from "$features/pixels/modals/StakeModal/StakeModal";
import { PIXEL_IDS } from "$features/pixels/pixels.utils";
import { selectPixelEventsOfPixel } from "$features/pixels/pixelEvents.slice";
import PixelHistory from "./PixelHistory";

type Props = {};
const PixelDetails: React.FC<Props> = ({}) => {
  const selectedPixelId = useAppSelector((state) => state.pixels.selectedPixel);
  const tvl = useAppSelector(selectTVL);
  const pixel = useAppSelector((state) =>
    selectPixelById(state, selectedPixelId ?? -1)
  );
  const controls = useAppSelector((state) =>
    selectControlOfOwner(state, pixel?.owner!)
  );
  const dispatch = useAppDispatch();

  const [isLeftOpen, setIsLeftOpen] = useState<boolean>(true);
  const [isRightOpen, setIsRightOpen] = useState<boolean>(true);

  function toggleIsLeftOpen() {
    setIsLeftOpen((previous) => !previous);
  }
  function toggleIsRightOpen() {
    setIsRightOpen((previous) => !previous);
  }

  return (
    <>
      <IonModal isOpen={!!pixel}>
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
      </IonModal>
    </>
  );
};

export default memo(PixelDetails);
