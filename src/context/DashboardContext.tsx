import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { Monitor, Cpu, Smartphone, Laptop, LucideIcon, Activity } from "lucide-react";

export interface Device {
    id: string;
    name: string;
    icon: LucideIcon;
}

// ─── Dashboard Intelligence Types ────────────────────────────────

export interface DashboardIntelligence {
    // Raw prediction data — used by GlobalStatusBar and FleetCommandPanel
    prediction: {
        healthIndex: number;
        rul: number;
        rulUnit: string;
        riskLevel: string;
        confidence: number;
        precursorProbability: number;
        shortTermRisk: number;
        failureMode: string;
        topSensors: { name: string; impact: number; direction: string }[];
        action: string;
        driftDetected: boolean;
        dataDrift: { detected: boolean; severity: string; explanation: string };
        simulation: {
            maintenanceNow: { riskReduction: number; healthImprovement: number; cost: number };
            maintenanceLater: { riskReduction: number; healthImprovement: number; cost: number };
        };
        longTermProjection: { cycle: number; health: number }[];
        failureCluster: { id: string; label: string; description: string };
    };
    // LLM-generated dashboard analytics
    assetIntelligence: {
        healthIndex: number;
        rul: number;
        rulUnit: string;
        load: number;
        assetName: string;
        statusText: string;
        trendData: { day: number; health: number }[];
    };
    insights: {
        topSensors: { name: string; val: number; fill: string }[];
        aiDiagnostic: string;
        recommendation: string;
        estimatedDowntime: string;
        costImpact: number;
    };
}

// Initial default devices
const defaultDevices: Device[] = [
    { id: "dev-01", name: "Turbine", icon: Monitor },
];

interface DashboardContextType {
    devices: Device[];
    addDevice: (device: Omit<Device, "icon"> & { icon?: LucideIcon }, intelligence?: DashboardIntelligence) => void;
    removeDevice: (id: string) => void;
    deviceIntelligence: Record<string, DashboardIntelligence>;
    getDeviceIntelligence: (deviceId: string) => DashboardIntelligence | null;
    lastAddedDeviceId: string | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [devices, setDevices] = useState<Device[]>([]);
    const [deviceIntelligence, setDeviceIntelligenceState] = useState<Record<string, DashboardIntelligence>>({});
    const [lastAddedDeviceId, setLastAddedDeviceId] = useState<string | null>(null);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const token = localStorage.getItem('forsee_access_token');
                if (!token) {
                    setDevices(defaultDevices);
                    return;
                }

                const response = await api.get('/assets/');
                const assets = response.data;

                const mappedDevices: Device[] = assets.map((asset: any) => ({
                    id: asset.id,
                    name: asset.name,
                    icon: getIconForAssetType(asset.type),
                }));

                if (mappedDevices.length > 0) {
                    setDevices(mappedDevices);
                } else {
                    setDevices(defaultDevices);
                }
            } catch (error) {
                console.error("Failed to fetch assets:", error);
                setDevices(defaultDevices);
            }
        };

        fetchAssets();
    }, []);

    const addDevice = async (newDevice: Omit<Device, "icon"> & { icon?: LucideIcon }, intelligence?: DashboardIntelligence) => {
        // Use the provided ID consistently — don't let the API change it
        const deviceId = newDevice.id;
        const localDevice: Device = {
            id: deviceId,
            name: newDevice.name,
            icon: newDevice.icon || Activity
        };

        // Add device immediately
        setDevices(prev => [...prev, localDevice]);

        // Store intelligence data under this same ID
        if (intelligence) {
            setDeviceIntelligenceState(prev => ({
                ...prev,
                [deviceId]: intelligence
            }));
        }

        // Mark as last added so dashboard can auto-select it
        setLastAddedDeviceId(deviceId);

        // Try to persist to backend (fire-and-forget, don't change the ID)
        try {
            await api.post('/assets/', {
                name: newDevice.name,
                type: 'custom',
                description: 'Added via Dashboard',
                status: 'active'
            });
        } catch (error) {
            console.error("Failed to persist device to API (device still added locally):", error);
        }
    };

    const removeDevice = async (id: string) => {
        try {
            await api.delete(`/assets/${id}`);
        } catch (error) {
            console.error("Failed to remove device from API:", error);
        }
        setDevices(prev => prev.filter(d => d.id !== id));
        setDeviceIntelligenceState(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const getDeviceIntelligence = (deviceId: string): DashboardIntelligence | null => {
        return deviceIntelligence[deviceId] || null;
    };

    return (
        <DashboardContext.Provider value={{ devices, addDevice, removeDevice, deviceIntelligence, getDeviceIntelligence, lastAddedDeviceId }}>
            {children}
        </DashboardContext.Provider>
    );
}

function getIconForAssetType(type: string): LucideIcon {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('turbine')) return Monitor;
    if (lowerType.includes('control')) return Cpu;
    if (lowerType.includes('tablet') || lowerType.includes('mobile')) return Smartphone;
    if (lowerType.includes('monitor') || lowerType.includes('computer')) return Laptop;
    return Activity;
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}
