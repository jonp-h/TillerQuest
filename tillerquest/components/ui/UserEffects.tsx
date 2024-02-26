import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faHand, faShield } from "@fortawesome/free-solid-svg-icons";
import TimeLeft from "../TimeLeft";

export default function UserEffects(props: any) {
  return (
    <>
      {/* The following code can be exanded to include icons */}
      {props.effects.map((effect: any) => {
        if (effect.endTime > new Date()) {
          return (
            <div
              key={effect.abilityName}
              className="flex flex-col gap-3 w-36 hover:text-purple-600 hover:border-purple-600 border-white border-2 rounded-lg p-3 items-center"
            >
              <FontAwesomeIcon icon={effect.icon} className=" h-10" />
              <p>{effect.abilityName}</p>
              {/* Render timer if effect has a duration */}
              {!!effect.endTime && <TimeLeft endTime={effect.endTime} />}
            </div>
          );
        }
      })}
    </>
  );
}
