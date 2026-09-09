/** The prototype's easing curves, shared by every animated component. */
export const easeSoft: [number, number, number, number] = [0.2, 0.8, 0.3, 1];
export const easeWord: [number, number, number, number] = [0.2, 0.85, 0.3, 1];
export const easeCurtain: [number, number, number, number] = [0.76, 0, 0.24, 1];

/** IntersectionObserver settings the prototype used for `.rise` reveals. */
export const revealViewport = { once: true, amount: 0.12, margin: "0px 0px -8% 0px" } as const;

/** When the loader hands over to the page: bar done at 1.6s plus a short hold. */
export const LOADER_MS = 1750;
export const SLIDE_MS = 6500;
