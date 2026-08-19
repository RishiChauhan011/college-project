import React from 'react';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';

const About = () => {
  return (
    <div className="bg-surface text-on-surface font-body-md antialiased pt-20 lg:pl-64 min-h-screen">
      <Navbar />
      <SideNavBar />
      <main className="max-w-[container-max] mx-auto p-margin-mobile md:p-gutter flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <span className="material-symbols-outlined text-6xl text-secondary mb-4" data-icon="construction">construction</span>
        <h1 className="text-headline-lg font-headline-lg text-secondary text-center">
          This page will be available in the future.
        </h1>
      </main>
    </div>
  );
};

export default About;
