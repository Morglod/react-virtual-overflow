export function rvoDebounceAnimationFrame(func: (frameTime: number) => void) {
    let frameRequest = 0;

    return {
        requestFrame: () => {
            cancelAnimationFrame(frameRequest);
            frameRequest = requestAnimationFrame((frameTime) => func.call(undefined, frameTime));
        },
        cancelFrame: () => cancelAnimationFrame(frameRequest),
    };
}
