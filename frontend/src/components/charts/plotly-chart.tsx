"use client";

import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, loading: () => <div className="h-[400px] w-full animate-pulse bg-slate-800 rounded-lg"></div> });

export default function PlotlyChart({ data, layout }: { data: any[], layout: any }) {
  return (
    <Plot
      data={data}
      layout={{
        ...layout,
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: '#94a3b8' },
        xaxis: { gridcolor: '#1e293b', ...layout.xaxis },
        yaxis: { gridcolor: '#1e293b', ...layout.yaxis },
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
