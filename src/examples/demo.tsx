import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { useVirtualOverflowY } from "..";
import { virtualOverflowUtils } from "../utils";
import { VirtualListY } from "../fixed-list-y";
import { VirtualGrid } from "../fixed-grid";

const itemsLine = Array.from({ length: 300 }).map((_, i) => `item ${i}`);
const itemsGrid = Array.from({ length: 300 }).map((_, iy) => Array.from({ length: 300 }).map((_, ix) => `item ${ix} ${iy}`));

function ListWithHookExample() {
    const items = itemsLine;
    const containerRef = useRef<HTMLDivElement>(undefined!);

    const itemHeight = 40;

    const { renderedItems, updateViewRect } = useVirtualOverflowY({
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
        setInterval(() => updateViewRect(), 8);
    }, []);

    return (
        <div style={{ overflowY: 'scroll', height: '300px', background: 'lightgreen' }}>
            <div ref={containerRef} style={{ position: 'relative', height: `${itemHeight * items.length}px` }}>
                {renderedItems}
            </div>
        </div>
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
                <VerticalListExample />
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
