// import { LinearProgress, LinearProgressProps } from "@mui/material";
// import styled from "@mui/material/styles";

// export const Statusbar = styled(LinearProgress)<LinearProgressProps>(
//   ({ theme }) => ({
//     width: 300,
//     height: 20,
//     borderRadius: theme.shape.borderRadius,
//     backgroundColor: theme.palette.grey[300],
//   })
// );

import { styled } from "@mui/material/styles";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

export const Statusbar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}));
