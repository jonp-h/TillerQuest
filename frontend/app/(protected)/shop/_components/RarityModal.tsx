"use client";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { useState, Fragment } from "react";
import RarityText from "@/components/RarityText";
import { Divider } from "@mui/material";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function CustomizedDialogs() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Show rarity tiers
      </Button>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="rarity-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="rarity-dialog-title">
          Rarity Tiers
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Typography gutterBottom>
            The popularity of an item is determined by its{" "}
            <RarityText rarity="legendary">rarity tier</RarityText>. Bought
            titles and badges are displayed with the rarity tier of the item.
            From least to most sought after, the tiers are:{" "}
          </Typography>
          <div className="mt-5">
            <RarityText className="text-2xl" rarity="common">
              Common
            </RarityText>
            <Divider />
            <Typography gutterBottom sx={{ mb: 3 }}>
              Common items are the easiest to obtain.
            </Typography>
            <RarityText className="text-2xl" rarity="uncommon">
              Uncommon
            </RarityText>
            <Divider />
            <Typography gutterBottom sx={{ mb: 3 }}>
              Uncommon items are more difficult to obtain than common items.
            </Typography>
            <RarityText className="text-2xl" rarity="rare">
              Rare
            </RarityText>
            <Divider />
            <Typography gutterBottom sx={{ mb: 3 }}>
              Uncommon items are more difficult to obtain than uncommon items.
            </Typography>
            <RarityText className="text-2xl" rarity="epic">
              Epic
            </RarityText>
            <Divider />
            <Typography gutterBottom sx={{ mb: 3 }}>
              Epic items are considered prestigious and require a lot of
              dedication to obtain.
            </Typography>
            <RarityText className="text-2xl" rarity="legendary">
              Legendary
            </RarityText>
            <Divider />
            <Typography gutterBottom sx={{ mb: 3 }}>
              The most dedicated players can strive to obtain legendary items.
            </Typography>
            <RarityText className="text-2xl" rarity="mythic">
              Mythic
            </RarityText>
            <Divider />
            <Typography gutterBottom sx={{ mb: 3 }}>
              Few players are able to obtain mythic items, which are considered
              the most prestigious.
            </Typography>
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </Fragment>
  );
}
