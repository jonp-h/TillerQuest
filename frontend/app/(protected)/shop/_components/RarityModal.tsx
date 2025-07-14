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
import {
  epicRarity,
  legendaryRarity,
  mythicRarity,
  rareRarity,
  uncommonRarity,
} from "@/lib/gameSetting";

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
            <RarityText rarity="legendary">rarity tier</RarityText>. Tiers are
            updated once per day. The rarity tiers from most owned to least
            owned are:
          </Typography>
          <RarityText rarity="common">Common</RarityText>
          <Typography gutterBottom>
            Items owned by &gt; {uncommonRarity} are considered common.
          </Typography>
          <RarityText rarity="uncommon">Uncommon</RarityText>
          <Typography gutterBottom>
            Items owned by &lt; {uncommonRarity} are considered uncommon.
          </Typography>
          <RarityText rarity="rare">Rare</RarityText>
          <Typography gutterBottom>
            Items owned by &lt; {rareRarity} are considered rare.
          </Typography>
          <RarityText rarity="epic">Epic</RarityText>
          <Typography gutterBottom>
            Items owned by &lt; {epicRarity} are considered epic.
          </Typography>
          <RarityText rarity="legendary">Legendary</RarityText>
          <Typography gutterBottom>
            Items owned by &lt; {legendaryRarity} are considered legendary.
          </Typography>
          <RarityText rarity="mythic">Mythic</RarityText>
          <Typography gutterBottom>
            Items owned by &lt; {mythicRarity} are considered mythic.
          </Typography>
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
