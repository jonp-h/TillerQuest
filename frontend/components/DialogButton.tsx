"use client";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
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
  color = "primary",
  agreeText = "Agree",
  disagreeText = "Disagree",
}: {
  buttonText: string | React.ReactNode;
  dialogTitle: string | React.ReactNode;
  dialogContent: string | React.ReactNode;
  dialogFunction?: () => void;
  disabled?: boolean;
  buttonVariant?: "text" | "outlined" | "contained";
  color?:
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
    | "arenatoken"
    | "gemstones"
    | "health"
    | "mana"
    | "gold"
    | "experience";
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
        color={color}
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
        <DialogContent>{dialogContent}</DialogContent>
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
