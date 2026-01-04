import { Button, Paper, Typography } from "@mui/material";
import Image from "next/image";

export default function ErrorPage({
  text,
  redirectLink = "/",
  buttonText = "Return to safety!",
  reset,
}: {
  text: string;
  redirectLink?: string;
  buttonText?: string;
  reset?: () => void;
}) {
  return (
    <Paper
      id="main-container"
      className="text-center pt-52 min-h-screen"
      elevation={1}
    >
      <Image
        src="/Error.png"
        alt="Error"
        width={300}
        height={300}
        className="rounded-full mx-auto mb-4"
      />
      <Typography variant="h3" component="h1" gutterBottom>
        Error
      </Typography>
      <Typography variant="body1" component="p" gutterBottom>
        {text}
      </Typography>
      <div className="flex flex-col gap-5 w-fit m-auto">
        <Button variant="contained" color="primary" href={redirectLink}>
          {buttonText}
        </Button>
        {reset && (
          <Button variant="contained" color="info" onClick={() => reset()}>
            Try again
          </Button>
        )}
      </div>
    </Paper>
  );
}
