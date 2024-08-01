"use client";
import { Ability, UserAbility } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import Tree from "react-d3-tree";

const renderNodeWithCustomEvents = (
  userAbilities: UserAbility[],
  { nodeDatum, handleNodeClick }
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

    {userAbilities.some((ability) => ability.abilityName === nodeDatum.name) ? (
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
      {nodeDatum.name}
    </text>
  </g>
);

export default function AbilityTree({
  rootAbilities,
  userAbilities,
}: {
  rootAbilities: Ability[];
  userAbilities: UserAbility[];
}) {
  const router = useRouter();

  const handleNodeClick = (nodeDatum) => {
    router.push(`/abilities/${nodeDatum.name}`);
  };

  const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }) => {
    const [translate, setTranslate] = useState(defaultTranslate);
    const [dimensions, setDimensions] = useState();
    const containerRef = useCallback((containerElem) => {
      if (containerElem !== null) {
        const { width, height } = containerElem.getBoundingClientRect();
        setDimensions({ width, height });
        setTranslate({ x: width / 2, y: height - 1500 / 2 });
      }
    }, []);
    return [dimensions, translate, containerRef];
  };

  const [dimensions, translate, containerRef] = useCenteredTree();

  return (
    <>
      <style>
        {`
      .linkClass {
        stroke: white !important;
        stroke-width: 5;
      }
      `}
      </style>
      <div className="h-screen w-screen" ref={containerRef}>
        <Tree
          data={rootAbilities}
          depthFactor={250}
          dimensions={dimensions}
          translate={translate}
          orientation="vertical"
          pathFunc={"step"}
          pathClassFunc={() => "linkClass"}
          draggable={true}
          zoomable={false}
          nodeSize={{ x: 350, y: 350 }}
          renderCustomNodeElement={(rd3tProps) =>
            renderNodeWithCustomEvents(userAbilities, {
              ...rd3tProps,
              handleNodeClick,
            })
          }
          collapsible={false}
        />
      </div>
    </>
  );
}
