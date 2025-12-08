import { redirectIfNotAdmin } from "@/lib/redirectUtils";
import MainContainer from "@/components/MainContainer";
import { Typography, List, ListItem } from "@mui/material";
import { adminGetPendingImageUploads } from "@/data/admin/imageReview";
import ImageReviewForm from "./_components/UploadReviewForm";

export default async function ImageReviewPage() {
  await redirectIfNotAdmin();
  const pendingUploads = await adminGetPendingImageUploads();

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

      {pendingUploads.length === 0 ? (
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
            {pendingUploads.map((upload) => (
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
