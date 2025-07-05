import { memo } from "react";
import "./ChoiceWheel.scss";
import { useAppSelector } from "$store/hooks";
import PieMenu, { Slice } from "react-pie-menu";

const ChoiceWheel = () => {
  const show = useAppSelector(
    (state) => state.pixels.selectedPixel !== undefined
  );
  const x = useAppSelector((state) => state.pixels.selectedClientX);
  const y = useAppSelector((state) => state.pixels.selectedClientY);

  console.log(x, y);
  return (
    <PieMenu
      radius="100px"
      centerRadius="20px"
      centerX={`${Math.round(x ?? 0)}px`}
      centerY={`${Math.round((y || 0) - 60)}px`}
    >
      {/* Contents */}
      <Slice>
        <div>stake</div>
      </Slice>
      <Slice>
        <div>fortify</div>
      </Slice>
      <Slice>
        <div>weaken</div>
      </Slice>
      <Slice>
        <div>swap</div>
      </Slice>
      <Slice>
        <div>shuffle</div>
      </Slice>
    </PieMenu>
  );
};

export default memo(ChoiceWheel);
