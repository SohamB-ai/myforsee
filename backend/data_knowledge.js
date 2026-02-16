// Domain knowledge extracted from data-for-finetune
// specific to:
// 1. NASA CMAPSS (Turbofan)
// 2. AI4I 2020 (Milling Machine)
// 3. MetroPT (Air Compressor)

const DOMAIN_KNOWLEDGE = {
    // ------------------------------------------------------------------
    // 1. Turbofan Engine (NASA CMAPSS)
    // ------------------------------------------------------------------
    "turbofan": {
        description: "Turbofan Jet Engine (CMAPSS Dataset)",
        sensors: {
            "T2": "Total temperature at fan inlet (°R)",
            "T24": "Total temperature at LPC outlet (°R)",
            "T30": "Total temperature at HPC outlet (°R)",
            "T50": "Total temperature at LPT outlet (°R)",
            "P2": "Pressure at fan inlet (psia)",
            "P15": "Total pressure in bypass-duct (psia)",
            "P30": "Total pressure at HPC outlet (psia)",
            "Nf": "Physical fan speed (rpm)",
            "Nc": "Physical core speed (rpm)",
            "epr": "Engine pressure ratio (P50/P2)",
            "Ps30": "Static pressure at HPC outlet (psia)",
            "phi": "Ratio of fuel flow to Ps30 (pps/psi)",
            "NRf": "Corrected fan speed (rpm)",
            "NRc": "Corrected core speed (rpm)",
            "BPR": "Bypass Ratio",
            "farB": "Burner fuel-air ratio",
            "htBleed": "Bleed Enthalpy",
            "Nf_dmd": "Demanded fan speed (rpm)",
            "PCNfR_dmd": "Demanded corrected fan speed (rpm)",
            "W31": "HPT coolant bleed (lbm/s)",
            "W32": "LPT coolant bleed (lbm/s)"
        },
        failureModes: {
            "HPC_Degradation": "High Pressure Compressor degradation. Indicators: Increased T30, Decreased efficiency.",
            "Fan_Degradation": "Fan degradation. Indicators: Shifts in Nf and BPR.",
        },
        rules: [
            "Rising T30 and T50 often indicate reduced compressor or turbine efficiency.",
            "Decreasing BPR (Bypass Ratio) combined with rising Core Speed (Nc) is a strong precursor to failure.",
            "Vibration sensors not explicitly listed but implied by structural noise in 'phi'."
        ]
    },

    // ------------------------------------------------------------------
    // 2. Milling Machine (AI4I 2020)
    // ------------------------------------------------------------------
    "milling": {
        description: "Industrial Milling Machine (AI4I 2020 Dataset)",
        sensors: {
            "Air temperature [K]": "Ambient temperature",
            "Process temperature [K]": "Temperature of the manufacturing process",
            "Rotational speed [rpm]": "Spindle speed",
            "Torque [Nm]": "Spindle torque",
            "Tool wear [min]": "Accumulated usage time of the cutting tool"
        },
        failureModes: {
            "TWF": "Tool Wear Failure: Tool wear replaces at 200-240min. Usage > 200min is critical.",
            "HDF": "Heat Dissipation Failure: If (Process Temp - Air Temp) < 8.6 K and Rotational Speed < 1380 rpm.",
            "PWF": "Power Failure: If (Torque * Rotational Speed) < 3500 W or > 9000 W.",
            "OSF": "Overstrain Failure: If (Tool Wear * Torque) > 11,000 minNm (L-type), 12,000 (M-type), 13,000 (H-type).",
            "RNF": "Random Failures: Uncorrelated process noise."
        },
        rules: [
            "Monitor 'Tool wear [min]' strictly. If > 200, Risk is HIGH.",
            "Check power bounds: Power = Torque * (Speed * 2pi/60). Keep within safe envelope.",
            "HDF is likely if process temperature is too close to air temperature at low speeds."
        ]
    },

    // ------------------------------------------------------------------
    // 3. Air Compressor (MetroPT)
    // ------------------------------------------------------------------
    "compressor": {
        description: "Metro Train Air Compressor (MetroPT Dataset)",
        sensors: {
            "TP2": "Pressure on the compressor outlet (bar)",
            "TP3": "Pressure on the drying tower outlet (bar)",
            "H1": "Pressure on the relief valve (bar)",
            "DV_pressure": "Pressure drop across drying tower",
            "Reservoirs": "Air reservoir pressure (bar)",
            "Motor_current": "Current metrics (A)",
            "Oil_temperature": "Oil temp (°C)",
            "Caudal_impulses": "Flow impulses count"
        },
        failureModes: {
            "Leakage": "Air leakage in high pressure circuit. Indicators: Frequent compressor cycling, dropped TP3.",
            "Valve_Failure": "Relief valve stuck/broken. Indicators: Abnormal H1 readings.",
            "Motor_Anamoly": "Electrical issues. Indicators: Spikes in Motor_current."
        },
        rules: [
            "Drop in TP3 without corresponding demand suggests leakage.",
            "High Oil Temperature (>80°C) reduces lubrication efficiency and risks seizure.",
            "Mismatch between TP2 and TP3 suggests drying tower blockage."
        ]
    },

    // ------------------------------------------------------------------
    // Default fallback
    // ------------------------------------------------------------------
    "generic": {
        description: "General Industrial Equipment",
        sensors: {},
        failureModes: {
            "Wear": "General mechanical wear.",
            "Overheating": "Temperature exceeding thermal limits."
        },
        rules: [
            "Higher vibration and temperature usually indicate degrading health.",
            "Sudden shifts in pressure or flow suggest blockages or leaks."
        ]
    }
};

/**
 * Retrieves the specific knowledge base for a given system type.
 * @param {string} systemName - The name or type of the system (e.g., "Wind Turbine", "Milling Machine").
 * @returns {object} The specific domain knowledge (sensors, failures, rules).
 */
function getSystemKnowledge(systemName) {
    if (!systemName) return DOMAIN_KNOWLEDGE.generic;

    const lowerName = systemName.toLowerCase();

    if (lowerName.includes("turbofan") || lowerName.includes("engine") || lowerName.includes("aircraft")) {
        return DOMAIN_KNOWLEDGE.turbofan;
    }
    if (lowerName.includes("mill") || lowerName.includes("cnc") || lowerName.includes("tool")) {
        return DOMAIN_KNOWLEDGE.milling;
    }
    if (lowerName.includes("compressor") || lowerName.includes("pump") || lowerName.includes("metro")) {
        return DOMAIN_KNOWLEDGE.compressor;
    }

    return DOMAIN_KNOWLEDGE.generic;
}

module.exports = { getSystemKnowledge };
