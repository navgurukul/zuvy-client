import React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Props = {};

function RadioCheckbox({}: Props) {
  let batches = true;
  return (
    <div className='flex items-center justify-between p-3 w-1/2'>
      {batches && (
        <div className=' flex  flex-col gap-y-3 items-start'>
          <h1 className='font-semibold'>Batches</h1>
          <div className='flex items-center space-x-2'>
            <Checkbox id='terms' />
            <label
              htmlFor='terms'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              AFE Batch 1
            </label>
            <Checkbox id='terms' />
            <label
              htmlFor='terms'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              AFE Batch 2
            </label>
          </div>
        </div>
      )}
      <div className='flex  flex-col gap-y-3 items-start'>
        <h1 className='font-semibold'>Time Period</h1>
        <div className='flex items-center space-x-2'>
          <RadioGroup className='flex items-center ' defaultValue='comfortable'>
            <div className='flex  space-x-2'>
              <RadioGroupItem value='default' id='r1' />
              <Label htmlFor='r1'>All Time</Label>
            </div>
            <div className='flex  space-x-2'>
              <RadioGroupItem value='comfortable' id='r2' />
              <Label htmlFor='r2'>1 Week</Label>
            </div>
            <div className='flex  space-x-2'>
              <RadioGroupItem value='compact' id='r3' />
              <Label htmlFor='r3'>2 Weeks</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

export default RadioCheckbox;
