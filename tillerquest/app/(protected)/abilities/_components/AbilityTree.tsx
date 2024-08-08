"use client";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import Tree, { RawNodeDatum } from "react-d3-tree";
import { AbilityNodes } from "./AbilityNodes";
import { RootAbilities, UserAbilities } from "./interfaces";
import { $Enums } from "@prisma/client";

export default function AbilityTree({
  userClass,
  rootAbilities,
  userAbilities,
}: {
  userClass: $Enums.Class;
  rootAbilities: RootAbilities | null;
  userAbilities: UserAbilities[] | null;
}) {
  const router = useRouter();

  const handleNodeClick = (nodeDatum: RawNodeDatum) => {
    router.push(`/abilities/${nodeDatum.name}`);
  };

  const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }) => {
    const [translate, setTranslate] = useState(defaultTranslate);
    const [dimensions, setDimensions] = useState<
      { width: number; height: number } | undefined
    >();
    const containerRef = useCallback(
      (
        containerElem: {
          // Typescript does not recognize width and height
          getBoundingClientRect: () => { width: any; height: any };
        } | null
      ) => {
        if (containerElem !== null) {
          const { width, height } = containerElem.getBoundingClientRect();
          setDimensions({ width, height });
          setTranslate({ x: width / 2, y: height - 1500 / 2 });
        }
      },
      []
    );
    return [dimensions, translate, containerRef];
  };

  const [dimensions, translate, containerRef] = useCenteredTree({ x: 0, y: 0 });

  const userIsNotClass = !(
    Object.values($Enums.Class).includes(rootAbilities?.type as $Enums.Class) &&
    userClass != (rootAbilities?.type as $Enums.Class)
  );

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
      {/* @ts-ignore */}
      <div className="h-screen w-full" ref={containerRef}>
        {/* @ts-ignore */}
        <Tree
          data={rootAbilities}
          depthFactor={250}
          dimensions={dimensions}
          translate={translate}
          orientation="vertical"
          pathFunc={"diagonal"}
          pathClassFunc={() => "linkClass"}
          draggable={true}
          zoomable={false}
          nodeSize={{ x: 350, y: 350 }}
          renderCustomNodeElement={(rd3tProps) =>
            AbilityNodes(userIsNotClass, userAbilities, {
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
