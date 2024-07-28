import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { useVirtualOverflowY, virtualOverflowCalcVisibleRect } from "..";
import { virtualOverflowUtils } from "../utils";
import { VirtualListY } from "../fixed-list-y";
import { VirtualGrid } from "../fixed-grid";

const itemsLine = Array.from({ length: 300 }).map((_, i) => `item ${i}`);
const itemsGrid = Array.from({ length: 300 }).map((_, iy) => Array.from({ length: 300 }).map((_, ix) => `item ${ix} ${iy}`));

function ListWithHookExample() {
    const [items, setItems] = useState([] as string[]);
    const containerRef = useRef<HTMLDivElement>(undefined!);
    const infoRef = useRef<HTMLDivElement>(undefined!);

    const itemHeight = 40;

    const { renderedItems, updateViewRect, itemSlice } = useVirtualOverflowY({
        containerRef,
        itemHeight,
        itemsLengthY: items.length,
        overscanItemsCount: 3,
        calcVisibleRect: virtualOverflowUtils.calcVisibleRectOverflowed,
        renderItem: (itemIndex, offsetTop, item = items[itemIndex]) => (
            <div style={{ position: 'absolute', top: `${offsetTop}px` }} key={item}>
                <div style={{ height: '40px' }}>{item}</div>
            </div>
        ),
    });

    useEffect(() => {
        // in case of animated containers
        // setInterval(() => updateViewRect(), 8);

        setInterval(() => {
            const visibleRect = virtualOverflowCalcVisibleRect(containerRef.current);
            infoRef.current.innerText = `Visible rect of content:\n\n${JSON.stringify(visibleRect, null, 2)}`;
        }, 24);
    }, []);

    useEffect(() => {
        if (itemSlice.topStartIndex + itemSlice.lengthY >= items.length - 4) {
            // load more
            setItems(prev => [...prev, ...itemsLine]);
        }
    }, [itemSlice.topStartIndex, itemSlice.lengthY]);

    return (
        <>
            <div ref={infoRef} style={{ position: 'fixed', top: 0, right: 0, paddingRight: '40px', width: '200px' }}></div>
            <div style={{ overflowY: 'scroll', height: '300px', background: 'lightgreen' }}>
                <div ref={containerRef} style={{ position: 'relative', height: `${itemHeight * items.length}px` }}>
                    {renderedItems}
                </div>
            </div>
        </>
    );
}

function VerticalListExample() {
    const items = itemsLine;

    return (
        <div style={{ overflowY: 'scroll', height: '300px', background: 'lightgreen' }}>
            <VirtualListY
                items={items}
                itemHeight={40}
                itemKey={x => x}
                renderItem={item => <div style={{ height: '40px' }}>{item}</div>}
            />
        </div>
    );
}

function GridExample() {
    const items = itemsGrid;

    return (
        <div style={{ overflowY: 'scroll', height: '300px', background: 'lightgreen' }}>
            <VirtualGrid
                items={items}
                columnsNum={300}
                itemWidth={40}
                itemHeight={80}
                itemKey={x => x}
                overscanItemsCount={3}
                renderItem={item => <div style={{ width: '40px', height: '80px' }}>{item}</div>}
            />
        </div>
    );
}

function App() {
    return (
        <div>
            <div style={{
                height: '700px', fontSize: '60px',
                color: 'black'
            }}>Scroll me down</div>
            <div style={{ overflowY: 'scroll', height: '600px', background: 'blue' }}>
                <div style={{
                    height: '700px', fontSize: '60px',
                    color: 'white'
                }}>
                    Scroll me down
                </div>
                <ListWithHookExample />
            </div>
            <div style={{ height: '700px' }}></div>
        </div>
    );
}

const rootElement = document.getElementById("demo")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
