import { memo } from "react";
import "./ChoiceWheel.scss";
import { useAppSelector } from "$store/hooks";
const ChoiceWheel = () => {
  return null;
  const show = useAppSelector(
    (state) => state.pixels.selectedPixel !== undefined
  );
  const x = useAppSelector((state) => state.pixels.selectedClientX);
  const y = useAppSelector((state) => state.pixels.selectedClientY);

  console.log(x, y);
  return (
    <div
      className={`radial-menu ${show ? "show" : ""}`}
      style={{ top: y, left: x }}
    >
      <button data-action="stake">🚩</button>
      <button data-action="fortify">🛡️</button>
      <button data-action="weaken">💥</button>
      <button data-action="swap">🔁</button>
      <button data-action="shuffle">🎲</button>
    </div>
  );
};

export default memo(ChoiceWheel);
