export type McColor =
  | "blue"
  | "teal"
  | "pink"
  | "yellow"
  | "purple"
  | "cyan"
  | "red"
  | "green"
  | "slate"
  | "charcoal"
  | "lightYellow"
  | "darkYellow"
  | "cobalt";

export type McColorMap = Record<McColor, string>;

export const appColors: McColorMap = {
  blue: "#8996F6",
  teal: "#91CAA2",
  pink: "#FBB2EA",
  yellow: "#e6a735",
  purple: "#BC8BB1",
  cyan: "#B8C0F9",
  red: "#FC7855",
  green: "#50A76A",
  slate: "#96A3AC",
  charcoal: "#639CAB",
  lightYellow: "#eed5a6",
  darkYellow: "#c09443",
  cobalt: "#596CF2",
};

export const getContrastAppColor = (color: string): string => {
  const contrastMap: Record<string, string> = {
    [appColors.blue]: "#060E47",
    [appColors.teal]: "#1E3E27",
    [appColors.pink]: "#440435",
    [appColors.yellow]: "#5F410A",
    [appColors.purple]: "#2D1A29",
    [appColors.cyan]: "#060E47",
    [appColors.red]: "#501201",
    [appColors.green]: "#1E3E27",
    [appColors.slate]: "#1E2326",
    [appColors.charcoal]: "#17272B",
    [appColors.cobalt]: "#060E47",
  };
  return contrastMap[color] || "#FFFFFF";
};
