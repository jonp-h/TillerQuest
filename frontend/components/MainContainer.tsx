import { Paper } from "@mui/material";

export default function MainContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Paper id="main-container" className="pt-24 min-h-screen" elevation={1}>
      {children}
    </Paper>
  );
}
