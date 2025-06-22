import { RawNodeDatum } from "react-d3-tree";
import { ExtendedRawNodeDatum, UserAbilities } from "./interfaces";

export const AbilityNodes = (
  userIsNotClass: boolean,
  userAbilities: UserAbilities[] | null,
  {
    nodeDatum,
    handleNodeClick,
  }: {
    nodeDatum: ExtendedRawNodeDatum;
    handleNodeClick: (node: RawNodeDatum) => void;
  },
) => (
  <g>
    <defs>
      <radialGradient id="backgroundGradient">
        <stop offset="70%" stopColor="#52525b" />
        <stop offset="100%" stopColor="#3f3f46" />
      </radialGradient>
      <radialGradient id="ownedGradient">
        <stop offset="50%" stopColor="white" stopOpacity={0.3} />
        <stop offset="100%" stopColor="white" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="wrongClassGradient">
        <stop offset="70%" stopColor="grey" />
        <stop offset="100%" stopColor="salmon" />
      </radialGradient>
    </defs>
    <circle
      r="75"
      fill={
        userIsNotClass ? "url(#backgroundGradient)" : "url(#wrongClassGradient)"
      }
      strokeWidth="0"
      onClick={() => handleNodeClick(nodeDatum)}
    />

    <image
      clipPath="inset(0% round 50%)"
      href={`/abilities/${nodeDatum.icon}`}
      x="-60"
      y="-60"
      height="120"
      width="120"
      onClick={() => handleNodeClick(nodeDatum)}
    />

    {userAbilities &&
    userAbilities.some((ability) => ability.ability.name === nodeDatum.name) ? (
      <circle
        r="60"
        fill="url(#ownedGradient)"
        strokeWidth="0"
        onClick={() => handleNodeClick(nodeDatum)}
      >
        <animate
          attributeName="r"
          values="100; 75; 100"
          dur="5s"
          repeatCount="indefinite"
        />
      </circle>
    ) : (
      <circle
        r="60"
        fill="black"
        opacity={0}
        strokeWidth="0"
        onClick={() => handleNodeClick(nodeDatum)}
      />
    )}
    <text
      fill="white"
      strokeWidth="0"
      x="80"
      y="5"
      fontSize={25}
      onClick={() => handleNodeClick(nodeDatum)}
    >
      {nodeDatum.name
        .replace(/-/g, " ")
        .split(" ")
        .reduce<string[]>(
          (acc, word) => {
            const lastLine = acc[acc.length - 1] || "";
            if ((lastLine + " " + word).trim().length > 12) {
              acc.push(word);
            } else {
              acc[acc.length - 1] = (lastLine + " " + word).trim();
            }
            return acc;
          },
          [""],
        )
        .map((line, i) => (
          <tspan key={i} x="80" dy={i === 0 ? 0 : 28}>
            {line}
          </tspan>
        ))}
    </text>
  </g>
);
