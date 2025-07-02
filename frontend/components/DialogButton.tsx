"use client";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Fragment, useState } from "react";

function DialogButton({
  buttonText,
  dialogTitle,
  dialogContent,
  dialogFunction,
  disabled = false,
  buttonVariant = "outlined",
  agreeText = "Agree",
  disagreeText = "Disagree",
}: {
  buttonText: string | React.ReactNode;
  dialogTitle: string | React.ReactNode;
  dialogContent: string | React.ReactNode;
  dialogFunction?: () => void;
  disabled?: boolean;
  buttonVariant?: "text" | "outlined" | "contained";
  agreeText?: string;
  disagreeText?: string;
}) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAgree = () => {
    handleClose();
    if (dialogFunction) {
      dialogFunction();
    }
  };
  return (
    <Fragment>
      <Button
        variant={buttonVariant}
        onClick={handleClickOpen}
        disabled={disabled}
      >
        {buttonText}
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            {disagreeText}
          </Button>
          <Button onClick={handleAgree} autoFocus>
            {agreeText}
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default DialogButton;
