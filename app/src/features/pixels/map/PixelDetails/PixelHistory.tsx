import { selectPixelEventsOfPixel } from "$features/pixels/pixelEvents.slice";
import { colorToString } from "$features/shared/utils";
import { useAppSelector } from "$store/hooks";
import { IonButton } from "@ionic/react";
import { memo } from "react";

type Props = {
  pixelId: number;
};
const PixelHistory: React.FC<Props> = ({ pixelId }) => {
  const events = useAppSelector((state) =>
    selectPixelEventsOfPixel(state, pixelId)
  );

  return (
    <>
      {Array.from({ length: 5 }).map((_, idx) => {
        const eventIdx = events.length - 5 + idx;
        const event = eventIdx < 0 ? { color: 0xffffff } : events[eventIdx];
        return (
          <div
            className="color-block"
            style={{
              backgroundColor: colorToString(event.color),
            }}
          ></div>
        );
      })}
    </>
  );
};

export default memo(PixelHistory);
