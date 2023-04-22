import type { Element, ElementSize, ElementType, ViewContext2D } from '@idraw/types';

const wrapperColor = '#1973ba';

export type ControllerStyle = ElementSize & {
  borderWidth: number;
  borderColor: string;
  bgColor: string;
};

export function calcElementControllerStyle(elemSize: ElementSize): Record<string, ControllerStyle> {
  const bw = 0; // TODO

  const ctrlSize = 8;
  const ctrlBgColor = '#FFFFFF';
  const ctrlBorderWidth = 2;
  const ctrlBorderColor = wrapperColor;
  const { x, y, w, h } = elemSize;
  const sizeControllers: Record<string, ControllerStyle> = {
    topLeft: {
      x: x - bw - ctrlSize / 2,
      y: y - bw - ctrlSize / 2,
      w: ctrlSize,
      h: ctrlSize,
      borderWidth: ctrlBorderWidth,
      borderColor: ctrlBorderColor,
      bgColor: ctrlBgColor
    },
    top: {
      x: x - bw + w / 2 - ctrlSize / 2,
      y: y - bw - ctrlSize / 2,
      w: ctrlSize,
      h: ctrlSize,
      borderWidth: ctrlBorderWidth,
      borderColor: ctrlBorderColor,
      bgColor: ctrlBgColor
    },
    topRight: {
      x: x + w - bw - ctrlSize / 2,
      y: y - bw - ctrlSize / 2,
      w: ctrlSize,
      h: ctrlSize,
      borderWidth: ctrlBorderWidth,
      borderColor: ctrlBorderColor,
      bgColor: ctrlBgColor
    },
    right: {
      x: x + w - bw - ctrlSize / 2,
      y: y + h / 2 - bw - ctrlSize / 2,
      w: ctrlSize,
      h: ctrlSize,
      borderWidth: ctrlBorderWidth,
      borderColor: ctrlBorderColor,
      bgColor: ctrlBgColor
    },
    bottomRight: {
      x: x + w - bw - ctrlSize / 2,
      y: y + h - bw - ctrlSize / 2,
      w: ctrlSize,
      h: ctrlSize,
      borderWidth: ctrlBorderWidth,
      borderColor: ctrlBorderColor,
      bgColor: ctrlBgColor
    },
    bottom: {
      x: x + w / 2 - bw - ctrlSize / 2,
      y: y + h - bw - ctrlSize / 2,
      w: ctrlSize,
      h: ctrlSize,
      borderWidth: ctrlBorderWidth,
      borderColor: ctrlBorderColor,
      bgColor: ctrlBgColor
    },
    bottomLeft: {
      x: x - bw - ctrlSize / 2,
      y: y + h - bw - ctrlSize / 2,
      w: ctrlSize,
      h: ctrlSize,
      borderWidth: ctrlBorderWidth,
      borderColor: ctrlBorderColor,
      bgColor: ctrlBgColor
    },
    left: {
      x: x - bw - ctrlSize / 2,
      y: y + h / 2 - bw - ctrlSize / 2,
      w: ctrlSize,
      h: ctrlSize,
      borderWidth: ctrlBorderWidth,
      borderColor: ctrlBorderColor,
      bgColor: ctrlBgColor
    }
  };
  return sizeControllers;
}