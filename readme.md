[![NPM Version](https://badge.fury.io/js/react-virtual-overflow.svg?style=flat)](https://www.npmjs.com/package/react-virtual-overflow)
[![GitHub stars](https://img.shields.io/github/stars/Morglod/react-virtual-overflow.svg?style=social&label=Star)](https://gitHub.com/Morglod/react-virtual-overflow/)

# react-virtual-overflow

Similar to [react-virtualized](https://github.com/bvaughn/react-virtualized), but:

-   No deps
-   No fighting with containers
-   No magical divs will wrap your list with position: absolute and height: 0
-   No scroll syncing problems
-   No AutoWindow over AutoSize with VerticalSpecialList
-   Full rendering controll
-   It just works
-   ~0.5kb gzipped

Currently only fixed item sizes supported, but will dynamic sizing later.

Components & hooks in this library will automatically find all containers with overflows and render only visible items.  
So you could stack and wrap your list in anyway you want, everything will work.

You also could use some parts of this library for example to calculate only visible on screen rect of element.

![](./important.jpg)

```
npm i react-virtual-overflow
```

[demo app code](src/examples/demo.tsx)  
[working demo](https://morglod.github.io/react-virtual-overflow/)

## Simple example

```tsx
import { VirtualListY } from "react-virtual-overflow/lib/fixed-list-y";

function MyApp() {
    const items = Array.from({ length: 300 }).map((_, i) => `item ${i}`);

    const itemHeight = 40;

    const renderItem = (item) => (
        <div style={{ height: '40px' }}>{item}</div>
    );

    return (
        <div style={{ overflowY: 'scroll', height: '300px', background: 'lightgreen' }}>
            {/* !this component will not add container with overflow! */}
            {/* the only overflow here is element above */}
            <VirtualListY
                items={items}
                itemHeight={itemHeight}
                itemKey={x => x}
                renderItem={renderItem}
            />
        </div>
    );
}
```

## Advanced example

Advanced example with hook

```tsx
import { useVirtualOverflowY } from "react-virtual-overflow";

function MyApp() {
    const items = Array.from({ length: 300 }).map((_, i) => `item ${i}`);

    const containerRef = useRef<HTMLDivElement>(undefined!);

    const itemHeight = 40;

    const { renderedItems } = useVirtualOverflowY({
        containerRef,
        itemsLengthY: items.length,
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

## Available hooks & components

<details>
<summary>
<b>Vertical list component</b>
</summary>

<br>

This component is used to render vertical list

```tsx
import { VirtualListY } from "react-virtual-overflow/lib/fixed-list-y";

type VirtualListYProps<ItemT> = {
    items: ItemT[],
    itemHeight: number,
    // used to calculate react key when rendering
    itemKey: (item: ItemT, itemIndex: number) => string,
    overscanItemsCount?: number,
    renderItem: (item: ItemT, itemIndex: number, contentTopOffset: number) => React.ReactNode,
    calcVisibleRect?: VirtualOverflowCalcVisibleRectFn
};

function MyApp() {
    const items = Array.from({ length: 300 }).map((_, i) => `item ${i}`);

    const itemHeight = 40;

    const renderItem = (item) => (
        <div style={{ height: '40px' }}>{item}</div>
    );

    return (
        <div style={{ overflowY: 'scroll', height: '300px', background: 'lightgreen' }}>
            <VirtualListY
                items={items}
                itemHeight={itemHeight}
                itemKey={x => x}
                renderItem={renderItem}
            />
        </div>
    );
}
```

</details>


<details>
<summary>
<b>Horizontal list component</b>
</summary>

<br>

This component is used to render horizontal list

```tsx
import { VirtualListX } from "react-virtual-overflow/lib/fixed-list-x";

type VirtualListXProps<ItemT> = {
    items: ItemT[],
    itemWidth: number,
    itemKey: (item: ItemT, itemIndex: number) => string,
    overscanItemsCount?: number,
    renderItem: (item: ItemT, itemIndex: number, contentTopOffset: number) => React.ReactNode,
    calcVisibleRect?: VirtualOverflowCalcVisibleRectFn
};

function MyApp() {
    const items = Array.from({ length: 300 }).map((_, i) => `item ${i}`);

    const itemWidth = 40;

    const renderItem = (item) => (
        <div style={{ width: '40px' }}>{item}</div>
    );

    return (
        <div style={{ overflowX: 'scroll', height: '300px', background: 'lightgreen' }}>
            <VirtualListX
                items={items}
                itemWidth={itemWidth}
                itemKey={x => x}
                renderItem={renderItem}
            />
        </div>
    );
}
```

</details>


<details>
<summary>
<b>Grid component</b>
</summary>

<br>

This component is used to render grid

```tsx
import { VirtualGrid } from "react-virtual-overflow/lib/fixed-grid";

type VirtualGridProps<ItemT> = {
    // rows
    items: ItemT[][],
    columnsNum: number,
    itemWidth: number,
    itemHeight: number,
    itemKey: (item: ItemT, itemIndexX: number, itemIndexY: number) => string,
    overscanItemsCount?: number,
    renderItem: (item: ItemT, itemIndexX: number, leftOffsetPx: number, itemIndexY: number, topOffsetPx: number) => React.ReactNode,
    calcVisibleRect?: VirtualOverflowCalcVisibleRectFn
};

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
```

</details>


<details>
<summary>
<b>Vertical list hook</b>
</summary>

<br>

`useVirtualOverflowY` hook that computes and renders vertical list

It accepts this params:

```ts
type UseVirtualOverflowParamsY = {
    // reference to container with elements (not scroll)
    containerRef: React.MutableRefObject<HTMLElement>;

    // total num of items
    itemsLengthY: number;

    // how to render each item
    renderItem: (itemIndex: number, contentTopOffsetPx: number) => React.ReactNode;

    // height of one item in pixels
    itemHeight: number;

    // how much items should be rendered beyond visible border
    // default=3
    overscanItemsCount?: number;

    // function to calculate visible rect (check utils for other options)
    calcVisibleRect?: CalcVisibleRectFn;
};
```

And returns:

```ts
{
    renderedItems: React.Node[],

    // method that will force update calculations
    updateViewRect: () => void,
}
```

</details>


<details>
<summary>
<b>Horizontal list hook</b>
</summary>

<br>

`useVirtualOverflowX` hook that computes and renders horizontal list

It accepts this params:

```ts
type UseVirtualOverflowParamsX = {
    // reference to container with elements (not scroll)
    containerRef: React.MutableRefObject<HTMLElement>;

    // total num of items
    itemsLengthX: number;

    // how to render each item
    renderItem: (itemIndex: number, contentLeftOffsetPx: number) => React.ReactNode;

    // width of one item in pixels
    itemWidth: number;

    // how much items should be rendered beyond visible border
    // default=3
    overscanItemsCount?: number;

    // function to calculate visible rect (check utils for other options)
    calcVisibleRect?: CalcVisibleRectFn;
};
```

And returns:

```ts
{
    renderedItems: React.Node[],

    // method that will force update calculations
    updateViewRect: () => void,
}
```

</details>


<details>
<summary>
<b>Grid hook</b>
</summary>

<br>

`useVirtualOverflowGrid` hook that computes and renders grid

It accepts this params:

```ts
type UseVirtualOverflowParamsGrid = {
    // reference to container with elements (not scroll)
    containerRef: React.MutableRefObject<HTMLElement>;

    // total num of items horizontal
    itemsLengthX: number;

    // total num of items vertical
    itemsLengthY: number;

    // how to render each item
    renderItem: (itemIndexX: number, leftOffsetPx: number, itemIndexY: number, topOffsetPx: number) => React.ReactNode;

    // width of one item in pixels
    itemWidth: number;

    // height of one item in pixels
    itemHeight: number;

    // how much items should be rendered beyond visible border
    // default=3
    overscanItemsCount?: number;

    // function to calculate visible rect (check utils for other options)
    calcVisibleRect?: CalcVisibleRectFn;
};
```

And returns:

```ts
{
    renderedItems: React.Node[],

    // method that will force update calculations
    updateViewRect: () => void,
}
```

</details>


<details>
<summary>
<b>useCalcVirtualOverflow - universal hook for fixed list/grid</b>
</summary>

<br>

`useCalcVirtualOverflow` hook that computes visible rect at calculates slice of items that should be rendered

It could be used if you want to render items manually, and you need only slice calculated

It accepts this params:

```ts
type UseVirtualOverflowParams = {
    containerRef: React.MutableRefObject<HTMLElement>,
    itemsLengthX?: number,
    itemsLengthY?: number,
    /** if undefined, then horizontal calculation will be skipped */
    itemWidth?: number,
    /** if undefined, then vertical calculation will be skipped */
    itemHeight?: number,
    /** default=3 */
    overscanItemsCount?: number,
    calcVisibleRect?: VirtualOverflowCalcVisibleRectFn,
};
```

And returns:

```ts
{
    itemSlice: {
        topStartIndex: number;
        lengthY: number;
        leftStartIndex: number;
        lengthX: number;
    };
    updateViewRect: () => void;
}
```

</details>


<details>
<summary>
<b>Calculate visible on screen rect</b>
</summary>

<br>

`virtualOverflowCalcVisibleRect` method will calculate on screen visible rect of some element

It accepts this params:

```ts
function virtualOverflowCalcVisibleRect(element: HTMLElement): {
    top: number;
    left: number;
    bottom: number;
    right: number;
    contentOffsetTop: number;
    contentOffsetLeft: number;
    contentVisibleHeight: number;
    contentVisibleWidth: number;
};
```

</details>



<details>
<summary>
<b>Slice calculation from visible rect</b>
</summary>

<br>

`virtualOverflowCalcItems` method will calculate slice of items from visible rect

You can pass here horizontal and vertical values from "calcVisibleRect" method.

This method is axis-agnostic, so you just first calculate vertical data by passing vertical coords of rect, and then (if you need) horizontal.

```ts
function virtualOverflowCalcItems(
    contentOffsetStartPx: number,
    contentVisibleSizePx: number,
    itemSize: number,
    overscanItemsCount: number,
    itemsLength: number
);

// returns
{
    // index of starting item that should be rendered (including overscan)
    itemStart: number,
    // total count of items (including start & end overscan)
    itemLen: number
};

// Example for vertical slice calculation:
const visibleRect = calcVisibleRect(containerRef.current);
const verticalSlice = virtualOverflowCalcItems(
    visibleRect.contentOffsetTop,
    visibleRect.contentVisibleHeight,
    itemHeight,
    overscanItemsCount,
    itemsLengthY
);
```

</details>

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

const { renderedItems } = useVirtualOverflowY({
    containerRef,
    itemsLengthY,
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
