import { useRef } from "react";
import { VirtualOverflowCalcVisibleRectFn, useVirtualOverflowY } from ".";

export type VirtualListYProps<ItemT> = {
    items: ItemT[],
    itemHeight: number,
    itemKey: (item: ItemT, itemIndex: number) => string,
    overscanItemsCount?: number,
    renderItem: (item: ItemT, itemIndex: number, contentTopOffset: number) => React.ReactNode,
    calcVisibleRect?: VirtualOverflowCalcVisibleRectFn
};

export function VirtualListY<ItemT>(props: VirtualListYProps<ItemT>) {
    const containerRef = useRef<HTMLDivElement>(undefined!);

    const { renderedItems } = useVirtualOverflowY({
        containerRef,
        itemsLengthY: props.items.length,
        itemHeight: props.itemHeight,
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
    }, [props.items, props.itemHeight]);

    return (
        <div ref={containerRef} style={{ height: `${props.items.length * props.itemHeight}px`, position: 'relative' }}>
            {renderedItems}
        </div>
    );
}