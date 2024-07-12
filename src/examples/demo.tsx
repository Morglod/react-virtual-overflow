import React, { useRef } from "react";
import ReactDOM from "react-dom/client";
import { useVirtualOverflowV } from "..";
import { virtualOverflowUtils } from "../utils";
import { SimpleVirtualListV } from "../simple";

const Item = ({ item }: any) => {
    return <div style={{ height: '40px' }}>{item}</div>;
};

function ListWithHook({ items }: any) {
    const containerRef = useRef<HTMLDivElement>(undefined!);

    const itemHeight = 40;

    const rendered = useVirtualOverflowV({
        containerRef,
        itemHeight,
        itemsLength: items.length,
        overscanItemsCount: 3,
        calcVisibleRect: virtualOverflowUtils.calcVisibleRectOverflowed,
        renderItem: (itemIndex, offsetTop, item = items[itemIndex]) => (
            <div style={{ position: 'absolute', top: `${offsetTop}px` }} key={item}>
                <Item item={item} />
            </div>
        ),
    });

    return (
        <div style={{ overflowY: 'scroll', height: '300px', background: 'lightgreen' }}>
            <div ref={containerRef} style={{ position: 'relative', height: `${itemHeight * items.length}px` }}>
                {rendered}
            </div>
        </div>
    );
}

function ListSimple(props: any) {
    const items = props.items as string[];

    return (
        <div style={{ overflowY: 'scroll', height: '300px', background: 'lightgreen' }}>
            <SimpleVirtualListV
                items={items}
                itemHeight={40}
                itemKey={x => x}
                renderItem={item => <div style={{ height: '40px' }}>{item}</div>}
            />
        </div>
    );
}

const items = Array.from({ length: 300 }).map((_, i) => `item ${i}`);

function App() {
    const [, forceUpd] = React.useState(0);

    const r = useRef(undefined!);

    return (
        <div ref={r}>
            <div style={{ height: '700px' }}></div>
            <div style={{ overflowY: 'scroll', height: '600px', background: 'blue' }}>
                <div style={{ height: '700px' }}></div>
                <ListSimple items={items} />
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
