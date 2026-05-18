import React, { useEffect, useState } from "react";

const BRAND_PRESETS = {
  opes: {
    "--theme-left-bg": "#F8F8F8",
    "--theme-right-bg": "#F1EEF9",
    "--theme-text-primary": "#23303B",
    "--theme-text-secondary": "#64748B",
    "--theme-highlight": "#5B3E96",
    "--theme-border": "#E2E8F0",
    "--theme-button": "#5B3E96",
    "--theme-button-hover": "#4a327a",
  },
  staircase: {
    "--theme-left-bg": "#F8FAFC", // slate-50
    "--theme-right-bg": "#EFF6FF", // blue-50
    "--theme-text-primary": "#0F172A", // slate-900
    "--theme-text-secondary": "#475569", // slate-600
    "--theme-highlight": "#0052CC",
    "--theme-border": "#E2E8F0", // slate-200
    "--theme-button": "#0052CC",
    "--theme-button-hover": "#0040A0",
  }
};

export default function CalculatorThemeWrapper({ defaultBrand = "opes", children }) {
  const [themeStyles, setThemeStyles] = useState(BRAND_PRESETS[defaultBrand]);

  useEffect(() => {
    // If embedding via iframe, you can pass parameters like:
    // yourdomain.com/calculator?brand=staircase 
    // OR custom colors: yourdomain.com/calculator?btnColor=FF0000
    const params = new URLSearchParams(window.location.search);
    
    if (params.get("brand") && BRAND_PRESETS[params.get("brand")]) {
      setThemeStyles(BRAND_PRESETS[params.get("brand")]);
    }

    // Optional: Allow completely custom colors via Iframe URL overrides
    if (params.get("highlight")) {
      setThemeStyles(prev => ({ ...prev, "--theme-highlight": `#${params.get("highlight")}` }));
    }
  }, []);

  return (
    // We apply the CSS variables to this top-level div. 
    // All children will inherit these colors.
    <div style={themeStyles} className="w-full h-full">
      {children}
    </div>
  );
}