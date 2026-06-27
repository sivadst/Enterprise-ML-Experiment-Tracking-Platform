"use client";

import Link from "next/link";
import { LayoutDashboard, FlaskConical, PlayCircle, BarChart3, Database, HardDrive, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FlaskConical },
  { name: "Experiments", href: "/experiments", icon: PlayCircle },
  { name: "Runs", href: "/runs", icon: BarChart3 },
  { name: "Model Registry", href: "/models", icon: Database },
  { name: "Dataset Registry", href: "/datasets", icon: HardDrive },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300">
      <div className="flex items-center h-16 px-6 bg-slate-950/50">
        <FlaskConical className="w-6 h-6 text-blue-500 mr-2" />
        <span className="text-lg font-bold text-white tracking-tight">ExperimentHub</span>
      </div>
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-blue-600/10 text-blue-500"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 flex-shrink-0 h-5 w-5",
                  isActive ? "text-blue-500" : "text-slate-500 group-hover:text-slate-300"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 bg-slate-950/50 border-t border-slate-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            J
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Jules</p>
            <p className="text-xs text-slate-500">ML Engineer</p>
          </div>
          <Settings className="ml-auto w-5 h-5 text-slate-500 hover:text-slate-300 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
