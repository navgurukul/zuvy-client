"use client";
// components/TwoOptionsModal.tsx

import React, { useState } from "react";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Dropzone from "./dropzone";
interface TwoOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

const AddStudentsModal: React.FC<TwoOptionsModalProps> = ({
  isOpen,
  onClose,
  id,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    "Bulk Upload"
  );
  const [input1Value, setInput1Value] = useState("");
  const [input2Value, setInput2Value] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    // Reset values when switching options
    setInput1Value("");
    setInput2Value("");
    setFile(null);
  };

  const handleInput1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput1Value(e.target.value);
  };

  const handleInput2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput2Value(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile);
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "inline" : "hidden"
      } overflow-y-auto p-4`}
    >
      <div className='flex items-center justify-center min-h-screen '>
        <div className='bg-white p-7 rounded-lg shadow-lg w-[500px]  '>
          <div className='flex justify-between'>
            <h1 className='text-xl font-semibold mb-4'>Add Students</h1>
            <button onClick={onClose}>
              <X size={20} className='text-gray-400' />
            </button>
          </div>
          <div className='flex items-center justify-start  '>
            <label className='block mb-2'>
              <input
                type='radio'
                name='options'
                checked={selectedOption === "Bulk Upload"}
                onChange={() => handleOptionClick("Bulk Upload")}
                className='mx-2'
              />
              Bulk Upload
            </label>
            <label className='block mb-2'>
              <input
                type='radio'
                name='options'
                checked={selectedOption === "One at a time"}
                onChange={() => handleOptionClick("One at a time")}
                className='mx-2'
              />
              One at a time
            </label>
          </div>
          {selectedOption === "One at a time" && (
            <div className=''>
              <h1 className=' my-4 flex flex-start'>Student Name</h1>
              <input
                type='text'
                placeholder='Student Name'
                value={input1Value}
                onChange={handleInput1Change}
                className='block w-full mb-2 p-2 border border-gray-300 rounded'
              />
              <h1 className='my-4 flex flex-start'>Email</h1>

              <input
                type='text'
                placeholder='Student Email'
                value={input2Value}
                onChange={handleInput2Change}
                className='block w-full mb-4 p-2 border border-gray-300 rounded'
              />
              <div className='w-full flex flex-row justify-end m-3 p-3 '>
                <Button className=''>Add Students</Button>
              </div>
            </div>
          )}
          {selectedOption === "Bulk Upload" && (
            <>
              <Dropzone
                id={id}
                className='px-5 py-2 mt-10 border-dashed border-2 rounded-[10px]'
              />

              {/* <div className='fixed inset-0 bg-gray-700 opacity-25 z-50'></div> */}
              {/* <div className='flex flex-col items-start  w-full gap-y-5 border border-gray-300 p-3 rounded-lg '>
                <h2 className='flex-start font-semibold '>Student List.csv</h2>
                <div className='w-full flex items-center justify-between '>
                  <Progress value={30} className='h-2 w-[350px]' />
                  <span>100%</span>
                </div>
                <div className='w-full flex gap-y-5 flex-col items-start'>
                  <h3 className='flex-start'>Upload Status</h3>
                  <li className='text-green-500  '>
                    <span className='text-black'>50 records uploaded</span>
                  </li>
                  <li className='text-red-500'>
                    <span className='text-black'>
                      20 records failed to upload
                    </span>
                  </li>{" "}
                </div>
              </div> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudentsModal;
