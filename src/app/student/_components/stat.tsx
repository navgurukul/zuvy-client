"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, ChevronUp, Crown, MoveRight } from "lucide-react";
// import { Switch } from "@/components/ui/switch"

const notifications = [
  {
    title: "Your call has been confirmed.",
    description: "1 hour ago",
  },
  {
    title: "You have a new message!",
    description: "1 hour ago",
  },
  {
    title: "Your subscription is expiring soon!",
    description: "2 hours ago",
  },
];

type CardProps = React.ComponentProps<typeof Card>;

export function Stat({ className, ...props }: CardProps) {
  return (
    <Card
      className={cn(
        "h-full lg:w-[380px] text-start bg-popover-foreground text-white",
        className
      )}
      {...props}
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Leaderboard
          <ChevronRight />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-8 grid justify-items-center grid-cols-3 gap-4">
          <div className="text-center mt-7 grid justify-items-center content-start">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>Souvik Deb</AvatarFallback>
            </Avatar>
            <p className="text-md font-bold mt-2">Ankur</p>
            <p className="text-4xl font-bold text-white">2</p>
          </div>
          <div className=" text-center grid justify-items-center content-start relative">
            <Crown
              color="gold"
              className="absolute -top-6 left-5 -rotate-12 "
            />
            <Avatar className="w-16 h-16">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>Souvik Deb</AvatarFallback>
            </Avatar>
            <p className="text-md font-bold mt-2">Priyomjeet</p>
            <p className="text-8xl font-bold text-white">1</p>
          </div>
          <div className="text-center mt-7 grid justify-items-center content-start">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>Souvik Deb</AvatarFallback>
            </Avatar>
            <p className="text-md font-bold mt-2">Dixit</p>
            <p className="text-4xl font-bold text-white">3</p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex justify-between items-center py-2 px-2 pr-4 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
            role="alert"
            aria-label="Whatsapp us"
          >
            <button>
              <span className="text-xs font-bold bg-secondary rounded-full text-white px-4 py-1.5 mr-3">
                22
              </span>
            </button>
            <span className="text-sm font-medium  mr-2">Your rank</span>
            <ChevronUp color="#518672" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
