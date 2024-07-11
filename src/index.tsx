import { useLayoutEffect, useState } from "react";

function debounceAnimationFrame(func: (frameTime: number) => void) {
    let frameRequest = 0;

    return [
        () => {
            cancelAnimationFrame(frameRequest);
            frameRequest = requestAnimationFrame((frameTime) => func.call(undefined, frameTime));
        },
        () => cancelAnimationFrame(frameRequest)
    ] as const;
}

export type VirtualOverflowVisibleRect = {
    top: number;
    left: number;
    bottom: number;
    right: number;
    contentOffsetTop: number;
    contentOffsetLeft: number;
    contentVisibleHeight: number;
    contentVisibleWidth: number;
};

type CalcVisibleRectFn = (element: HTMLElement, frameIndex: number) => VirtualOverflowVisibleRect;

export type UseVirtualOverflowParamsV = {
    containerRef: React.MutableRefObject<HTMLElement>,
    itemsLength: number,
    itemHeight: number,
    overscanItemsCount?: number,
    renderItem: (indexIndex: number, contentTopOffset: number) => React.ReactNode,
    calcVisibleRect?: CalcVisibleRectFn
};

export function virtualOverflowCalcVisibleRect(element: HTMLElement) {
    const elementRect = element.getBoundingClientRect();

    const visibleRect = {
        top: elementRect.top,
        left: elementRect.left,
        bottom: elementRect.bottom,
        right: elementRect.right
    };

    // clip to window
    visibleRect.top = Math.max(visibleRect.top, 0);
    visibleRect.left = Math.max(visibleRect.left, 0);
    visibleRect.bottom = Math.min(visibleRect.bottom, window.innerHeight);
    visibleRect.right = Math.min(visibleRect.right, window.innerWidth);

    let currentElement: HTMLElement | null = element.parentElement;
    while (currentElement) {
        const rect = currentElement.getBoundingClientRect();

        // clip to the parent's rectangle
        visibleRect.top = Math.max(visibleRect.top, rect.top);
        visibleRect.left = Math.max(visibleRect.left, rect.left);
        visibleRect.bottom = Math.min(visibleRect.bottom, rect.bottom);
        visibleRect.right = Math.min(visibleRect.right, rect.right);

        currentElement = currentElement.parentElement;
    }

    const contentOffsetTop = visibleRect.top - elementRect.top;
    const contentOffsetLeft = visibleRect.left - elementRect.left;

    return {
        top: visibleRect.top,
        left: visibleRect.left,
        bottom: visibleRect.bottom,
        right: visibleRect.right,
        contentOffsetTop,
        contentOffsetLeft,
        contentVisibleHeight: visibleRect.bottom - visibleRect.top,
        contentVisibleWidth: visibleRect.right - visibleRect.left,
    };
}

export function virtualOverflowCalcItemsV(visibleRect: VirtualOverflowVisibleRect, itemHeight: number, overscanItemsCount: number, itemsLength: number): [number, number] {
    let itemStart = Math.floor(visibleRect.contentOffsetTop / itemHeight);
    let itemLen = Math.ceil(visibleRect.contentVisibleHeight / itemHeight);

    itemStart = Math.max(0, itemStart - overscanItemsCount);
    itemLen = Math.max(0, Math.min(itemsLength, itemLen + overscanItemsCount + overscanItemsCount));

    return [itemStart, itemLen];
}

export function useVirtualOverflowV(params: UseVirtualOverflowParamsV, deps: any[] = []) {
    const { renderItem, containerRef, itemsLength, itemHeight, overscanItemsCount = 3, calcVisibleRect = virtualOverflowCalcVisibleRect } = params;
    const [[itemStart, itemLength], setItemSlice] = useState([0, 0]);

    useLayoutEffect(() => {
        if (!containerRef.current) return () => { };
        const containerEl = containerRef.current;

        const [updateViewRect, cancelFrame] = debounceAnimationFrame((frameTime) => {
            const visibleRect = calcVisibleRect(containerEl, frameTime);
            const itemSlicePos = virtualOverflowCalcItemsV(visibleRect, itemHeight, overscanItemsCount, itemsLength);
            setItemSlice(itemSlicePos);
        });

        window.addEventListener('scroll', updateViewRect, { capture: true, passive: true });
        window.addEventListener('resize', updateViewRect, { capture: true, passive: true });
        window.addEventListener('orientationchange', updateViewRect, { capture: true, passive: true });

        updateViewRect();

        return () => {
            cancelFrame();
            window.removeEventListener('scroll', updateViewRect);
            window.removeEventListener('resize', updateViewRect);
            window.removeEventListener('orientationchange', updateViewRect);
        };
    }, [containerRef.current, itemsLength, itemHeight, ...deps]);

    const outLength = itemStart + itemLength;

    const renderedItems: React.ReactNode[] = Array.from({ length: outLength });

    for (let i = itemStart; i < outLength; ++i) {
        renderedItems[i - itemStart] = renderItem(i, i * itemHeight);
    }

    return renderedItems;
}