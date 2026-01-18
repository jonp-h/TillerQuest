import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import MainContainer from "@/components/MainContainer";
import { Typography, List, ListItem } from "@mui/material";
import ImageReviewForm from "./_components/UploadReviewForm";
import { secureGet } from "@/lib/secureFetch";
import { UploadReviewFormProps } from "./_components/types";
import ErrorAlert from "@/components/ErrorAlert";

export default async function ImageReviewPage() {
  await redirectIfNotAdmin();
  const pendingUploads = await secureGet<UploadReviewFormProps[]>(
    "/admin/images/pending",
  );

  if (!pendingUploads.ok) {
    return (
      <MainContainer>
        <ErrorAlert
          message={pendingUploads.error || "Failed to load pending uploads"}
        />
      </MainContainer>
    );
  }

  const style = {
    p: 0,
    width: "80%",
    maxWidth: 1400,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
  };

  return (
    <MainContainer>
      <Typography variant="h4" align="center" gutterBottom>
        Guild Image Review
      </Typography>
      <Typography
        variant="body1"
        align="center"
        color="text.secondary"
        gutterBottom
      >
        Review and approve/reject pending guild image uploads
      </Typography>

      {pendingUploads.data.length === 0 ? (
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mt: 4 }}
        >
          No pending image uploads
        </Typography>
      ) : (
        <div className="flex justify-center mt-4">
          <List sx={style}>
            {pendingUploads.data.map((upload) => (
              <ListItem key={upload.id} sx={{ padding: 2 }}>
                <ImageReviewForm upload={upload} />
              </ListItem>
            ))}
          </List>
        </div>
      )}
    </MainContainer>
  );
}
