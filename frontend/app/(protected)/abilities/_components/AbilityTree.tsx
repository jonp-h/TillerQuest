"use client";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import Tree, { RawNodeDatum } from "react-d3-tree";
import { AbilityNodes } from "./AbilityNodes";
import {
  ExtendedRawNodeDatum,
  RootAbilities,
  UserAbilities,
} from "./interfaces";
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          getBoundingClientRect: () => { width: any; height: any };
        } | null,
      ) => {
        if (containerElem !== null) {
          const { width, height } = containerElem.getBoundingClientRect();
          setDimensions({ width, height });
          setTranslate({ x: width / 2, y: height - 1500 / 2 });
        }
      },
      [],
    );
    return [dimensions, translate, containerRef] as const;
  };

  const [dimensions, translate, containerRef] = useCenteredTree({ x: 0, y: 0 });

  const userIsNotClass = !(
    Object.values($Enums.Class).includes(
      rootAbilities?.category as $Enums.Class,
    ) && userClass != (rootAbilities?.category as $Enums.Class)
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
      <div className="h-screen w-full" ref={containerRef}>
        <Tree
          data={rootAbilities || undefined}
          // This is the distance between nodes vertically
          depthFactor={250}
          dimensions={
            dimensions && "width" in dimensions && "height" in dimensions
              ? dimensions
              : undefined
          }
          translate={translate}
          orientation="vertical"
          pathFunc={"diagonal"}
          pathClassFunc={() => "linkClass"}
          draggable={true}
          zoomable={false}
          // The nodeSize prop is used to determine the spacing between nodes
          nodeSize={{ x: 475, y: 350 }}
          renderCustomNodeElement={(rd3tProps) => {
            const extendedProps = {
              ...rd3tProps,
              nodeDatum: {
                ...rd3tProps.nodeDatum,
                icon:
                  (rd3tProps.nodeDatum as unknown as ExtendedRawNodeDatum)
                    .icon || "",
              },
              handleNodeClick,
            };
            return AbilityNodes(userIsNotClass, userAbilities, extendedProps);
          }}
          collapsible={false}
        />
      </div>
    </>
  );
}
