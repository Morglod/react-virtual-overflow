export namespace virtualOverflowUtils {
    export function findScrollContainerTop(
        el: HTMLElement,
        predicate?: (el: HTMLElement, hasXoverflow: boolean, hasYoverflow: boolean, computedStyled: CSSStyleDeclaration) => boolean
    ) {
        while (el) {
            const styles = window.getComputedStyle(el);
            const hasXoverflow = styles.overflowX === "auto" || styles.overflowX === "scroll" || styles.overflowX === "hidden";
            const hasYoverflow = styles.overflowY === "auto" || styles.overflowY === "scroll" || styles.overflowY === "hidden";
            if (hasXoverflow || hasYoverflow) {
                if (predicate) {
                    if (predicate(el, hasXoverflow, hasYoverflow, styles)) {
                        return el;
                    }
                } else {
                    return el;
                }
            }
            el = el.parentElement!;
        }
        return null;
    }

    export function findScrollContainerTopStack(
        el: HTMLElement,
        predicate?: (el: HTMLElement, hasXoverflow: boolean, hasYoverflow: boolean, computedStyled: CSSStyleDeclaration) => boolean
    ): HTMLElement[] {
        const out: HTMLElement[] = [];

        while (el) {
            const styles = window.getComputedStyle(el);
            const hasXoverflow = styles.overflowX === "auto" || styles.overflowX === "scroll" || styles.overflowX === "hidden";
            const hasYoverflow = styles.overflowY === "auto" || styles.overflowY === "scroll" || styles.overflowY === "hidden";
            if (hasXoverflow || hasYoverflow) {
                if (predicate) {
                    if (predicate(el, hasXoverflow, hasYoverflow, styles)) {
                        out.push(el);
                    }
                } else {
                    out.push(el);
                }
            }
            el = el.parentElement!;
        }

        return out;
    }

    export function calcVisibleRectWithStack(element: HTMLElement, stackContainers: HTMLElement[]) {
        const elementRect = element.getBoundingClientRect();

        const visibleRect = {
            top: elementRect.top,
            left: elementRect.left,
            bottom: elementRect.bottom,
            right: elementRect.right,
        };

        // clip to screen
        visibleRect.top = Math.max(visibleRect.top, 0);
        visibleRect.left = Math.max(visibleRect.left, 0);
        visibleRect.bottom = Math.min(visibleRect.bottom, window.innerHeight);
        visibleRect.right = Math.min(visibleRect.right, window.innerWidth);

        for (const stackEl of stackContainers) {
            const rect = stackEl.getBoundingClientRect();

            // clip to the parent's rectangle
            visibleRect.top = Math.max(visibleRect.top, rect.top);
            visibleRect.left = Math.max(visibleRect.left, rect.left);
            visibleRect.bottom = Math.min(visibleRect.bottom, rect.bottom);
            visibleRect.right = Math.min(visibleRect.right, rect.right);
        }

        const contentOffsetTop = visibleRect.top - elementRect.top;
        const contentOffsetLeft = visibleRect.left - elementRect.left;

        return {
            top: visibleRect.top,
            left: visibleRect.left,
            bottom: visibleRect.bottom,
            right: visibleRect.right,
            contentOffsetTop,
            contentOffsetLeft,
            contentVisibleHeight: visibleRect.bottom - visibleRect.top,
            contentVisibleWidth: visibleRect.right - visibleRect.left,
        };
    }

    export function calcVisibleRectOverflowed(el: HTMLElement) {
        const overflowStack = findScrollContainerTopStack(el);
        return calcVisibleRectWithStack(el, overflowStack);
    }
}
