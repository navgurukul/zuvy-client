"use client";
import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});
type Props = {};

export default function EditProfile({}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }
  return (
    <div className=' '>
      {/* <h1 className='font-semibold'>Update Your Profile</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col items-center justify-center space-y-8'
        >
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl className='flex flex-col items-center justify-center'>
                  <Input className='w-full' placeholder='shadcn' {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Submit</Button>
        </form>
      </Form> */}
    </div>
  );
}
