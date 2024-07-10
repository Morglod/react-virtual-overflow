import { FC, useLayoutEffect, useState } from "react";

function debounceAnimationFrame<F extends (...args: any) => any>(func: F) {
    let frame = 0;

    return [
        (...args: Parameters<F>) => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => func.apply(undefined, args));
        },
        () => cancelAnimationFrame(frame)
    ] as const;
}

export type UseVirtualOverflowItem<ItemT> = FC<{
    item: ItemT,
    index: number,
}>;

export type UseVirtualOverflowParams<ItemT> = {
    containerRef: React.MutableRefObject<HTMLElement>,
    items: ItemT[],
    itemHeight: number,
    overscanItemsCount?: number,
    ItemComponent: UseVirtualOverflowItem<ItemT>,
    itemKey: (item: ItemT, index: number) => string,
    customPosition?: boolean,
};

export function virtualOverflowCalcItems(containerEl: HTMLElement, itemHeight: number, overscanItemsCount: number, itemsLength: number): [number, number] {
    const containerRect = containerEl.getBoundingClientRect();

    const elementViewWidth = Math.min(window.innerWidth - containerRect.left, containerRect.width);
    const elementViewHeight = Math.min(window.innerHeight - containerRect.top, containerRect.height);

    const viewX = containerEl.scrollLeft;
    const viewY = containerEl.scrollTop;

    let itemStart = Math.floor(viewY / itemHeight);
    let itemLen = Math.ceil(elementViewHeight / itemHeight);

    itemStart = Math.max(0, itemStart - overscanItemsCount);
    itemLen = Math.min(itemsLength, itemLen + overscanItemsCount + overscanItemsCount);

    return [itemStart, itemLen];
}

export function useVirtualOverflow<ItemT>(params: UseVirtualOverflowParams<ItemT>) {
    const { ItemComponent, containerRef, items, itemHeight, itemKey, overscanItemsCount = 4, customPosition } = params;
    const [[itemStart, itemLength], setItemSlice] = useState([0, 0]);

    useLayoutEffect(() => {
        if (!containerRef.current) return () => { };
        const containerEl = containerRef.current;

        const [updateViewRect, cancelFrame] = debounceAnimationFrame(() => {
            const itemSlicePos = virtualOverflowCalcItems(containerEl, itemHeight, overscanItemsCount, items.length);
            setItemSlice(itemSlicePos);
        });

        document.body.addEventListener('scroll', updateViewRect, { capture: true, passive: true });
        document.body.addEventListener('resize', updateViewRect, { capture: true, passive: true });
        document.body.addEventListener('orientationchange', updateViewRect, { capture: true, passive: true });

        updateViewRect();

        return () => {
            cancelFrame();
            document.body.removeEventListener('scroll', updateViewRect);
            document.body.removeEventListener('resize', updateViewRect);
            document.body.removeEventListener('orientationchange', updateViewRect);
        };
    }, [containerRef.current, items.length, itemHeight]);

    const renderedItems: any[] = items.slice(itemStart, itemStart + itemLength);

    for (let i = itemStart, len = itemStart + itemLength; i < len; ++i) {
        const item = items[i]!;
        if (customPosition) {
            renderedItems[i - itemStart] = (
                <ItemComponent item={item} index={i} />
            );
        } else {
            renderedItems[i - itemStart] = (
                <div key={i} style={{ position: 'absolute', top: `${i * itemHeight}px`, willChange: 'top' }}>
                    <ItemComponent item={item} index={i} />
                </div>
            );
        }
    }

    return (
        <div style={{ position: 'relative', height: `${items.length * itemHeight}px` }}>
            {renderedItems}
        </div>
    );
}