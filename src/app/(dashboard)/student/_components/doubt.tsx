import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

type DoubtProps = React.ComponentProps<typeof Card>;

function Doubt({ className, ...props }: DoubtProps) {
  return (
    <Card
      className={cn("w-[380px] text-start bg-secondary py-5", className)}
      {...props}
    >
      <CardContent className="px-4 py-0">
        <div className="flex items-center justify-between">
          <Image
            src={"/mentor.svg"}
            alt="logo"
            // className="py-2"
            width={"70"}
            height={"70"}
          />
          <div className="text-end">
            <p className="text-md font-semibold text-white mb-2">
              Schedule a 1:1 Mentor session
            </p>
            <Button variant="outline">Book</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default Doubt;
