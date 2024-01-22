import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

type DoubtProps = React.ComponentProps<typeof Card>;

function Doubt({ className, ...props }: DoubtProps) {
  return (
    <Card
      className={cn("lg:w-[380px] text-start bg-secondary py-5", className)}
      {...props}
    >
      <CardContent className="px-4 py-0">
        <div className="flex items-center justify-between mb-3">
          <Image
            src={"/mentor.svg"}
            alt="logo"
            className="py-2"
            width={80}
            height={80}
          />
          <div className="text-end">
            <p className="text-md font-bold text-white">
              Schedule a 1:1 Mentor session
            </p>
            <p className="text-sm text-muted ">
              100+ students have already taken guidance
            </p>
          </div>
        </div>
        <Button variant="outline" className="w-full font-semibold">
          Book
        </Button>
      </CardContent>
    </Card>
  );
}

export default Doubt;
