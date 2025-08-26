import React from "react";
import { Outlet } from "react-router";
import Navber from "../Shared/Navber";
import Footer from "../Shared/Footer";

const Mainlayout = () => {
  return (
    <div className="bg-base-100 dark:bg-black text-black dark:text-white transition-colors duration-300">
      <section>
        <Navber></Navber>
      </section>
      <section>
        <Outlet></Outlet>
      </section>
      <section>
        <Footer></Footer>
      </section>
    </div>
  );
};

export default Mainlayout;
