[![NPM Version](https://badge.fury.io/js/react-virtual-overflow.svg?style=flat)](https://www.npmjs.com/package/react-virtual-overflow)
[![GitHub stars](https://img.shields.io/github/stars/Morglod/react-virtual-overflow.svg?style=social&label=Star)](https://gitHub.com/Morglod/react-virtual-overflow/)

# react-virtual-overflow

-   No deps
-   No fighting with containers
-   No magical divs that will wrap your list with position: absolute and height: 0
-   No scroll syncing shit
-   No AutoWindow over AutoSize with VerticalSpecialList
-   It just works
-   <1kb gzipped

Currently only vertical list supported with fixed item's height, but will add horizontal & grid soon

Components & hooks in this library will automatically find all containers with overflows and render only visible items.

So you could stack/wrap/move your list in anyway you want, everything will work.

![](./important.jpg)

```
npm i react-virtual-overflow
```

[demo app code](src/examples/demo.tsx)

## Simple

```tsx
import { SimpleVirtualListV } from "react-virtual-overflow/lib/simple";

function MyApp() {
    const items = Array.from({ length: 300 }).map((_, i) => `item ${i}`);

    const itemHeight = 40;

    const renderItem = (item) => (
        <div style={{ height: '40px' }}>{item}</div>
    );

    return (
        <div style={{ overflowY: 'scroll', height: '300px', background: 'lightgreen' }}>
            <SimpleVirtualListV
                items={items}
                itemHeight={itemHeight}
                itemKey={x => x}
                renderItem={renderItem}
            />
        </div>
    );
}
```

## Advanced

Advanced example with hook

```tsx
import { useVirtualOverflowV } from "react-virtual-overflow";

function MyApp() {
    const items = Array.from({ length: 300 }).map((_, i) => `item ${i}`);

    const containerRef = useRef<HTMLDivElement>(undefined!);

    const itemHeight = 40;

    const renderedItems = useVirtualOverflowV({
        containerRef,
        itemsLength: items.length,
        itemHeight,
        renderItem: (itemIndex, offsetTop) => {
            const item = items[itemIndex];
            
            return (
                <div style={{ position: "absolute", top: `${offsetTop}px` }} key={item}>
                    {item}
                </div>
            )
        },
    }, []);

    return (
        <div style={{ overflowY: "scroll", height: "300px" }}>
            <div ref={containerRef} style={{ height: `${itemHeight * items.length}px` }}>
                {renderedItems}
            </div>
        </div>
    );
}
```

### useVirtualOverflowV

It accepts this params:

```ts
type UseVirtualOverflowParamsV = {
    // reference to you container with elements
    containerRef: React.MutableRefObject<HTMLElement>;

    // total num of items
    itemsLength: number;

    // how to render each item
    renderItem: (indexIndex: number, contentTopOffset: number) => React.ReactNode;

    // height of one item
    itemHeight: number;

    // how much items should be rendered beyond visibleborder
    // default=3
    overscanItemsCount?: number;

    // function to calculate visible rect (check utils for other options)
    calcVisibleRect?: CalcVisibleRectFn;
};
```

### utils

All methods here are inside `virtualOverflowUtils` namespace in `react-virtual-overflow/utils`. I will not write namespace here below for readability purposes.

Usually react app is static, so you dont need to calc all parents rect (except if it has floating parents, than use default method).  
So for this case better use `calcVisibleRectOverflowed`.

This method will find only parents with overflow style set and calculate clipping only with them. It may boost performance for some cases.

Also if you know all containers with scroll (which you can find with `findScrollContainerTopStack`) you can calculate directly with `calcVisibleRectWithStack`.

```tsx
import { virtualOverflowUtils } from "react-virtual-overflow/lib/utils";

// in component
const [parentsWithOverflow, setParentsWithOverflow] = useState([] as any[]);

useLayoutEffect(() => {
    // we find all elements with overflow once
    const stack = findScrollContainerTopStack(containerRef.current);
    setParentsWithOverflow(stack);
}, []);

const rendered = useVirtualOverflowV({
    containerRef,
    itemsLength,
    itemHeight,
    calcVisibleRect: (el: HTMLElement) => {
        // calculate only by found overflows
        return virtualOverflowUtils.calcVisibleRectWithStack(el, parentsWithOverflow);
    },
    renderItem,
},
    // add overflow stack to deps
    [parentsWithOverflow]
);
```
