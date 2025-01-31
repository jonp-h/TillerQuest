"use client";

import { useEffect, useState } from "react";
import { magicalArea } from "./gameSetting";
import ManaForm from "@/app/(protected)/mana/_components/ManaForm";
import { User } from "@prisma/client";

interface LocationProps {
  user: User;
  isWeekend: boolean;
  currentDate: Date;
}

const Location = ({ user, isWeekend, currentDate }: LocationProps) => {
  const [location, setLocation] = useState<null | {
    latitude: number;
    longitude: number;
  }>(null);
  const [correctLocation, setCorrectLocation] = useState<boolean>(false);

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

  useEffect(() => {
    if ("geolocation" in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });
        setCorrectLocation(checkCorrectLocation(latitude, longitude));
      });
    }
  }, []);

  return (
    <>
      {location ? (
        <p>
          Your current location is: {location.latitude}, {location.longitude}.
          And you are {correctLocation ? "in" : "not in"} the magical area.
          <ManaForm
            user={user}
            isWeekend={isWeekend}
            currentDate={currentDate}
            correctLocation={correctLocation}
          />
        </p>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default Location;
