import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface OperationalContextValues {
    loadLevel: string;
    ambientTemp: string;
    ambientHumidity: string;
    environmentType: string;
}

interface OperationalContextCardProps {
    domain: string;
    values: OperationalContextValues;
    onChange: (field: keyof OperationalContextValues, value: string) => void;
    className?: string;
}

export const OperationalContextCard: React.FC<OperationalContextCardProps> = ({
    domain,
    values,
    onChange,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            id="operational-context-card"
            className={`card-meta relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-xl shadow-xl ${className}`}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-foreground/[0.03] transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                        Operational Context
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
                                Environmental and load context helps the AI interpret sensor values correctly.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Load Level */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Load Level</Label>
                                    <Select value={values.loadLevel} onValueChange={(v) => onChange("loadLevel", v)}>
                                        <SelectTrigger className="bg-background/40 border-border/50 h-10">
                                            <SelectValue placeholder="— Select —" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/90 backdrop-blur-xl border-border">
                                            <SelectItem value="idle">Idle (0-10%)</SelectItem>
                                            <SelectItem value="light">Light (10-40%)</SelectItem>
                                            <SelectItem value="normal">Normal (40-75%)</SelectItem>
                                            <SelectItem value="heavy">Heavy (75-100%)</SelectItem>
                                            <SelectItem value="overload">Overload (&gt;100%)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Environment Type */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Environment</Label>
                                    <Select value={values.environmentType} onValueChange={(v) => onChange("environmentType", v)}>
                                        <SelectTrigger className="bg-background/40 border-border/50 h-10">
                                            <SelectValue placeholder="— Select —" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/90 backdrop-blur-xl border-border">
                                            <SelectItem value="indoor">Indoor (Climate Controlled)</SelectItem>
                                            <SelectItem value="outdoor">Outdoor (Temperate)</SelectItem>
                                            <SelectItem value="marine">Marine / Offshore</SelectItem>
                                            <SelectItem value="desert">Desert / Arid</SelectItem>
                                            <SelectItem value="arctic">Arctic / Cold</SelectItem>
                                            <SelectItem value="tropical">Tropical / Humid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Ambient Temperature */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Ambient Temp (°C)</Label>
                                    <Input
                                        type="number"
                                        value={values.ambientTemp}
                                        onChange={(e) => onChange("ambientTemp", e.target.value)}
                                        placeholder="25"
                                        className="bg-background/40 border-border/50 h-10"
                                    />
                                </div>

                                {/* Ambient Humidity */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Ambient Humidity (%)</Label>
                                    <Input
                                        type="number"
                                        value={values.ambientHumidity}
                                        onChange={(e) => onChange("ambientHumidity", e.target.value)}
                                        placeholder="50"
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
