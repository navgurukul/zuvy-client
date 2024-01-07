import React from "react";

function Heading() {
  return (
    <div className="flex align-center justify-between text-start my-2">
      <h1 className="text-3xl font-semibold tracking-tight m-0">
        Welcome back, <span className="text-muted-foreground"> Souvik!</span>
      </h1>
      <div className="text-sm font-medium tracking-tight text-end">
        <p className="m-0">
          Batch: <span className="text-muted-foreground">Alpha</span>
        </p>
        <p className="m-0">
          Course:{" "}
          <span className="text-muted-foreground ">
            {" "}
            Amazon Coding Bootcamp{" "}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Heading;
