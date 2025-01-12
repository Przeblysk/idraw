/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { RecursivePartial, Element, Elements, ElementPosition, ElementSize, ElementType, ViewScaleInfo, ViewSizeInfo } from '@idraw/types';
import { createUUID } from './uuid';
import {
  defaultText,
  getDefaultElementRectDetail,
  getDefaultElementCircleDetail,
  getDefaultElementTextDetail,
  getDefaultElementSVGDetail,
  getDefaultElementImageDetail,
  getDefaultElementGroupDetail
} from './config';
import { istype } from './istype';
import { findElementFromListByPosition, getElementPositionFromList } from './element';
import { deepResizeGroupElement } from './resize-element';

const defaultViewWidth = 200;
const defaultViewHeight = 200;
// const defaultDetail = getDefaultElementDetailConfig();

function createElementSize(type: ElementType, opts?: { viewScaleInfo: ViewScaleInfo; viewSizeInfo: ViewSizeInfo }): ElementSize {
  let x = 0;
  let y = 0;
  let w = defaultViewWidth;
  let h = defaultViewHeight;

  if (opts) {
    const { viewScaleInfo, viewSizeInfo } = opts;
    const { scale, offsetLeft, offsetTop } = viewScaleInfo;
    const { width, height } = viewSizeInfo;
    const limitViewWidth = width / 4;
    const limitViewHeight = height / 4;
    if (defaultViewWidth >= limitViewWidth) {
      w = limitViewWidth / scale;
    } else {
      w = defaultViewWidth / scale;
    }

    if (defaultViewHeight >= limitViewHeight) {
      h = limitViewHeight / scale;
    } else {
      h = defaultViewHeight / scale;
    }
    if (['circle', 'svg', 'image'].includes(type)) {
      w = h = Math.max(w, h);
    } else if (type === 'text') {
      const fontSize = w / defaultText.length;
      h = fontSize * 2;
    }

    x = (0 - offsetLeft + width / 2 - (w * scale) / 2) / scale;
    y = (0 - offsetTop + height / 2 - (h * scale) / 2) / scale;
  }

  const elemSize: ElementSize = {
    x,
    y,
    w,
    h
  };

  return elemSize;
}

export function createElement<T extends ElementType>(
  type: T,
  baseElem: RecursivePartial<Element<T>>,
  opts?: {
    viewScaleInfo: ViewScaleInfo;
    viewSizeInfo: ViewSizeInfo;
    limitRatio?: boolean;
  }
): Element<T> {
  const elementSize = createElementSize(type, opts);
  let detail = {};
  if (type === 'rect') {
    detail = getDefaultElementRectDetail();
  } else if (type === 'circle') {
    detail = getDefaultElementCircleDetail();
  } else if (type === 'text') {
    detail = getDefaultElementTextDetail(elementSize);
  } else if (type === 'svg') {
    detail = getDefaultElementSVGDetail();
  } else if (type === 'image') {
    detail = getDefaultElementImageDetail();
  } else if (type === 'group') {
    detail = getDefaultElementGroupDetail();
  }
  const elem: Element<T> = {
    ...elementSize,
    ...baseElem,
    uuid: createUUID(),
    type,
    detail: {
      ...detail,
      ...(baseElem.detail || {})
    }
  } as Element<T>;
  return elem;
}

export function insertElementToListByPosition(element: Element, position: ElementPosition, list: Element[]): boolean {
  let result = false;
  if (position.length === 1) {
    const pos = position[0];
    list.splice(pos, 0, element);
    result = true;
  } else if (position.length > 1) {
    let tempList: Element[] = list;
    for (let i = 0; i < position.length; i++) {
      const pos = position[i];
      const item = tempList[pos];
      if (i === position.length - 1) {
        const pos = position[i];
        tempList.splice(pos, 0, element);
        result = true;
      } else if (i < position.length - 1 && item.type === 'group') {
        tempList = (item as Element<'group'>).detail.children;
      } else {
        break;
      }
    }
  }
  return result;
}

export function deleteElementInListByPosition(position: ElementPosition, list: Element[]): boolean {
  let result = false;
  if (position.length === 1) {
    const pos = position[0];
    list.splice(pos, 1);
    result = true;
  } else if (position.length > 1) {
    let tempList: Element[] = list;
    for (let i = 0; i < position.length; i++) {
      const pos = position[i];
      const item = tempList[pos];
      if (i === position.length - 1) {
        const pos = position[i];
        tempList.splice(pos, 1);
        result = true;
      } else if (i < position.length - 1 && item.type === 'group') {
        tempList = (item as Element<'group'>).detail.children;
      } else {
        break;
      }
    }
  }
  return result;
}

