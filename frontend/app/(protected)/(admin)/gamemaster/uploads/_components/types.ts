export interface UploadReviewFormProps {
  id: string;
  filename: string;
  uploadedAt: Date;
  guildName: string | null;
  previewUrl: string | null;
  previewError: string | null;
  uploader: {
    id: string;
    username: string | null;
    name: string | null;
    lastname: string | null;
  };
  guild: {
    name: string;
    id: number;
  } | null;
}
