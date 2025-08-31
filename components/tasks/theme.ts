export const vibrantThemes = [
  {
    bg: "bg-[#694cf1]",
    text: "text-white",
    muted: "text-white/80",
    icon: "bg-black/20 text-white",
    chip: "bg-white/20 text-white",
    pill: "bg-transparent text-white",
    action: "bg-white/20 hover:bg-white/30 text-white",
    border: "border-white",
  },
  {
    bg: "bg-[#fdc743]",
    text: "text-gray-900",
    muted: "text-gray-800/80",
    icon: "bg-black/20 text-white",
    chip: "bg-white/70 text-gray-900",
    pill: "bg-transparent text-gray-900",
    action: "bg-black/10 hover:bg-black/15 text-gray-900",
    border: "border-black",
  },
  {
    bg: "bg-[#cbd87d]",
    text: "text-gray-900",
    muted: "text-gray-800/80",
    icon: "bg-black/20 text-white",
    chip: "bg-white/70 text-gray-900",
    pill: "bg-transparent text-gray-900",
    action: "bg-black/10 hover:bg-black/15 text-gray-900",
    border: "border-black",
  },
  {
    bg: "bg-[#1e1e1e]",
    text: "text-white",
    muted: "text-white/70",
    icon: "bg-white/10 text-white",
    chip: "bg-white/10 text-white",
    pill: "bg-transparent text-white",
    action: "bg-white/10 hover:bg-white/20 text-white",
    border: "border-white",
  },
] as const;

export type VibrantTheme = (typeof vibrantThemes)[number];

export const pickVibrantTheme = (key: string): VibrantTheme => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return vibrantThemes[h % vibrantThemes.length];
};
