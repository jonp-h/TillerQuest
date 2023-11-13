import Image from "next/image";

export default function TeamImage() {
  return (
    <div className="bg-slate-800 w-full p-16 rounded-full">
      <div className="flex justify-center">
        <div className="flex flex-col gap-2 w-30">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{ width: "40%" }}
            ></div>
          </div>
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: "80%" }}
            ></div>
          </div>
          <Image
            className="pb-10 w-33"
            src="/logo/TQ.png"
            alt="Tiller Quest logo"
            width={80}
            height={80}
          />
        </div>
        <div className="flex flex-col gap-2 w-33">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{ width: "40%" }}
            ></div>
          </div>
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: "80%" }}
            ></div>
          </div>
          <Image
            className="pb-10 w-33"
            src="/logo/TQ.png"
            alt="Tiller Quest logo"
            width={80}
            height={80}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{ width: "40%" }}
            ></div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: "80%" }}
            ></div>
          </div>
          <Image
            className=""
            src="/logo/TQ.png"
            alt="Tiller Quest logo"
            width={200}
            height={120}
          />
        </div>

        <div className="flex flex-col gap-2 w-33">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{ width: "40%" }}
            ></div>
          </div>
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: "80%" }}
            ></div>
          </div>
          <Image
            className="pb-10 w-33"
            src="/logo/TQ.png"
            alt="Tiller Quest logo"
            width={80}
            height={80}
          />
        </div>

        <div className="flex flex-col gap-2 w-33">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-red-500 h-2.5 rounded-full"
              style={{ width: "40%" }}
            ></div>
          </div>
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: "80%" }}
            ></div>
          </div>
          <Image
            className="pb-10 w-33"
            src="/logo/TQ.png"
            alt="Tiller Quest logo"
            width={80}
            height={80}
          />
        </div>
      </div>
    </div>
  );
}
