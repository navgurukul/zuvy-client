import React from "react";

const Heading = ({ title }: { title: string }) => {
  return (
    <div className="bg-accent-foreground p-5 text-start rounded-md">
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
  );
};

export default Heading;
