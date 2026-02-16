import { BarChart3, BrainCircuit, CheckCircle2, ChevronRight, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";

interface InsightsPanelProps {
    deviceId?: string;
}

export function InsightsPanel({ deviceId = "dev-01" }: InsightsPanelProps) {
    const { user } = useAuth();
    const { getDeviceIntelligence } = useDashboard();
    const intelligence = getDeviceIntelligence(deviceId);

    const { contributors, aiDiagnostic, recommendation, cost, estimatedDowntime } = useMemo(() => {
        if (intelligence?.insights) {
            const ins = intelligence.insights;
            return {
                contributors: ins.topSensors?.length ? ins.topSensors : [
                    { name: "Sensor-1", val: 35, fill: "#FF5C5C" },
                    { name: "Sensor-2", val: 25, fill: "#FFB020" },
                    { name: "Sensor-3", val: 15, fill: "#00E0C6" },
                ],
                aiDiagnostic: ins.aiDiagnostic || "AI analysis based on current sensor data.",
                recommendation: ins.recommendation || "Schedule inspection.",
                cost: ins.costImpact || 4500,
                estimatedDowntime: ins.estimatedDowntime || "4h"
            };
        }

        // Fallback: deterministic generation
        const seed = deviceId.charCodeAt(deviceId.length - 1);
        const c1 = 20 + (seed % 30);
        const c2 = 15 + (seed % 20);

        return {
            contributors: [
                { name: "Vib-X Axis", val: c1, fill: "#FF5C5C" },
                { name: "Motor Temp", val: c2, fill: "#FFB020" },
                { name: "Oil Press", val: 10 + (seed % 15), fill: "#00E0C6" },
            ],
            aiDiagnostic: "Rising vibration trend in the X-axis combined with stable motor temperature suggests early-stage bearing inner race wear rather than lubrication failure.",
            recommendation: seed % 2 === 0 ? "Replace DE bearing within 3 days." : "Inspect oil pump filter immediately.",
            cost: 2000 + (seed * 100),
            estimatedDowntime: "4h"
        };
    }, [deviceId, intelligence]);

    const handleScheduleMaintenance = () => {
        const assetName = intelligence?.assetIntelligence?.assetName || "Industrial Asset";
        const rulValue = intelligence?.prediction?.rul || 0;
        const rulUnit = (intelligence?.prediction?.rulUnit || "Days").toLowerCase();

        // Calculate maintenance date
        const scheduledDate = new Date();
        if (rulUnit.includes("day")) {
            scheduledDate.setDate(scheduledDate.getDate() + rulValue);
        } else if (rulUnit.includes("hour")) {
            scheduledDate.setHours(scheduledDate.getHours() + rulValue);
        } else {
            // Default to days if unknown
            scheduledDate.setDate(scheduledDate.getDate() + (rulValue || 7));
        }

        // Format for Google Calendar (YYYYMMDDTHHmmSSZ)
        const formatGCalDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "");
        const startDate = formatGCalDate(scheduledDate);

        // End date (+1 hour)
        const endDateObj = new Date(scheduledDate.getTime() + 60 * 60 * 1000);
        const endDate = formatGCalDate(endDateObj);

        const eventTitle = encodeURIComponent(`Maintenance: ${assetName}`);
        const details = encodeURIComponent(
            `Planned maintenance for ${assetName} based on predictive analysis.\n\n` +
            `Recommendation: ${recommendation}\n` +
            `AI Confidence: ${Math.round((intelligence?.prediction?.confidence || 0.9) * 100)}%\n` +
            `Estimated Downtime: ${estimatedDowntime}`
        );

        const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startDate}/${endDate}&details=${details}`;
        window.open(gCalUrl, "_blank");
    };

    return (
        <div className="h-full flex flex-col gap-6 font-tinos">
            {/* Top Sensors */}
            <div className="bg-foreground/5 backdrop-blur-md rounded-2xl border border-foreground/10 p-5 font-serif font-tinos">
                <h3 className="text-foreground/90 font-semibold mb-4 flex items-center gap-2 font-inter">
                    <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Key Drivers
                </h3>
                <div className="space-y-4">
                    {contributors.map((c, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-xs mb-1 font-inter">
                                <span className="text-muted-foreground">{c.name}</span>
                                <span className="text-foreground font-mono">{c.val}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${c.val}%`, backgroundColor: c.fill }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Explainability */}
            <div className="bg-foreground/5 backdrop-blur-md rounded-2xl border border-foreground/10 p-5 font-serif font-tinos">
                <h3 className="text-foreground/90 font-semibold mb-3 flex items-center gap-2 font-inter">
                    <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" /> AI Diagnostic
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-inter">
                    {aiDiagnostic}
                </p>
                <button className="text-xs text-purple-600 dark:text-purple-400 mt-3 font-medium hover:text-purple-500 flex items-center font-inter">
                    View Model Logic <ChevronRight className="w-3 h-3 ml-1" />
                </button>
            </div>

            {/* Recommended Action */}
            <div className="bg-gradient-to-b from-foreground/10 to-foreground/5 backdrop-blur-md rounded-2xl border border-foreground/10 p-6 flex-1 flex flex-col justify-between font-serif font-tinos">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-[#00E0C6]" />
                        <h3 className="text-foreground font-bold font-inter">Next Action</h3>
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2 leading-tight font-tinos">{recommendation}</p>
                    <p className="text-sm text-muted-foreground font-inter">Est. Downtime: {estimatedDowntime}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-foreground/10 space-y-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground font-inter">Cost Impact</span>
                        <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold">-${cost}</span>
                    </div>

                    <Button
                        onClick={handleScheduleMaintenance}
                        className="w-full bg-[#00E0C6] hover:bg-[#00c4ad] text-black font-bold font-inter text-xs"
                    >
                        APPROVE & SCHEDULE MAINTENANCE
                    </Button>
                </div>
            </div>
        </div>
    );
}
