import { Heart, ShieldAlert, Clock, Target, AlertTriangle, Zap, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/DashboardContext";

interface GlobalStatusBarProps {
    deviceId?: string;
}

export function GlobalStatusBar({ deviceId }: GlobalStatusBarProps) {
    const { getDeviceIntelligence } = useDashboard();
    const intel = deviceId ? getDeviceIntelligence(deviceId) : null;
    const pred = intel?.prediction;

    // 7 real prediction-derived KPIs
    const kpis = [
        {
            label: "Health Index",
            value: pred ? `${pred.healthIndex}` : "—",
            icon: Heart,
            status: !pred ? "neutral" : pred.healthIndex >= 75 ? "success" : pred.healthIndex >= 50 ? "warning" : "critical",
            sub: pred ? "/100" : ""
        },
        {
            label: "Risk Level",
            value: pred?.riskLevel || "—",
            icon: ShieldAlert,
            status: !pred ? "neutral" : pred.riskLevel === "LOW" ? "success" : pred.riskLevel === "MEDIUM" ? "warning" : "critical",
            sub: ""
        },
        {
            label: "RUL",
            value: pred ? `${pred.rul}` : "—",
            icon: Clock,
            status: !pred ? "neutral" : pred.rul > 100 ? "success" : pred.rul > 30 ? "warning" : "critical",
            sub: pred?.rulUnit || ""
        },
        {
            label: "Confidence",
            value: pred ? `${Math.round(pred.confidence * 100)}%` : "—",
            icon: Target,
            status: !pred ? "neutral" : pred.confidence >= 0.8 ? "success" : pred.confidence >= 0.5 ? "warning" : "critical",
            sub: ""
        },
        {
            label: "Precursor Prob.",
            value: pred ? `${Math.round(pred.precursorProbability * 100)}%` : "—",
            icon: AlertTriangle,
            status: !pred ? "neutral" : pred.precursorProbability <= 0.3 ? "success" : pred.precursorProbability <= 0.6 ? "warning" : "critical",
            sub: ""
        },
        {
            label: "Short-Term Risk",
            value: pred ? `${Math.round(pred.shortTermRisk * 100)}%` : "—",
            icon: Zap,
            status: !pred ? "neutral" : pred.shortTermRisk <= 0.2 ? "success" : pred.shortTermRisk <= 0.5 ? "warning" : "critical",
            sub: "7-day"
        },
        {
            label: "Failure Mode",
            value: pred?.failureMode || "—",
            icon: Wrench,
            status: !pred ? "neutral" : "info",
            sub: "",
            isWide: true
        }
    ];

    const statusColors = {
        success: "text-emerald-500",
        warning: "text-amber-500",
        critical: "text-red-500",
        info: "text-cyan-500",
        neutral: "text-muted-foreground"
    };

    const statusBg = {
        success: "border-emerald-500/20 hover:border-emerald-500/40",
        warning: "border-amber-500/20 hover:border-amber-500/40",
        critical: "border-red-500/20 hover:border-red-500/40",
        info: "border-cyan-500/20 hover:border-cyan-500/40",
        neutral: "border-foreground/10 hover:border-foreground/20"
    };

    return (
        <div className="flex items-stretch gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {kpis.map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                    <div
                        key={idx}
                        className={cn(
                            "group flex-shrink-0 bg-foreground/5 backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 p-4 flex flex-col justify-center gap-1.5",
                            statusBg[kpi.status as keyof typeof statusBg],
                            kpi.isWide ? "min-w-[200px] max-w-[220px]" : "w-[130px]"
                        )}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Icon className={cn("w-4 h-4", statusColors[kpi.status as keyof typeof statusColors])} />
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium truncate">{kpi.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className={cn(
                                "font-bold text-foreground tracking-tight font-inter",
                                kpi.isWide ? "text-sm leading-tight" : "text-xl"
                            )}>
                                {kpi.value}
                            </span>
                            {kpi.sub && <span className="text-[10px] text-muted-foreground uppercase">{kpi.sub}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
