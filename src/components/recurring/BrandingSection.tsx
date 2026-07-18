import { useState, useRef } from "react";
import { Upload, X, Loader2, Palette } from "lucide-react";
import { blink } from "../../blink/client";

const PRESET_COLORS = [
  { label: "Coral (default)", value: "hsl(16 95% 52%)" },
  { label: "Indigo", value: "#4F46E5" },
  { label: "Emerald", value: "#059669" },
  { label: "Rose", value: "#E11D48" },
  { label: "Amber", value: "#D97706" },
  { label: "Sky", value: "#0284C7" },
  { label: "Violet", value: "#7C3AED" },
  { label: "Slate", value: "#475569" },
];

interface Props {
  accentColor: string;
  logoUrl: string | null;
  logoText: string;
  onColorChange: (color: string) => void;
  onLogoUrlChange: (url: string | null) => void;
}

export function BrandingSection({
  accentColor,
  logoUrl,
  logoText,
  onColorChange,
  onLogoUrlChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [customHex, setCustomHex] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, SVG, WEBP)");
      return;
    }
    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo must be under 2MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const ext = file.name.split(".").pop() || "png";
      const { publicUrl } = await blink.storage.upload(
        file,
        `logos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`,
        { onProgress: (pct) => setUploadProgress(pct) },
      );
      onLogoUrlChange(publicUrl);
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("Upload failed — please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleCustomHexInput = (val: string) => {
    setCustomHex(val);
    // Apply if it looks like a valid hex
    const hex = val.startsWith("#") ? val : `#${val}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onColorChange(hex);
    }
  };

  const handleNativeColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomHex(hex);
    onColorChange(hex);
  };

  return (
    <div className="space-y-5">
      {/* Logo upload */}
      <div>
        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">
          Company Logo
        </label>
        <div className="flex items-start gap-4">
          {/* Preview */}
          <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center border overflow-hidden border-border bg-background">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-lg font-bold"
                style={{ background: accentColor }}
              >
                {logoText?.slice(0, 2).toUpperCase() || "YS"}
              </div>
            )}
          </div>

          {/* Upload area */}
          <div className="flex-1">
            {uploading ? (
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Uploading… {uploadProgress}%
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ background: accentColor, width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:bg-orange-50 border-border text-foreground"
                >
                  <Upload size={14} style={{ color: accentColor }} />
                  {logoUrl ? "Replace logo" : "Upload logo"}
                </button>
                <p className="text-xs text-muted-foreground">
                  PNG, SVG, or JPG · Max 2MB · Recommended: square, transparent bg
                </p>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => onLogoUrlChange(null)}
                    className="flex items-center gap-1 text-xs transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <X size={11} />
                    Remove logo
                  </button>
                )}
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">
          Brand Color
        </label>

        {/* Preset swatches */}
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESET_COLORS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              title={label}
              onClick={() => {
                onColorChange(value);
                setCustomHex("");
              }}
              className="w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 active:scale-95"
              style={{
                background: value,
                borderColor: accentColor === value ? "#1a1208" : "transparent",
                boxShadow:
                  accentColor === value
                    ? `0 0 0 2px white, 0 0 0 4px ${value}`
                    : "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>

        {/* Custom hex + native picker */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center" title="Open color picker">
            <input
              type="color"
              value={accentColor.startsWith("#") ? accentColor : "#F94E10"}
              onChange={handleNativeColorPicker}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0.5 bg-transparent"
            />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm flex-1 border-border">
            <Palette size={13} className="text-muted-foreground" />
            <input
              type="text"
              value={customHex || (accentColor.startsWith("#") ? accentColor : "")}
              onChange={(e) => handleCustomHexInput(e.target.value)}
              placeholder="Custom hex e.g. #4F46E5"
              className="flex-1 outline-none text-sm bg-transparent text-foreground"
              maxLength={7}
            />
          </div>

          {/* Live preview swatch */}
          <div
            className="w-8 h-8 rounded-lg border flex-shrink-0 border-border"
            style={{ background: accentColor }}
            title="Current color"
          />
        </div>
      </div>
    </div>
  );
}
