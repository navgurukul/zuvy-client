"use client";
import React, { useState } from 'react';
import Sidebar from "./_components/sidebar/sidebar";
import MainContent from './_components/main/main';

const Home: React.FC = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('Home');

  const handleMenuItemClick = (menuItem: string) => {
    setSelectedMenuItem(menuItem);
  };

  return (
    <div className="admin-container">
      <Sidebar onMenuItemClick={handleMenuItemClick} selectedMenuItem={selectedMenuItem} />
      <MainContent selectedMenuItem={selectedMenuItem} />
    </div>
  );
};

export default Home;

