/**
 * Lazy loader for Plotly.js to prevent SSR (Server-Side Rendering) build errors.
 * Plotly.js references the global `window` and `document` objects immediately upon import,
 * which causes Next.js production builds to fail if imported statically.
 */

let cachedPlotly: any = null;

export async function loadPlotly(): Promise<any> {
  if (typeof window === "undefined") {
    return null;
  }

  if (cachedPlotly) {
    return cachedPlotly;
  }

  try {
    // Dynamically import the minified Plotly distribution
    const plotlyModule = await import("plotly.js-dist-min");
    cachedPlotly = plotlyModule.default || plotlyModule;
    return cachedPlotly;
  } catch (error) {
    console.error("Failed to load Plotly.js dynamically:", error);
    throw error;
  }
}