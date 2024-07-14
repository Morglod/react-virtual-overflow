import { useRef } from "react";
import { VirtualOverflowCalcVisibleRectFn, useVirtualOverflowX } from ".";

export type VirtualListXProps<ItemT> = {
    items: ItemT[],
    itemWidth: number,
    itemKey: (item: ItemT, itemIndex: number) => string,
    overscanItemsCount?: number,
    renderItem: (item: ItemT, itemIndex: number, contentTopOffset: number) => React.ReactNode,
    calcVisibleRect?: VirtualOverflowCalcVisibleRectFn
};

export function VirtualListX<ItemT>(props: VirtualListXProps<ItemT>) {
    const containerRef = useRef<HTMLDivElement>(undefined!);

    const { renderedItems } = useVirtualOverflowX({
        containerRef,
        itemsLengthX: props.items.length,
        itemWidth: props.itemWidth,
        overscanItemsCount: props.overscanItemsCount,
        calcVisibleRect: props.calcVisibleRect,
        renderItem: (itemIndex: number, topOffset: number) => {
            const item = props.items[itemIndex];
            if (!item) return null;
            return (
                <div style={{ position: 'absolute', top: `${topOffset}px` }} key={props.itemKey(item, itemIndex)}>
                    {props.renderItem(item, itemIndex, topOffset)}
                </div>
            );
        }
    }, [props.items, props.itemWidth]);

    return (
        <div ref={containerRef} style={{ width: `${props.items.length * props.itemWidth}px`, position: 'relative' }}>
            {renderedItems}
        </div>
    );
}