export function deleteElementInList(uuid: string, list: Element[]): boolean {
  const position = getElementPositionFromList(uuid, list);
  return deleteElementInListByPosition(position, list);
}

export function moveElementPosition(
  elements: Elements,
  opts: {
    from: ElementPosition;
    to: ElementPosition;
  }
): Elements {
  const { from, to } = opts;

  // [] -> [1,2,3] or [1, 2 ,3] -> []
  if (from.length === 0 || to.length === 0) {
    return elements;
  }

  // [1] -> [1, 2, 3]
  if (from.length <= to.length) {
    for (let i = 0; i < from.length; i++) {
      if (to[i] === from[i]) {
        if (i === from.length - 1) {
          return elements;
        }
        continue;
      }
    }
  }

  const target = findElementFromListByPosition(from, elements);
  if (target) {
    const insterResult = insertElementToListByPosition(target, to, elements);
    if (!insterResult) {
      return elements;
    }

    let trimDeletePosIndex = -1;
    const trimDeletePosAction = 'down'; // +1

    for (let i = 0; i < from.length; i++) {
      if (!(to[i] >= 0)) {
        break;
      }
      if (to[i] === from[i]) {
        continue;
      }
      if (to[i] < from[i] && i == to.length - 1) {
        trimDeletePosIndex = i;
      }
    }

    if (trimDeletePosIndex >= 0) {
      if (trimDeletePosAction === 'down') {
        from[trimDeletePosIndex] = from[trimDeletePosIndex] + 1;
      }
    }

    deleteElementInListByPosition(from, elements);
  }
  return elements;
}

function mergeElement<T extends Element<ElementType> = Element<ElementType>>(originElem: T, updateContent: RecursivePartial<T>): T {
  const commonKeys = Object.keys(updateContent);
  for (let i = 0; i < commonKeys.length; i++) {
    const commonKey = commonKeys[i];
    if (['x', 'y', 'w', 'h', 'angle', 'name'].includes(commonKey)) {
      // @ts-ignore
      originElem[commonKey] = updateContent[commonKey];
    } else if (['detail', 'operations'].includes(commonKey)) {
      // @ts-ignore
      if (istype.json(updateContent[commonKey] as any)) {
        if (!(originElem as unknown)?.hasOwnProperty(commonKey)) {
          // @ts-ignore
          originElem[commonKey] = {};
        }
        // @ts-ignore
        if (istype.json(originElem[commonKey])) {
          // @ts-ignore
          originElem[commonKey] = { ...originElem[commonKey], ...updateContent[commonKey] };
        }
        // @ts-ignore
      } else if (istype.array(updateContent[commonKey] as any)) {
        if (!(originElem as unknown)?.hasOwnProperty(commonKey)) {
          // @ts-ignore
          originElem[commonKey] = [];
        }
        // @ts-ignore
        if (istype.array(originElem[commonKey])) {
          ((updateContent as any)?.[commonKey] as Array<any>)?.forEach((item, i) => {
            // @ts-ignore
            originElem[commonKey][i] = item;
          });
          // @ts-ignore
          originElem[commonKey] = [...originElem[commonKey], ...updateContent[commonKey]];
        }
      }
    }
  }
  return originElem;
}

export function updateElementInList(uuid: string, updateContent: RecursivePartial<Element<ElementType>>, elements: Element[]): Element | null {
  let targetElement: Element | null = null;
  for (let i = 0; i < elements.length; i++) {
    const elem = elements[i];
    if (elem.uuid === uuid) {
      if (elem.type === 'group' && elem.operations?.deepResize === true) {
        if ((updateContent.w && updateContent.w > 0) || (updateContent.h && updateContent.h > 0)) {
          deepResizeGroupElement(elem as Element<'group'>, {
            w: updateContent.w,
            h: updateContent.h
          });
        }
      }

      mergeElement(elem, updateContent);
      targetElement = elem;
      break;
    } else if (elem.type === 'group') {
      targetElement = updateElementInList(uuid, updateContent, (elem as Element<'group'>)?.detail?.children || []);
    }
  }
  return targetElement;
}
