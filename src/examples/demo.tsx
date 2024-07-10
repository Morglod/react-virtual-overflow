import React, { useRef } from "react";
import ReactDOM from "react-dom/client";
import { UseVirtualOverflowItem, useVirtualOverflow } from "..";

const Item: UseVirtualOverflowItem<any> = ({ item, index }) => {
    return <div style={{ height: '40px' }}>{item}</div>;
};

function List({ items }: any) {
    const containerRef = useRef<HTMLDivElement>(undefined!);

    const rendered = useVirtualOverflow({
        containerRef,
        itemHeight: 40,
        itemKey: (_, ind) => `${ind}`,
        items,
        ItemComponent: Item,
    });

    return <div ref={containerRef} style={{ overflowY: 'scroll', height: '300px', background: 'lightgreen' }}>
        {rendered}
    </div>
}

const items = Array.from({ length: 300 }).map((_, i) => `item ${i}`);

function App() {
    const [, forceUpd] = React.useState(0);

    const r = useRef(undefined!);

    return (
        <div ref={r}>
            <div style={{ height: '700px' }}></div>
            <div style={{ overflowY: 'scroll', height: '600px', background: 'lightblue' }}>
                <div style={{ height: '700px' }}></div>
                <List items={items} />
            </div>
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
