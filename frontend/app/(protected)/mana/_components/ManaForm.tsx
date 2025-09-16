"use client";
import { getDailyMana } from "@/data/mana/mana";
import { magicalArea } from "@/lib/gameSetting";
import { Button, Tooltip, Typography } from "@mui/material";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ManaFormProps {
  user: User;
  isWeekend: boolean;
  currentDate: Date;
}

function ManaForm({ user, isWeekend, currentDate }: ManaFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [location, setLocation] = useState<null | {
    latitude: number;
    longitude: number;
  }>(null);
  const [correctLocation, setCorrectLocation] = useState<boolean>(false);
  const router = useRouter();

  function checkCorrectLocation(latitude: number, longtitude: number) {
    return (
      Math.abs(
        longtitude - Number(process.env.NEXT_PUBLIC_MAGICAL_AREA_LONGITUDE),
      ) < magicalArea &&
      Math.abs(
        latitude - Number(process.env.NEXT_PUBLIC_MAGICAL_AREA_LATITUDE),
      ) < magicalArea
    );
  }

  const updatePosition = useCallback(() => {
    if ("geolocation" in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });
        setCorrectLocation(checkCorrectLocation(latitude, longitude));
      });
    }
  }, []);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  const handleGetMana = async (event: SyntheticEvent) => {
    event.preventDefault();
    setLoading(true);

    updatePosition();

    if (
      user.lastMana.toISOString().slice(0, 10) ===
      currentDate.toISOString().slice(0, 10)
    ) {
      toast.error(
        "But while you sense the magic around you - you feel it is not yet time to attune to it.",
      );
      setLoading(false);
      return;
    } else if (isWeekend) {
      toast.error(
        "But the magic seems dormant today, perhaps you should try again on a different day.",
      );
      setLoading(false);
      return;
    } else if (!correctLocation) {
      toast.error(
        "But you feel no magic around you. You must be in the wrong place. Make sure location services are enabled and your browser REALLY knows where you are.",
        { autoClose: 10000 },
      );
      setLoading(false);
      return;
    } else {
      try {
        const result = await getDailyMana(user.id);

        if (result.success) {
          toast.success(result.data);
        } else {
          toast.error(result.error);
        }

        setLoading(false);
        router.refresh();
      } catch {
        toast.error(
          "But attuning to the magic fails, you feel no connection - and you feel the need to tell an adult.",
        );
        setLoading(false);
      }
    }
  };

  return (
    <div>
      {!location && (
        <Typography variant="h5" align="center" color="info">
          Loading location...
        </Typography>
      )}
      <Tooltip
        title={
          location &&
          `Your current location is: ${location.latitude}, ${location.longitude}.
          And you are currently ${correctLocation ? "in" : "not in"} the magical area.`
        }
        enterDelay={1500}
        leaveDelay={200}
      >
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
          onClick={handleGetMana}
        >
          {loading ? "Loading..." : "Get mana"}
        </Button>
      </Tooltip>
    </div>
  );
}

export default ManaForm;
