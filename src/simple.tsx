import { useRef } from "react";
import { VirtualOverflowCalcVisibleRectFn, useVirtualOverflowV } from ".";

export type SimpleVirtualListVProps<ItemT> = {
    items: ItemT[],
    itemHeight: number,
    itemKey: (item: ItemT, itemIndex: number) => string,
    overscanItemsCount?: number,
    renderItem: (item: ItemT, indexIndex: number, contentTopOffset: number) => React.ReactNode,
    calcVisibleRect?: VirtualOverflowCalcVisibleRectFn
};

export function SimpleVirtualListV<ItemT>(props: SimpleVirtualListVProps<ItemT>) {
    const containerRef = useRef<HTMLDivElement>(undefined!);

    const rendered = useVirtualOverflowV({
        containerRef,
        itemsLength: props.items.length,
        itemHeight: props.itemHeight,
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
            {rendered}
        </div>
    );
}