import { Alert } from "@mui/material";

function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert className="m-2 w-full h-full" severity="error">
      {message}
    </Alert>
  );
}

export default ErrorAlert;
