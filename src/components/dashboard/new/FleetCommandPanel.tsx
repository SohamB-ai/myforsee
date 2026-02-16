import { BarChart3, ArrowRightLeft, Radio, TrendingDown, TrendingUp, DollarSign, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useDashboard } from "@/context/DashboardContext";

interface FleetCommandPanelProps {
    deviceId?: string;
}

export function FleetCommandPanel({ deviceId = "dev-01" }: FleetCommandPanelProps) {
    const { getDeviceIntelligence } = useDashboard();
    const intelligence = getDeviceIntelligence(deviceId);
    const pred = intelligence?.prediction;

    // === Section 1: Sensor Impact (from prediction.topSensors) ===
    const sensorData = useMemo(() => {
        if (pred?.topSensors?.length) {
            return pred.topSensors.map((s: any) => ({
                name: s.name,
                impact: Math.round((s.impact || 0) * 100),
                direction: s.direction || "up"
            }));
        }
        return [
            { name: "No data", impact: 0, direction: "up" }
        ];
    }, [pred]);

    // === Section 2: What-If Simulation (from prediction.simulation) ===
    const simulation = useMemo(() => {
        if (pred?.simulation) return pred.simulation;
        return null;
    }, [pred]);

    // === Section 3: Data Drift (from prediction.dataDrift) ===
    const drift = useMemo(() => {
        if (pred?.dataDrift) return pred.dataDrift;
        return null;
    }, [pred]);

    const hasPredData = !!pred;

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Sensor Impact Chart */}
            <div className="bg-foreground/5 backdrop-blur-md rounded-2xl border border-foreground/10 p-5">
                <h3 className="text-foreground/90 font-semibold mb-4 flex items-center gap-2 text-sm font-inter">
                    <BarChart3 className="w-4 h-4 text-cyan-500" /> Sensor Impact Analysis
                </h3>
                {hasPredData ? (
                    <div className="space-y-4">
                        {sensorData.map((sensor: any, i: number) => (
                            <div key={i}>
                                <div className="flex justify-between items-center text-xs mb-1.5">
                                    <span className="text-muted-foreground font-inter flex items-center gap-1.5">
                                        {sensor.direction === "up" ? (
                                            <TrendingUp className="w-3 h-3 text-red-400" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 text-emerald-400" />
                                        )}
                                        {sensor.name}
                                    </span>
                                    <span className="text-foreground font-mono font-bold">{sensor.impact}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-700",
                                            sensor.impact > 40 ? "bg-red-500" : sensor.impact > 20 ? "bg-amber-500" : "bg-emerald-500"
                                        )}
                                        style={{ width: `${Math.min(sensor.impact, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Run a prediction to see sensor impact data.</p>
                )}
            </div>

            {/* What-If Simulation */}
            <div className="bg-foreground/5 backdrop-blur-md rounded-2xl border border-foreground/10 p-5 flex-1">
                <h3 className="text-foreground/90 font-semibold mb-4 flex items-center gap-2 text-sm font-inter">
                    <ArrowRightLeft className="w-4 h-4 text-purple-500" /> What-If Simulation
                </h3>
                {simulation ? (
                    <div className="space-y-4">
                        {/* Maintain Now */}
                        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Maintain Now</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-lg font-black text-foreground">{simulation.maintenanceNow.riskReduction}%</div>
                                    <div className="text-[9px] text-muted-foreground uppercase">Risk ↓</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-foreground">+{simulation.maintenanceNow.healthImprovement}</div>
                                    <div className="text-[9px] text-muted-foreground uppercase">Health ↑</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-emerald-500 flex items-center justify-center gap-0.5">
                                        <DollarSign className="w-3 h-3" />{simulation.maintenanceNow.cost.toLocaleString()}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground uppercase">Cost</div>
                                </div>
                            </div>
                        </div>

                        {/* Maintain Later */}
                        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Defer Maintenance</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <div className="text-lg font-black text-foreground">{simulation.maintenanceLater.riskReduction}%</div>
                                    <div className="text-[9px] text-muted-foreground uppercase">Risk ↓</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-foreground">+{simulation.maintenanceLater.healthImprovement}</div>
                                    <div className="text-[9px] text-muted-foreground uppercase">Health ↑</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-red-500 flex items-center justify-center gap-0.5">
                                        <DollarSign className="w-3 h-3" />{simulation.maintenanceLater.cost.toLocaleString()}
                                    </div>
                                    <div className="text-[9px] text-muted-foreground uppercase">Cost</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Run a prediction to see maintenance simulation.</p>
                )}
            </div>

            {/* Data Drift Indicator */}
            <div className="bg-foreground/5 backdrop-blur-md rounded-2xl border border-foreground/10 p-5">
                <h3 className="text-foreground/90 font-semibold mb-3 flex items-center gap-2 text-sm font-inter">
                    <Radio className="w-4 h-4 text-amber-500" /> Data Drift
                </h3>
                {drift ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-3 h-3 rounded-full animate-pulse",
                                drift.detected ? "bg-red-500" : "bg-emerald-500"
                            )} />
                            <span className={cn(
                                "text-sm font-bold uppercase tracking-wider",
                                drift.detected ? "text-red-500" : "text-emerald-500"
                            )}>
                                {drift.detected ? "DRIFT DETECTED" : "NO DRIFT"}
                            </span>
                        </div>
                        {drift.detected && drift.severity && (
                            <div className="text-xs text-muted-foreground">
                                <span className="font-mono text-amber-500">Severity: {drift.severity}</span>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {drift.explanation || "Input data distribution is within expected parameters."}
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Run a prediction to see drift analysis.</p>
                )}
            </div>
        </div>
    );
}
