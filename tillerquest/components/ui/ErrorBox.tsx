import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface FormErrorProps {
  message?: string;
}

const ErrorBox = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <div className=" bg-red-800 w-full p-3 rounded-xl flex items-center justify-center gap-x-2 text-md text-red-200">
      <FontAwesomeIcon icon={faTriangleExclamation} className="text-xl" />
      <p>{message}</p>
    </div>
  );
};

export default ErrorBox;
