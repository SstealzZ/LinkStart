import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: "#D6BBFC",
    },
    secondary: {
      main: "#ff4081",
    },
    error: {
      main: "#ff5252",
    },
    background: {
      default: "#121212",
      paper: "rgba(30, 30, 30, 0.7)",
    },
    header: {
      main: "#121212",
    },
  },
});

export default theme;
