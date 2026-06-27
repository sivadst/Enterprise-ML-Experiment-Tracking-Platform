"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PlotlyChart from "@/components/charts/plotly-chart";
import { Suspense } from "react";

function CompareContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");
  const runIds = idsParam ? idsParam.split(",") : [];

  const [runsData, setRunsData] = useState<any[]>([]);
  const [metricsData, setMetricsData] = useState<any>({});
  const [paramsData, setParamsData] = useState<any>({});

  useEffect(() => {
    if (runIds.length === 0) return;

    const loadData = async () => {
      const data = [];
      const mData: any = {};
      const pData: any = {};

      for (const id of runIds) {
        // Need basic run info. We can't fetch single run easily without modifying backend
        // So we'll skip basic info and just load metrics and parameters
        
        const m = await fetcher<any[]>(`/runs/${id}/metrics`);
        const p = await fetcher<any[]>(`/runs/${id}/parameters`);
        
        data.push({ id });

        m.forEach(metric => {
          if (!mData[metric.name]) mData[metric.name] = [];
          mData[metric.name].push({ run_id: id, step: metric.step, value: metric.value });
        });

        p.forEach(param => {
          if (!pData[param.name]) pData[param.name] = {};
          pData[param.name][id] = param.value;
        });
      }

      setRunsData(data);
      setMetricsData(mData);
      setParamsData(pData);
    };

    loadData();
  }, [idsParam]);

  if (runIds.length === 0) return <div className="text-white">No runs selected.</div>;

  const metricCharts = Object.keys(metricsData).map(mName => {
    const traces = runIds.map((rId, i) => {
      const rd = metricsData[mName].filter((m: any) => m.run_id === rId).sort((a: any, b: any) => a.step - b.step);
      return {
        x: rd.map((m: any) => m.step),
        y: rd.map((m: any) => m.value),
        type: 'scatter',
        mode: 'lines+markers',
        name: `Run ${rId.substring(0, 4)}`,
      };
    });
    return { name: mName, traces };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Compare Runs</h1>
          <p className="text-slate-400">Comparing {runIds.length} runs.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {metricCharts.map((chart) => (
          <Card key={chart.name} className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">{chart.name}</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <PlotlyChart 
                data={chart.traces}
                layout={{ margin: { t: 10, r: 10, l: 40, b: 40 }, showlegend: true }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Parameters</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Parameter</TableHead>
                {runIds.map(id => (
                  <TableHead key={id} className="text-slate-400">Run {id.substring(0,4)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(paramsData).map(pName => (
                <TableRow key={pName} className="border-slate-800">
                  <TableCell className="font-medium text-slate-300">{pName}</TableCell>
                  {runIds.map(id => (
                    <TableCell key={id} className="text-white font-mono">{paramsData[pName][id] || '-'}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading comparison...</div>}>
      <CompareContent />
    </Suspense>
  );
}
