import TimeLeft from "@/components/TimeLeft";
import { DateToString } from "@/types/dateToString";
import { Divider, Link, Typography } from "@mui/material";
import { App } from "@tillerquest/prisma/browser";

function AppInfoContainer({ app }: { app: DateToString<App> }) {
  return (
    <div className=" w-1/2 m-2 p-3 text-center rounded-xl border shadow-lg font-mono">
      <Typography variant="h5" color="success">
        {app.shortDescription}
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ marginTop: "2rem" }}>
        {app.description}
      </Typography>
      <Divider sx={{ marginY: "1rem" }} />
      <Typography variant="body1">
        {app.downloadUrl ? (
          <>
            <Typography variant="h6">
              Download the application here:{" "}
              <Link
                color="secondary"
                href={app.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download (external site)
              </Link>
            </Typography>
          </>
        ) : null}
        <br />
        {app.scheduled ? (
          <>
            An event is scheduled to happen in the hub at{" "}
            <Typography variant="h5" color="warning">
              {new Date(app.scheduled).toLocaleString()}
            </Typography>{" "}
            <br /> {app.scheduleInfoText}
            {app.scheduled && (
              <>
                Time until event:{" "}
                <TimeLeft endTime={new Date(app.scheduled)} color="error" />
              </>
            )}
          </>
        ) : (
          <Typography variant="h6" color="textSecondary">
            Ask a gamemaster to schedule an event for this app!
          </Typography>
        )}
      </Typography>
    </div>
  );
}

export default AppInfoContainer;
