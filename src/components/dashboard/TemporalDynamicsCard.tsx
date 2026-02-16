import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SensorTrend {
    trend: string;       // "rising" | "stable" | "falling"
    rateOfChange: string; // numeric string
    avg24h: string;       // numeric string
}

interface TemporalDynamicsCardProps {
    domain: string;
    sensors: { id: string; label: string; unit: string }[];
    values: Record<string, SensorTrend>;
    onChange: (sensorId: string, field: keyof SensorTrend, value: string) => void;
    className?: string;
}

export const TemporalDynamicsCard: React.FC<TemporalDynamicsCardProps> = ({
    domain,
    sensors,
    values,
    onChange,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            id="temporal-dynamics-card"
            className={`card-meta relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-xl shadow-xl ${className}`}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-foreground/[0.03] transition-colors"
            >
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                        Temporal Dynamics
                    </h3>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 space-y-5">
                            <p className="text-[11px] text-muted-foreground italic">
                                Provide trend context for each sensor to improve prediction accuracy.
                            </p>

                            {sensors.map((sensor) => {
                                const val = values[sensor.id] || { trend: "", rateOfChange: "", avg24h: "" };
                                return (
                                    <div key={sensor.id} className="p-3 bg-background/20 rounded-xl border border-border/30 space-y-3">
                                        <Label className="text-xs font-bold text-foreground/90">
                                            {sensor.label} <span className="text-muted-foreground">({sensor.unit})</span>
                                        </Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Trend</Label>
                                                <Select
                                                    value={val.trend}
                                                    onValueChange={(v) => onChange(sensor.id, "trend", v)}
                                                >
                                                    <SelectTrigger className="bg-background/40 border-border/50 h-9 text-xs">
                                                        <SelectValue placeholder="—" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card/90 backdrop-blur-xl border-border">
                                                        <SelectItem value="rising">↑ Rising</SelectItem>
                                                        <SelectItem value="stable">→ Stable</SelectItem>
                                                        <SelectItem value="falling">↓ Falling</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Rate/hr</Label>
                                                <Input
                                                    type="number"
                                                    value={val.rateOfChange}
                                                    onChange={(e) => onChange(sensor.id, "rateOfChange", e.target.value)}
                                                    placeholder="±0"
                                                    className="bg-background/40 border-border/50 h-9 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">24h Avg</Label>
                                                <Input
                                                    type="number"
                                                    value={val.avg24h}
                                                    onChange={(e) => onChange(sensor.id, "avg24h", e.target.value)}
                                                    placeholder="0"
                                                    className="bg-background/40 border-border/50 h-9 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
