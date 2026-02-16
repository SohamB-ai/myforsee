import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface EventCorrelationValues {
    lastMaintenanceDate: string;
    maintenanceType: string;
    daysSinceLastFailure: string;
}

interface EventCorrelationCardProps {
    domain: string;
    values: EventCorrelationValues;
    onChange: (field: keyof EventCorrelationValues, value: string) => void;
    className?: string;
}

export const EventCorrelationCard: React.FC<EventCorrelationCardProps> = ({
    domain,
    values,
    onChange,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            id="event-correlation-card"
            className={`card-meta relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-xl shadow-xl ${className}`}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-foreground/[0.03] transition-colors"
            >
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                        Event Correlation
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
                                Maintenance history and recent events help the AI distinguish between normal post-service readings and genuine anomalies.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Last Maintenance Date */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Last Maintenance</Label>
                                    <Input
                                        type="date"
                                        value={values.lastMaintenanceDate}
                                        onChange={(e) => onChange("lastMaintenanceDate", e.target.value)}
                                        className="bg-background/40 border-border/50 h-10"
                                    />
                                </div>

                                {/* Maintenance Type */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Maintenance Type</Label>
                                    <Select value={values.maintenanceType} onValueChange={(v) => onChange("maintenanceType", v)}>
                                        <SelectTrigger className="bg-background/40 border-border/50 h-10">
                                            <SelectValue placeholder="— Select —" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/90 backdrop-blur-xl border-border">
                                            <SelectItem value="scheduled">Scheduled PM</SelectItem>
                                            <SelectItem value="unscheduled">Unscheduled / Breakdown</SelectItem>
                                            <SelectItem value="overhaul">Major Overhaul</SelectItem>
                                            <SelectItem value="calibration">Calibration Only</SelectItem>
                                            <SelectItem value="none">No Recent Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Days Since Last Failure */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Days Since Last Failure</Label>
                                    <Input
                                        type="number"
                                        value={values.daysSinceLastFailure}
                                        onChange={(e) => onChange("daysSinceLastFailure", e.target.value)}
                                        placeholder="—"
                                        className="bg-background/40 border-border/50 h-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
