import React, { use } from "react";
import { AuthContext } from "../Context/AuthContext";

const useAuth = () => {
  return use(AuthContext);
};

export default useAuth;
