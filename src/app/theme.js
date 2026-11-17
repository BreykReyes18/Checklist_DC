import { theme } from "antd"

export const palette = {
  bg0: "#0B0F14",
  bg1: "#121821",
  bg2: "#1A222D",
  bg3: "#212B38",
  line: "#26303C",
  lineSoft: "#1D2530",
  ink1: "#E7EBF0",
  ink2: "#8FA0B3",
  ink3: "#5C6B7C",
  accent: "#33C7D6",
  accentDim: "#1B4148",
  ok: "#35D07F",
  okBg: "#12271D",
  warn: "#F2A93B",
  warnBg: "#2A2013",
  crit: "#F2555A",
  critBg: "#2B1517"
}

export const fontUi = "'IBM Plex Sans', system-ui, sans-serif"
export const fontMono = "'IBM Plex Mono', ui-monospace, monospace"

export const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: palette.accent,
    colorInfo: palette.accent,
    colorSuccess: palette.ok,
    colorWarning: palette.warn,
    colorError: palette.crit,
    colorBgBase: palette.bg0,
    colorBgLayout: palette.bg0,
    colorBgContainer: palette.bg1,
    colorBgElevated: palette.bg1,
    colorBorder: palette.line,
    colorBorderSecondary: palette.lineSoft,
    colorText: palette.ink1,
    colorTextSecondary: palette.ink2,
    colorTextTertiary: palette.ink3,
    fontFamily: fontUi,
    fontSize: 14,
    borderRadius: 8
  },
  components: {
    Button: {
      primaryColor: "#06181A",
      fontWeight: 500,
      controlHeight: 36
    },
    Card: {
      colorBgContainer: palette.bg1,
      borderRadiusLG: 10
    },
    Table: {
      headerBg: palette.bg1,
      headerColor: palette.ink2,
      rowHoverBg: palette.bg2,
      borderColor: palette.lineSoft
    },
    Modal: {
      contentBg: palette.bg1,
      headerBg: palette.bg1
    },
    Input: {
      colorBgContainer: palette.bg2
    },
    Select: {
      colorBgContainer: palette.bg2
    },
    DatePicker: {
      colorBgContainer: palette.bg2
    },
    Menu: {
      darkItemBg: "transparent",
      darkItemColor: palette.ink2,
      darkItemHoverBg: palette.bg2,
      darkItemHoverColor: palette.ink1,
      darkItemSelectedBg: palette.accentDim,
      darkItemSelectedColor: palette.accent
    }
  }
}
