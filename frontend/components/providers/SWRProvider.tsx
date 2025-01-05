"use client";
import axiosInstance from "@/lib/axios";
import { SWRConfig } from "swr";
import { ReactNode } from "react";

export const SWRProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SWRConfig
    //   value={{
    //     fetcher: (url) => axiosInstance.get(url).then((res) => res.data),
    //   }}
    >
      {children}
    </SWRConfig>
  );
};
