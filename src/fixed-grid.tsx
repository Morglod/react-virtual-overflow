import { useRef } from "react";
import { VirtualOverflowCalcVisibleRectFn, useVirtualOverflowGrid } from ".";

export type VirtualGridProps<ItemT> = {
    items: ItemT[][],
    columnsNum: number,
    itemWidth: number,
    itemHeight: number,
    itemKey: (item: ItemT, itemIndexX: number, itemIndexY: number) => string,
    overscanItemsCount?: number,
    renderItem: (item: ItemT, itemIndexX: number, leftOffsetPx: number, itemIndexY: number, topOffsetPx: number) => React.ReactNode,
    calcVisibleRect?: VirtualOverflowCalcVisibleRectFn
};

export function VirtualGrid<ItemT>(props: VirtualGridProps<ItemT>) {
    const containerRef = useRef<HTMLDivElement>(undefined!);

    const { renderedItems } = useVirtualOverflowGrid({
        containerRef,
        itemsLengthY: props.items.length,
        itemsLengthX: props.columnsNum,
        itemWidth: props.itemWidth,
        itemHeight: props.itemHeight,
        overscanItemsCount: props.overscanItemsCount,
        calcVisibleRect: props.calcVisibleRect,
        renderItem: (itemIndexX: number, leftOffsetPx: number, itemIndexY: number, topOffsetPx: number) => {
            const item = props.items[itemIndexY][itemIndexX];
            if (!item) return null;
            return (
                <div style={{ position: 'absolute', top: `${topOffsetPx}px`, left: `${leftOffsetPx}px` }} key={props.itemKey(item, itemIndexX, itemIndexY)}>
                    {props.renderItem(item, itemIndexX, leftOffsetPx, itemIndexY, topOffsetPx)}
                </div>
            );
        }
    }, [props.items, props.itemHeight]);

    return (
        <div ref={containerRef} style={{ width: `${props.columnsNum * props.itemWidth}px`, height: `${props.items.length * props.itemHeight}px`, position: 'relative' }}>
            {renderedItems}
        </div>
    );
}