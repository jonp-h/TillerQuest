import { RawNodeDatum } from "react-d3-tree";
import { UserAbilities } from "./interfaces";

export const AbilityNodes = (
  userAbilities: UserAbilities[] | null,
  {
    nodeDatum,
    handleNodeClick,
  }: { nodeDatum: RawNodeDatum; handleNodeClick: (node: RawNodeDatum) => void }
) => (
  <g>
    <defs>
      <radialGradient id="backgroundGradient">
        <stop offset="70%" stopColor="#52525b" />
        <stop offset="100%" stopColor="#3f3f46" />
      </radialGradient>
      <radialGradient id="ownedGradient">
        <stop offset="50%" stopColor="purple" stopOpacity={0.5} />
        <stop offset="100%" stopColor="purple" stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle
      r="75"
      fill="url(#backgroundGradient)"
      strokeWidth="0"
      onClick={() => handleNodeClick(nodeDatum)}
    />

    <image
      clipPath="inset(0% round 50%)"
      href={`/abilities/${nodeDatum.name}.jpg`}
      x="-60"
      y="-60"
      height="120"
      width="120"
      onClick={() => handleNodeClick(nodeDatum)}
    />

    {userAbilities &&
    userAbilities.some((ability) => ability.abilityName === nodeDatum.name) ? (
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
        opacity={0.5}
        strokeWidth="0"
        onClick={() => handleNodeClick(nodeDatum)}
      />
    )}
    <text
      fill="white"
      strokeWidth="0"
      x="80"
      y="5"
      fontSize={30}
      onClick={() => handleNodeClick(nodeDatum)}
    >
      {nodeDatum.name.replace("-", " ")}
    </text>
  </g>
);
