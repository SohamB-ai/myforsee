import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface SpectralDataValues {
    dominantFrequency: string;
    frequencyType: string;
    vibrationSeverity: string;
}

interface SpectralDataCardProps {
    domain: string;
    values: SpectralDataValues;
    onChange: (field: keyof SpectralDataValues, value: string) => void;
    className?: string;
}

// Only show for mechanical systems
const MECHANICAL_SYSTEMS = [
    "wind-turbines", "industrial-motors", "pumps", "cnc-machines",
    "industrial-robots", "traction-motors", "cooling-systems",
    "drilling-equipment", "hvac-systems", "jet-engines",
    "power-generators", "vehicle-engines",
];

export const SpectralDataCard: React.FC<SpectralDataCardProps> = ({
    domain,
    values,
    onChange,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!MECHANICAL_SYSTEMS.includes(domain)) return null;

    return (
        <div
            id="spectral-data-card"
            className={`card-meta relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-xl shadow-xl ${className}`}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-foreground/[0.03] transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                        Spectral / Frequency Data
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
                                Vibration frequency analysis provides insight into the type of mechanical fault developing.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Dominant Frequency */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Dominant Freq (Hz)</Label>
                                    <Input
                                        type="number"
                                        value={values.dominantFrequency}
                                        onChange={(e) => onChange("dominantFrequency", e.target.value)}
                                        placeholder="0"
                                        className="bg-background/40 border-border/50 h-10"
                                    />
                                </div>

                                {/* Frequency Type */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Freq Type</Label>
                                    <Select value={values.frequencyType} onValueChange={(v) => onChange("frequencyType", v)}>
                                        <SelectTrigger className="bg-background/40 border-border/50 h-10">
                                            <SelectValue placeholder="— Select —" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/90 backdrop-blur-xl border-border">
                                            <SelectItem value="1x-rpm">1x RPM (Unbalance)</SelectItem>
                                            <SelectItem value="2x-rpm">2x RPM (Misalignment)</SelectItem>
                                            <SelectItem value="sub-harmonic">Sub-harmonic (Looseness)</SelectItem>
                                            <SelectItem value="high-frequency">High-Frequency (Bearing)</SelectItem>
                                            <SelectItem value="broadband">Broadband (Cavitation / Turbulence)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Vibration Severity */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">ISO Severity</Label>
                                    <Select value={values.vibrationSeverity} onValueChange={(v) => onChange("vibrationSeverity", v)}>
                                        <SelectTrigger className="bg-background/40 border-border/50 h-10">
                                            <SelectValue placeholder="— Select —" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card/90 backdrop-blur-xl border-border">
                                            <SelectItem value="good">Good (A)</SelectItem>
                                            <SelectItem value="satisfactory">Satisfactory (B)</SelectItem>
                                            <SelectItem value="unsatisfactory">Unsatisfactory (C)</SelectItem>
                                            <SelectItem value="unacceptable">Unacceptable (D)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
