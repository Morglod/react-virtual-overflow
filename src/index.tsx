import { useLayoutEffect, useMemo, useState } from "react";

function debounceAnimationFrame(func: (frameTime: number) => void) {
    let frameRequest = 0;

    return {
        requestFrame: () => {
            cancelAnimationFrame(frameRequest);
            frameRequest = requestAnimationFrame((frameTime) => func.call(undefined, frameTime));
        },
        cancelFrame: () => cancelAnimationFrame(frameRequest)
    };
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

export type VirtualOverflowCalcVisibleRectFn = (element: HTMLElement, frameTime: number) => VirtualOverflowVisibleRect;
export type VirtualOverflowRenderItem1DFn = (itemIndex: number, offsetPx: number) => React.ReactNode;
export type VirtualOverflowRenderItem2DFn = (itemIndexX: number, leftOffsetPx: number, itemIndexY: number, topOffsetPx: number) => React.ReactNode;

export type UseCalcVirtualOverflowParams = {
    containerRef: React.MutableRefObject<HTMLElement>,
    itemsLengthX?: number,
    itemsLengthY?: number,
    /** if undefined, then horizontal calculation will be skipped */
    itemWidth?: number,
    /** if undefined, then vertical calculation will be skipped */
    itemHeight?: number,
    /** default=3 */
    overscanItemsCount?: number,
    calcVisibleRect?: VirtualOverflowCalcVisibleRectFn,
};

export type UseVirtualOverflowParamsGrid = {
    containerRef: React.MutableRefObject<HTMLElement>,
    itemsLengthX: number,
    itemsLengthY: number,
    itemWidth: number,
    itemHeight: number,
    overscanItemsCount?: number,
    renderItem: VirtualOverflowRenderItem2DFn,
    calcVisibleRect?: VirtualOverflowCalcVisibleRectFn
};

export type UseVirtualOverflowParamsY = {
    containerRef: React.MutableRefObject<HTMLElement>,
    itemsLengthY: number,
    itemHeight: number,
    overscanItemsCount?: number,
    renderItem: VirtualOverflowRenderItem1DFn,
    calcVisibleRect?: VirtualOverflowCalcVisibleRectFn
};

export type UseVirtualOverflowParamsX = {
    containerRef: React.MutableRefObject<HTMLElement>,
    itemsLengthX: number,
    itemWidth: number,
    overscanItemsCount?: number,
    renderItem: VirtualOverflowRenderItem1DFn,
    calcVisibleRect?: VirtualOverflowCalcVisibleRectFn
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

// contentOffsetStart = visibleRect.contentOffsetTop
// contentVisibleSize = visibleRect.contentVisibleHeight
export function virtualOverflowCalcItems(contentOffsetStart: number, contentVisibleSize: number, itemSize: number, overscanItemsCount: number, itemsLength: number) {
    let itemStart = Math.floor(contentOffsetStart / itemSize);
    let itemLen = Math.ceil(contentVisibleSize / itemSize);

    itemStart = Math.max(0, itemStart - overscanItemsCount);
    itemLen = Math.max(0, Math.min(itemsLength - itemStart, itemLen + overscanItemsCount + overscanItemsCount));

    return { itemStart, itemLen };
}

export function useCalcVirtualOverflow(params: UseCalcVirtualOverflowParams, deps: any[]) {
    const { containerRef, itemsLengthX, itemsLengthY, itemWidth, itemHeight, overscanItemsCount = 3, calcVisibleRect = virtualOverflowCalcVisibleRect } = params;
    const [itemSlice, setItemSlice] = useState({
        topStartIndex: 0,
        lengthY: 0,
        leftStartIndex: 0,
        lengthX: 0,
    });

    const { requestFrame: updateViewRect, cancelFrame } = useMemo(() => debounceAnimationFrame((frameTime) => {
        if (!containerRef.current) return;
        const visibleRect = calcVisibleRect(containerRef.current, frameTime);
        const newItemSlice = {
            topStartIndex: 0,
            lengthY: 1,
            leftStartIndex: 0,
            lengthX: 1,
        };
        if (itemHeight !== undefined && itemsLengthY !== undefined) {
            const verticalSlice = virtualOverflowCalcItems(visibleRect.contentOffsetTop, visibleRect.contentVisibleHeight, itemHeight, overscanItemsCount, itemsLengthY);
            newItemSlice.topStartIndex = verticalSlice.itemStart;
            newItemSlice.lengthY = verticalSlice.itemLen;
        }
        if (itemWidth !== undefined && itemsLengthX !== undefined) {
            const horizontalSlice = virtualOverflowCalcItems(visibleRect.contentOffsetLeft, visibleRect.contentVisibleWidth, itemWidth, overscanItemsCount, itemsLengthX);
            newItemSlice.leftStartIndex = horizontalSlice.itemStart;
            newItemSlice.lengthX = horizontalSlice.itemLen;
        }
        setItemSlice(newItemSlice);
    }), [containerRef.current, itemsLengthX, itemsLengthY, itemWidth, itemHeight, ...deps]);

    useLayoutEffect(() => {
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
    }, [containerRef.current, itemsLengthX, itemsLengthY, itemWidth, itemHeight, ...deps]);

    return { itemSlice, updateViewRect };
}

function utilRenderItems1D(itemStart: number, itemsLength: number, itemSize: number, renderItem: VirtualOverflowRenderItem1DFn) {
    const itemEnd = itemStart + itemsLength;

    const renderedItems: React.ReactNode[] = Array.from({ length: itemsLength });

    for (let i = itemStart; i < itemEnd; ++i) {
        renderedItems[i - itemStart] = renderItem(i, i * itemSize);
    }

    return renderedItems;
}

export function useVirtualOverflowY(params: UseVirtualOverflowParamsY, deps: any[] = []) {
    const { itemSlice, updateViewRect } = useCalcVirtualOverflow(params, deps);
    return {
        renderedItems: utilRenderItems1D(itemSlice.topStartIndex, itemSlice.lengthY, params.itemHeight, params.renderItem),
        updateViewRect,
    };
}

export function useVirtualOverflowX(params: UseVirtualOverflowParamsX, deps: any[] = []) {
    const { itemSlice, updateViewRect } = useCalcVirtualOverflow(params, deps);
    return {
        renderedItems: utilRenderItems1D(itemSlice.leftStartIndex, itemSlice.lengthX, params.itemWidth, params.renderItem),
        updateViewRect,
    };
}

export function useVirtualOverflowGrid(params: UseVirtualOverflowParamsGrid, deps: any[] = []) {
    const { itemSlice, updateViewRect } = useCalcVirtualOverflow(params, deps);

    const renderedItems: React.ReactNode[] = Array.from({ length: itemSlice.lengthX * itemSlice.lengthY });

    for (let iy = 0; iy < itemSlice.lengthY; ++iy) {
        for (let ix = 0; ix < itemSlice.lengthX; ++ix) {
            const realXindex = itemSlice.leftStartIndex + ix;
            const realYindex = itemSlice.topStartIndex + iy;
            renderedItems[ix + iy * itemSlice.lengthX] = params.renderItem(realXindex, realXindex * params.itemWidth, realYindex, realYindex * params.itemHeight);
        }
    }

    return {
        renderedItems,
        updateViewRect
    };
}
