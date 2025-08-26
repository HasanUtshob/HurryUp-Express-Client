import React from "react";
import Banner from "./Component/Banner";
import ServicesSection from "./Component/ServicesSection";
import WhyChooseUsSection from "./Component/WhyChooseUsSection";
import StatsSection from "./Component/StatsSection";

const Home = () => {
  return (
    <div className="min-h-screen">
      <section>
        <Banner />
      </section>
      <section>
        <ServicesSection />
      </section>
      <section>
        <WhyChooseUsSection />
      </section>
      <section>
        <StatsSection />
      </section>
    </div>
  );
};

export default Home;
