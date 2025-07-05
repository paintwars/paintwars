import type { IPixel } from '@/types';
import { type Container, Graphics } from 'pixi.js';
import { memo, useEffect, useRef, useState } from 'react';
import { BASE_PIXEL_SIZE, BORDER_SIZE } from './GridDisplay';

type GraphicsWithData = Graphics & {
  customData: { isSelected: boolean };
};

const DEFAULT_COLOR = 0x000000; // Default black color

function drawPx(
  px: GraphicsWithData,
  color: number,
  x: number,
  y: number,
  isHovered = false
): void {
  px.clear();
  const { isSelected } = px.customData;
  if (isSelected) {
    px.rect(x * BASE_PIXEL_SIZE, y * BASE_PIXEL_SIZE, BASE_PIXEL_SIZE, BASE_PIXEL_SIZE).fill({
      color: 0xe2b714,
    });
    px.rect(
      x * BASE_PIXEL_SIZE + BORDER_SIZE,
      y * BASE_PIXEL_SIZE + BORDER_SIZE,
      BASE_PIXEL_SIZE - BORDER_SIZE * 2,
      BASE_PIXEL_SIZE - BORDER_SIZE * 2
    ).fill({ color: color });
  } else if (isHovered) {
    px.rect(x * BASE_PIXEL_SIZE, y * BASE_PIXEL_SIZE, BASE_PIXEL_SIZE, BASE_PIXEL_SIZE).fill({
      color: 0x2c2e31,
    });
    px.rect(
      x * BASE_PIXEL_SIZE + BORDER_SIZE,
      y * BASE_PIXEL_SIZE + BORDER_SIZE,
      BASE_PIXEL_SIZE - BORDER_SIZE * 2,
      BASE_PIXEL_SIZE - BORDER_SIZE * 2
    ).fill({ color: color });
  } else {
    px.rect(x * BASE_PIXEL_SIZE, y * BASE_PIXEL_SIZE, BASE_PIXEL_SIZE, BASE_PIXEL_SIZE).fill({
      color: color,
    });
  }
}

type Props = { id: number; layer: Container };
const PixelDisplay: React.FC<Props> = ({ layer }) => {
  const [selectedPixel, setSelectedPixel] = useState<IPixel | null>(null);

  const pixelRef = useRef<IPixel>(selectedPixel);
  const pxRef = useRef<GraphicsWithData | null>(null);

  useEffect(() => {
    if (pxRef.current || !layer) return;
    const px = new Graphics() as GraphicsWithData;

    px.customData = { isSelected: false     };

    px.eventMode = 'static';
    px.cursor = 'pointer';

    px.on('click', (e) => {
      e.stopPropagation();
      setSelectedPixel(pixelRef.current);
    });

    px.on('touchstart', (e) => {
      e.stopPropagation();
      setSelectedPixel(pixelRef.current);
    });

    px.on('pointerover', () => {
      drawPx(
        px,
        pixelRef.current?.color ?? DEFAULT_COLOR,
        pixelRef.current?.x??0,
        pixelRef.current?.y??0,
        true
      );
    });

    px.on('pointerout', () => {
      drawPx(
        px,
        pixelRef.current?.color ?? DEFAULT_COLOR,
        pixelRef.current?.x ?? 0,
        pixelRef.current?.y ?? 0,
        false
      );
    });

    pxRef.current = px;
    layer.addChild(px);
    return () => {
      layer.removeChild(px);
      px.destroy();
      pxRef.current = null;
    };
  }, [layer]);

  return null;
};

export default memo(PixelDisplay);
