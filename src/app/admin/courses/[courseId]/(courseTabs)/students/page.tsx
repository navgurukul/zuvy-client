"use client";
import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import AddStudentsModal from "../../_components/addStudentsmodal";
import { Dialog, DialogOverlay, DialogTrigger } from "@/components/ui/dialog";
import api from "@/utils/axios.config";
import StudentsDataTable from "../../_components/dataTable";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { studentColumns } from "../../_components/studentColumns";
import {
  getBatchData,
  getCourseData,
  getStoreStudentData,
} from "@/store/store";
import useDebounce from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROWS_PER_PAGE } from "@/utils/constant";
import { DataTable } from "@/app/_components/datatable/data-table";
import { columns } from "@/app/_components/datatable/columns";
type Props = {
  id: string;
};
export type StudentData = {
  email: string;
  name: string;
  userId: string;
  bootcampId: number;
  batchName: string;
  batchId: number;
  progress: number;
  profilePicture: string;
};

type bootcampData = {
  value: string;
  label: string;
};

const Page = () => {
  const [position, setPosition] = useState("10");
  const { studentsData, setStoreStudentData } = getStoreStudentData();
  // const [bootcampData, setBootcampData] = useState<bootcampData>();
  const [pages, setPages] = useState<number>();
  const [offset, setOffset] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [students, setStudents] = useState<number>(0);
  const [search, setSearch] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchdata, setSearchData] = useState([]);
  const debouncedSearch = useDebounce(search, 1000);
  const [lastPage, setLastPage] = useState<number>(0);
  const { courseData } = getCourseData();
  const { fetchBatches, batchData } = getBatchData();

  const fetchStudentData = useCallback(
    async (offset: number) => {
      if (courseData?.id) {
        try {
          const response = await api.get(
            `/bootcamp/students/${courseData?.id}?limit=${position}&offset=${offset}`
          );
          setStoreStudentData(response.data.studentsEmails);
          setPages(response.data.totalPages);
          setLastPage(response.data.totalPages);
          setStudents(response.data.totalStudents);
        } catch (error) {
          console.error("Error fetching student data:", error);
        }
      }
    },
    [courseData, position, setStoreStudentData]
  );
  useEffect(() => {
    fetchStudentData(offset);
  }, [offset, position, courseData, fetchStudentData]);
  const lastPageOffset = () => {
    const totalPages = Math.ceil(students / +position);
    const lastPageOffset = (totalPages - 1) * +position;
    return lastPageOffset;
  };
  const lastPageHandler = () => {
    setCurrentPage(lastPage);
    fetchStudentData(lastPageOffset());
    setOffset(lastPageOffset());
  };
  const firstPagehandler = () => {
    setCurrentPage(1);
    fetchStudentData(0);
    setOffset(0);
  };
  const nextPageHandler = () => {
    console.log("Next");
    setCurrentPage((prevState) => prevState + 1);
    setOffset((prevState) => +position + prevState);
  };
  const prevPageHandler = () => {
    console.log("Prev");
    setCurrentPage((prevState) => prevState - 1);
    setOffset((prevState) => Math.max(0, prevState - +position));
  };
  const previousDisabledHandler = () => {
    if (currentPage === 1) {
      return true;
    } else {
      return false;
    }
  };
  const nextDisabledHandler = () => {
    if (currentPage === pages) {
      return true;
    } else {
      return false;
    }
  };
  useEffect(() => {
    //Search The Api
    const searchStudentsDataHandler = async () => {
      setLoading(true);
      await api
        .get(
          `/bootcamp/studentSearch/${courseData?.id}?searchTerm=${debouncedSearch}`
        )
        .then((res) => {
          setStoreStudentData(res.data.data[1].studentsEmails);
          setLoading(false);
        });
    };
    if (debouncedSearch) searchStudentsDataHandler();
    if (debouncedSearch?.trim()?.length === 0) fetchStudentData(0);
  }, [debouncedSearch, courseData, setStoreStudentData, fetchStudentData]);

  const handleSetsearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  return (
    <div>
      {studentsData.length > 0 && (
        <div className='py-2 my-2 flex items-center justify-between w-full'>
          <Input
            type='search'
            placeholder='search'
            className='w-1/3'
            onChange={handleSetsearch}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button className='w-1/6 gap-x-2 '>
                <Plus /> Add Students
              </Button>
            </DialogTrigger>
            <DialogOverlay />
            <AddStudentsModal message={false} id={courseData?.id || ""} />
          </Dialog>
        </div>
      )}
      {studentsData.length > 0 && batchData && (
        <>
          <DataTable data={studentsData} columns={columns} />
          <div className='flex items-center justify-end px-2 gap-x-2'>
            <p className='text-sm font-medium'>Rows Per Page</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline'>
                  {position} <ChevronDown className='ml-2' size={15} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-full'>
                <DropdownMenuLabel>Rows</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={position}
                  onValueChange={setPosition}
                >
                  {ROWS_PER_PAGE.map((rows) => {
                    return (
                      <DropdownMenuRadioItem key={rows} value={rows}>
                        {rows}
                      </DropdownMenuRadioItem>
                    );
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className='flex items-center space-x-6 lg:space-x-8'>
              <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
                Page {currentPage} of {pages}
              </div>
              <div className='flex items-center space-x-2'>
                <Button
                  variant='outline'
                  className='hidden h-8 w-8 p-0 lg:flex'
                  onClick={firstPagehandler}
                  disabled={previousDisabledHandler()}
                >
                  <span className='sr-only'>Go to first page</span>
                  <ArrowLeft className='h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  className='h-8 w-8 p-0'
                  onClick={prevPageHandler}
                  disabled={previousDisabledHandler()}
                >
                  <span className='sr-only'>Go to previous page</span>
                  <ArrowLeft className='h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  className='h-8 w-8 p-0'
                  onClick={nextPageHandler}
                  disabled={nextDisabledHandler()}
                >
                  <span className='sr-only'>Go to next page</span>
                  <ArrowRight className='h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  className='hidden h-8 w-8 p-0 lg:flex'
                  onClick={lastPageHandler}
                  disabled={nextDisabledHandler()}
                >
                  <span className='sr-only'>Go to last page</span>
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      {studentsData.length <= 0 && (
        <div className='flex  flex-col items-center justify-center py-12'>
          <div>
            <svg
              width='164'
              height='180'
              viewBox='0 0 164 180'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <g clipPath='url(#clip0_20269_10897)'>
                <path
                  d='M113.87 36.5181C102.505 34.7044 89.5632 33.7366 76.085 33.7366C63.7501 33.7366 51.8662 34.5459 41.2305 36.072C41.233 35.9086 41.2353 35.7453 41.2426 35.582C41.5246 26.1016 45.5037 17.1075 52.3294 10.5222C59.1551 3.93681 68.286 0.28258 77.7704 0.340522C87.2548 0.398465 96.3403 4.16398 103.085 10.8322C109.83 17.5005 113.699 26.5425 113.865 36.0256C113.867 36.1914 113.87 36.3547 113.87 36.5181Z'
                  fill='#518672'
                />
                <g opacity='0.1'>
                  <path
                    d='M82.312 0.326978C77.2676 -0.35438 72.1363 0.0317942 67.2507 1.46047C62.3651 2.88915 57.8342 5.32844 53.9517 8.62027C50.0691 11.9121 46.9216 15.983 44.713 20.5691C42.5045 25.1552 41.2842 30.1542 41.1313 35.2422C41.1239 35.4055 41.1215 35.5688 41.1191 35.7321C44.2789 35.2788 47.551 34.8903 50.9103 34.5659C51.3211 26.0896 54.6865 18.0247 60.4224 11.7705C66.1584 5.51636 73.9028 1.46766 82.312 0.326978Z'
                    fill='white'
                  />
                </g>
                <path
                  d='M129.758 39.3995C124.527 37.9813 119.221 36.8549 113.864 36.0257C105.085 34.6652 96.2341 33.8146 87.3564 33.4782C83.6582 33.3271 79.892 33.2491 76.0843 33.2491C73.0664 33.2491 70.0728 33.2978 67.1208 33.3953C58.461 33.6512 49.8218 34.3812 41.2419 35.582C34.8906 36.4565 28.6009 37.7316 22.4105 39.3995C7.97672 43.39 0.0273438 48.7384 0.0273438 54.4573C0.0273438 60.1762 7.97672 65.5245 22.4105 69.5151C32.5612 72.3233 45.0764 74.237 58.7131 75.1145C64.3418 75.4802 70.1607 75.6655 76.0843 75.6655C82.0274 75.6655 87.8658 75.4778 93.5116 75.1121C105.922 74.3101 117.404 72.65 127.013 70.2367C127.064 70.222 127.113 70.2098 127.164 70.1976C127.813 70.0368 128.451 69.8686 129.083 69.7004C129.309 69.637 129.534 69.576 129.758 69.5151C129.771 69.5099 129.784 69.5058 129.797 69.5029C130.012 69.4444 130.224 69.3834 130.436 69.3249C130.86 69.2031 131.279 69.0836 131.691 68.9593C131.711 68.9544 131.728 68.9495 131.745 68.9447C132.103 68.8374 132.454 68.7301 132.803 68.6229C133.088 68.5327 133.371 68.4449 133.651 68.3547C133.856 68.2889 134.058 68.2231 134.258 68.1573C134.404 68.1085 134.548 68.0622 134.69 68.0135C134.882 67.9501 135.075 67.8842 135.265 67.8184C135.345 67.7916 135.426 67.7648 135.504 67.7355C135.687 67.6746 135.865 67.6112 136.043 67.5478C136.235 67.4796 136.428 67.4089 136.618 67.3406C136.776 67.2846 136.935 67.2261 137.091 67.1676C137.222 67.1164 137.352 67.0676 137.483 67.0189C137.842 66.8848 138.193 66.7458 138.539 66.6093C138.712 66.5386 138.885 66.4704 139.056 66.3997C139.224 66.3314 139.394 66.2607 139.56 66.19C139.833 66.0754 140.101 65.9609 140.365 65.8463C140.491 65.7878 140.621 65.7317 140.745 65.6781C140.84 65.6342 140.933 65.5928 141.028 65.5489C141.096 65.5197 141.164 65.488 141.23 65.4563C141.476 65.3442 141.72 65.2296 141.959 65.115C142.876 64.6762 143.731 64.2277 144.526 63.7694C149.511 60.9148 152.141 57.7482 152.141 54.4573C152.141 48.7384 144.192 43.39 129.758 39.3995ZM129.626 69.047C119.464 71.8577 106.914 73.7714 93.241 74.6416C87.6805 74.9951 81.9325 75.1779 76.0843 75.1779C70.2557 75.1779 64.527 74.9975 58.9837 74.6441C45.2885 73.7762 32.7196 71.8626 22.5421 69.047C8.33751 65.1174 0.514888 59.9373 0.514888 54.4573C0.515682 53.9731 0.57629 53.4908 0.695337 53.0215C1.93848 48.0778 9.58564 43.451 22.5421 39.8675C28.6858 38.2126 34.9273 36.9449 41.2297 36.072C49.8613 34.8644 58.5527 34.1319 67.2646 33.878C70.1704 33.7829 73.1104 33.7358 76.0843 33.7366C79.8409 33.7366 83.5559 33.8122 87.2076 33.9585C96.137 34.2919 105.039 35.1465 113.869 36.5181C119.179 37.3437 124.44 38.4618 129.626 39.8675C142.581 43.451 150.225 48.0753 151.471 53.0166C151.592 53.4873 151.653 53.9713 151.654 54.4573C151.654 59.9373 143.831 65.1174 129.626 69.047Z'
                  fill='#2F433A'
                />
                <path
                  d='M152.001 54.6791C152.001 57.9359 149.317 61.0172 144.525 63.7694C143.728 64.2277 142.87 64.6762 141.958 65.115C141.719 65.2296 141.475 65.3441 141.229 65.4563C141.163 65.488 141.095 65.5196 141.027 65.5489C140.932 65.5928 140.839 65.6342 140.744 65.6781C140.62 65.7317 140.49 65.7878 140.364 65.8463C140.1 65.9609 139.832 66.0754 139.559 66.19C139.393 66.2607 139.223 66.3314 139.055 66.3997C138.884 66.4703 138.711 66.5386 138.538 66.6093C138.192 66.7458 137.841 66.8848 137.482 67.0188C137.351 67.0676 137.221 67.1163 137.09 67.1675C136.934 67.226 136.775 67.2845 136.617 67.3406C136.427 67.4089 136.234 67.4796 136.042 67.5478C135.864 67.6112 135.686 67.6746 135.503 67.7355C135.425 67.7648 135.344 67.7916 135.264 67.8184C135.074 67.8842 134.881 67.95 134.689 68.0134C134.547 68.0622 134.403 68.1085 134.257 68.1572C134.057 68.2231 133.855 68.2889 133.65 68.3547C133.37 68.4449 133.087 68.5327 132.802 68.6229C132.453 68.7301 132.102 68.8374 131.744 68.9446C131.727 68.9495 131.71 68.9544 131.69 68.9593C131.278 69.0836 130.859 69.203 130.435 69.3249C130.223 69.3834 130.011 69.4444 129.796 69.5029C129.783 69.5058 129.77 69.5099 129.757 69.5151C129.533 69.576 129.309 69.6369 129.082 69.7003C128.453 69.8661 127.812 70.0343 127.163 70.1976C127.112 70.2098 127.063 70.222 127.012 70.2366C117.664 72.572 106.194 74.2735 93.5009 75.095C87.9404 75.4534 82.1435 75.6435 76.1882 75.6435C70.1792 75.6435 64.3334 75.4509 58.7292 75.0853C25.2738 72.9035 0.375 64.5957 0.375 54.6791C0.377634 54.0757 0.46961 53.476 0.647935 52.8995C0.662575 52.941 0.677214 52.98 0.694356 53.0214C4.17287 62.158 28.8598 69.5419 60.8915 71.3434C65.7986 71.6212 70.8813 71.7651 76.0833 71.7651C81.3074 71.7651 86.4095 71.6188 91.3361 71.3409C123.341 69.5321 148.004 62.1458 151.47 53.0165C151.528 52.8703 151.58 52.724 151.623 52.5778C151.871 53.2509 151.998 53.962 152.001 54.6791Z'
                  fill='#2F433A'
                />
                <path
                  d='M22.3747 52.0551C18.3177 52.0551 14.0059 51.1823 14.0059 49.5645C14.0059 47.9468 18.3177 47.074 22.3747 47.074C26.4318 47.074 30.7436 47.9468 30.7436 49.5645C30.7436 51.1823 26.4318 52.0551 22.3747 52.0551ZM22.3747 47.5615C17.7301 47.5615 14.4934 48.6172 14.4934 49.5645C14.4934 50.5119 17.7301 51.5676 22.3747 51.5676C27.0193 51.5676 30.2561 50.5119 30.2561 49.5645C30.2561 48.6172 27.0193 47.5615 22.3747 47.5615Z'
                  fill='#2F433A'
                />
                <path
                  d='M39.6813 63.5124C35.6243 63.5124 31.3125 62.6396 31.3125 61.0218C31.3125 59.4041 35.6243 58.5312 39.6813 58.5312C43.7384 58.5312 48.0502 59.4041 48.0502 61.0218C48.0502 62.6396 43.7384 63.5124 39.6813 63.5124ZM39.6813 59.0188C35.0368 59.0188 31.8 60.0745 31.8 61.0218C31.8 61.9692 35.0368 63.0248 39.6813 63.0248C44.3259 63.0248 47.5627 61.9692 47.5627 61.0218C47.5627 60.0745 44.3259 59.0188 39.6813 59.0188Z'
                  fill='#2F433A'
                />
                <path
                  d='M129.634 52.0551C125.577 52.0551 121.266 51.1823 121.266 49.5645C121.266 47.9468 125.577 47.074 129.634 47.074C133.692 47.074 138.003 47.9468 138.003 49.5645C138.003 51.1823 133.692 52.0551 129.634 52.0551ZM129.634 47.5615C124.99 47.5615 121.753 48.6172 121.753 49.5645C121.753 50.5119 124.99 51.5676 129.634 51.5676C134.279 51.5676 137.516 50.5119 137.516 49.5645C137.516 48.6172 134.279 47.5615 129.634 47.5615Z'
                  fill='#2F433A'
                />
                <path
                  d='M112.326 63.5124C108.269 63.5124 103.957 62.6396 103.957 61.0218C103.957 59.4041 108.269 58.5312 112.326 58.5312C116.383 58.5312 120.695 59.4041 120.695 61.0218C120.695 62.6396 116.383 63.5124 112.326 63.5124ZM112.326 59.0188C107.681 59.0188 104.445 60.0745 104.445 61.0218C104.445 61.9692 107.681 63.0248 112.326 63.0248C116.97 63.0248 120.207 61.9692 120.207 61.0218C120.207 60.0745 116.97 59.0188 112.326 59.0188Z'
                  fill='#2F433A'
                />
                <path
                  d='M76.0036 68.8754C71.9466 68.8754 67.6348 68.0026 67.6348 66.3849C67.6348 64.7671 71.9466 63.8943 76.0036 63.8943C80.0607 63.8943 84.3725 64.7671 84.3725 66.3849C84.3725 68.0026 80.0607 68.8754 76.0036 68.8754ZM76.0036 64.3818C71.359 64.3818 68.1223 65.4375 68.1223 66.3849C68.1223 67.3322 71.359 68.3879 76.0036 68.3879C80.6482 68.3879 83.885 67.3322 83.885 66.3849C83.885 65.4375 80.6482 64.3818 76.0036 64.3818Z'
                  fill='#2F433A'
                />
                <path
                  d='M82.1731 120.111C87.8293 120.111 92.4145 115.525 92.4145 109.869C92.4145 104.213 87.8293 99.6278 82.1731 99.6278C76.5169 99.6278 71.9316 104.213 71.9316 109.869C71.9316 115.525 76.5169 120.111 82.1731 120.111Z'
                  fill='#2F433A'
                />
                <path
                  d='M78.2774 116.598L73.293 119.094L74.6861 121.876L79.6705 119.38L78.2774 116.598Z'
                  fill='#2F433A'
                />
                <path
                  d='M75.3449 121.594C75.6405 121.145 74.911 120.143 73.7155 119.355C72.52 118.566 71.3113 118.291 71.0157 118.739C70.7201 119.187 71.4496 120.19 72.6451 120.978C73.8405 121.766 75.0493 122.042 75.3449 121.594Z'
                  fill='#2F433A'
                />
                <path
                  d='M86.069 116.598L84.6758 119.38L89.6602 121.876L91.0534 119.094L86.069 116.598Z'
                  fill='#2F433A'
                />
                <path
                  d='M91.7018 120.978C92.8973 120.19 93.6268 119.188 93.3312 118.739C93.0356 118.291 91.8269 118.567 90.6314 119.355C89.4359 120.143 88.7064 121.145 89.002 121.594C89.2976 122.042 90.5063 121.766 91.7018 120.978Z'
                  fill='#2F433A'
                />
                <path
                  d='M81.4553 110.864C83.3884 110.864 84.9556 109.297 84.9556 107.364C84.9556 105.431 83.3884 103.864 81.4553 103.864C79.5222 103.864 77.9551 105.431 77.9551 107.364C77.9551 109.297 79.5222 110.864 81.4553 110.864Z'
                  fill='white'
                />
                <path
                  d='M82.3084 106.693C82.7621 106.239 82.7595 105.501 82.3026 105.044C81.8456 104.587 81.1073 104.585 80.6536 105.038C80.1999 105.492 80.2025 106.23 80.6594 106.687C81.1164 107.144 81.8546 107.147 82.3084 106.693Z'
                  fill='#2F433A'
                />
                <path
                  d='M90.2509 98.7276C90.4049 94.9361 87.1372 91.7246 82.9522 91.5546C78.7672 91.3846 75.2497 94.3205 75.0957 98.112C74.9417 101.904 77.8508 102.765 82.0358 102.935C86.2208 103.105 90.0969 102.519 90.2509 98.7276Z'
                  fill='#518672'
                />
                <path
                  d='M96.1564 115.232C96.83 114.654 95.8828 112.445 94.0406 110.299C92.1985 108.154 90.159 106.883 89.4854 107.461C88.8117 108.039 89.759 110.248 91.6011 112.394C93.4433 114.54 95.4827 115.81 96.1564 115.232Z'
                  fill='#2F433A'
                />
                <path
                  d='M72.775 112.394C74.6171 110.248 75.5644 108.039 74.8907 107.461C74.2171 106.883 72.1776 108.154 70.3355 110.299C68.4934 112.445 67.5461 114.654 68.2197 115.232C68.8934 115.81 70.9328 114.539 72.775 112.394Z'
                  fill='#2F433A'
                />
                <path
                  d='M84.9852 113.905C85.0961 114.514 84.9605 115.142 84.6083 115.651C84.2562 116.16 83.7163 116.508 83.1074 116.619C82.4985 116.73 81.8705 116.594 81.3616 116.242C80.8527 115.89 80.5045 115.35 80.3937 114.741L80.3929 114.737C80.1633 113.468 81.1438 113.02 82.4119 112.79C83.6801 112.56 84.7557 112.637 84.9852 113.905Z'
                  fill='white'
                />
                <path
                  d='M64.8704 120.763C64.7411 120.763 64.617 120.712 64.5256 120.62C64.4342 120.529 64.3828 120.405 64.3828 120.276V91.5106C64.3828 91.3813 64.4342 91.2573 64.5256 91.1659C64.617 91.0744 64.7411 91.0231 64.8704 91.0231C64.9997 91.0231 65.1237 91.0744 65.2151 91.1659C65.3065 91.2573 65.3579 91.3813 65.3579 91.5106V120.276C65.3579 120.405 65.3065 120.529 65.2151 120.62C65.1237 120.712 64.9997 120.763 64.8704 120.763Z'
                  fill='#CCCCCC'
                />
                <path
                  d='M57.5579 146.603C57.4286 146.603 57.3045 146.552 57.2131 146.46C57.1217 146.369 57.0703 146.245 57.0703 146.116V125.151C57.0703 125.022 57.1217 124.898 57.2131 124.806C57.3045 124.715 57.4286 124.664 57.5579 124.664C57.6872 124.664 57.8112 124.715 57.9026 124.806C57.994 124.898 58.0454 125.022 58.0454 125.151V146.116C58.0454 146.245 57.994 146.369 57.9026 146.46C57.8112 146.552 57.6872 146.603 57.5579 146.603Z'
                  fill='#CCCCCC'
                />
                <path
                  d='M76.3274 129.295C76.1981 129.295 76.0741 129.244 75.9826 129.153C75.8912 129.061 75.8399 128.937 75.8398 128.808V100.043C75.8398 99.9134 75.8912 99.7894 75.9826 99.698C76.0741 99.6065 76.1981 99.5552 76.3274 99.5552C76.4567 99.5552 76.5807 99.6065 76.6721 99.698C76.7636 99.7894 76.8149 99.9134 76.8149 100.043V128.808C76.8149 128.937 76.7636 129.061 76.6721 129.153C76.5807 129.244 76.4567 129.295 76.3274 129.295Z'
                  fill='#CCCCCC'
                />
                <path
                  d='M69.259 150.016C69.1297 150.016 69.0057 149.965 68.9143 149.873C68.8229 149.782 68.7715 149.658 68.7715 149.528V137.827C68.7715 137.698 68.8228 137.574 68.9143 137.483C69.0057 137.391 69.1297 137.34 69.259 137.34C69.3883 137.34 69.5123 137.391 69.6038 137.483C69.6952 137.574 69.7466 137.698 69.7466 137.827V149.528C69.7466 149.658 69.6952 149.782 69.6038 149.873C69.5123 149.965 69.3883 150.016 69.259 150.016Z'
                  fill='#CCCCCC'
                />
                <path
                  d='M79.2532 90.048C79.1239 90.048 78.9999 89.9967 78.9084 89.9052C78.817 89.8138 78.7656 89.6898 78.7656 89.5605V77.8594C78.7656 77.7301 78.817 77.6061 78.9084 77.5147C78.9998 77.4233 79.1239 77.3719 79.2532 77.3719C79.3825 77.3719 79.5065 77.4233 79.5979 77.5147C79.6893 77.6061 79.7407 77.7301 79.7407 77.8594V89.5605C79.7407 89.6898 79.6893 89.8138 79.5979 89.9052C79.5065 89.9967 79.3825 90.048 79.2532 90.048Z'
                  fill='#CCCCCC'
                />
                <path
                  d='M54.8762 95.1672C54.7469 95.1672 54.6229 95.1159 54.5315 95.0244C54.44 94.933 54.3887 94.809 54.3887 94.6797V82.9786C54.3887 82.8493 54.44 82.7253 54.5315 82.6339C54.6229 82.5425 54.7469 82.4911 54.8762 82.4911C55.0055 82.4911 55.1295 82.5425 55.221 82.6339C55.3124 82.7253 55.3638 82.8493 55.3638 82.9786V94.6797C55.3638 94.809 55.3124 94.933 55.221 95.0244C55.1295 95.1159 55.0055 95.1672 54.8762 95.1672Z'
                  fill='#CCCCCC'
                />
                <path
                  d='M97.2922 96.3861C97.1629 96.3861 97.0389 96.3347 96.9475 96.2433C96.8561 96.1519 96.8047 96.0279 96.8047 95.8986V84.1975C96.8047 84.0682 96.856 83.9442 96.9475 83.8528C97.0389 83.7613 97.1629 83.71 97.2922 83.71C97.4215 83.71 97.5455 83.7613 97.637 83.8528C97.7284 83.9442 97.7798 84.0682 97.7798 84.1975V95.8986C97.7798 96.0279 97.7284 96.1519 97.637 96.2433C97.5455 96.3347 97.4215 96.3861 97.2922 96.3861Z'
                  fill='#CCCCCC'
                />
                <path
                  d='M96.3176 132.952C96.1883 132.952 96.0643 132.901 95.9729 132.809C95.8815 132.718 95.8301 132.594 95.8301 132.464V118.326C95.8301 118.196 95.8814 118.072 95.9729 117.981C96.0643 117.889 96.1883 117.838 96.3176 117.838C96.4469 117.838 96.5709 117.889 96.6624 117.981C96.7538 118.072 96.8052 118.196 96.8052 118.326V132.464C96.8052 132.594 96.7538 132.718 96.6624 132.809C96.5709 132.901 96.4469 132.952 96.3176 132.952Z'
                  fill='#CCCCCC'
                />
                <path
                  d='M86.5657 145.384C86.4364 145.384 86.3124 145.333 86.2209 145.242C86.1295 145.15 86.0781 145.026 86.0781 144.897V123.932C86.0781 123.803 86.1295 123.679 86.2209 123.588C86.3123 123.496 86.4364 123.445 86.5657 123.445C86.695 123.445 86.819 123.496 86.9104 123.588C87.0018 123.679 87.0532 123.803 87.0532 123.932V144.897C87.0532 145.026 87.0018 145.15 86.9104 145.242C86.819 145.333 86.695 145.384 86.5657 145.384Z'
                  fill='#CCCCCC'
                />
                <path
                  d='M88.5168 109.55C88.3875 109.55 88.2635 109.498 88.1721 109.407C88.0807 109.316 88.0293 109.192 88.0293 109.062V80.2971C88.0293 80.1678 88.0807 80.0438 88.1721 79.9524C88.2635 79.8609 88.3875 79.8096 88.5168 79.8096C88.6461 79.8096 88.7701 79.8609 88.8616 79.9524C88.953 80.0438 89.0044 80.1678 89.0044 80.2971V109.062C89.0044 109.192 88.953 109.316 88.8616 109.407C88.7701 109.498 88.6461 109.55 88.5168 109.55Z'
                  fill='#CCCCCC'
                />
                <path
                  d='M148.288 170.76C148.986 170.176 148.043 167.9 146.182 165.678C144.321 163.455 142.246 162.126 141.549 162.711C140.851 163.295 141.794 165.571 143.655 167.793C145.516 170.016 147.591 171.345 148.288 170.76Z'
                  fill='#2F433A'
                />
                <path
                  d='M143.712 168.233C145.546 162.732 142.573 156.786 137.072 154.953C131.572 153.119 125.626 156.092 123.793 161.593C121.959 167.093 124.932 173.039 130.433 174.872C135.933 176.706 141.879 173.733 143.712 168.233Z'
                  fill='#2F433A'
                />
                <path
                  d='M138.195 173.152H135.006V178.866H138.195V173.152Z'
                  fill='#2F433A'
                />
                <path
                  d='M131.816 173.152H128.627V178.866H131.816V173.152Z'
                  fill='#2F433A'
                />
                <path
                  d='M135.537 179.93C137.005 179.93 138.195 179.483 138.195 178.933C138.195 178.382 137.005 177.936 135.537 177.936C134.069 177.936 132.879 178.382 132.879 178.933C132.879 179.483 134.069 179.93 135.537 179.93Z'
                  fill='#2F433A'
                />
                <path
                  d='M129.158 179.797C130.626 179.797 131.816 179.35 131.816 178.8C131.816 178.249 130.626 177.803 129.158 177.803C127.69 177.803 126.5 178.249 126.5 178.8C126.5 179.35 127.69 179.797 129.158 179.797Z'
                  fill='#2F433A'
                />
                <path
                  d='M130.455 151.715C131.393 147.94 135.531 145.718 139.698 146.753C143.865 147.788 146.483 151.687 145.545 155.462C144.608 159.238 141.498 159.25 137.331 158.215C133.164 157.18 129.518 155.491 130.455 151.715Z'
                  fill='#CCCCCC'
                />
                <path
                  d='M126.671 162.291C127.061 161.468 125.253 159.794 122.634 158.552C120.014 157.31 117.575 156.969 117.185 157.792C116.795 158.614 118.602 160.288 121.221 161.53C123.841 162.772 126.28 163.113 126.671 162.291Z'
                  fill='#2F433A'
                />
                <path
                  d='M132.182 166.197C134.115 166.197 135.682 164.63 135.682 162.697C135.682 160.764 134.115 159.197 132.182 159.197C130.249 159.197 128.682 160.764 128.682 162.697C128.682 164.63 130.249 166.197 132.182 166.197Z'
                  fill='white'
                />
                <path
                  d='M130.745 162.609C131.389 162.609 131.912 162.087 131.912 161.443C131.912 160.798 131.389 160.276 130.745 160.276C130.1 160.276 129.578 160.798 129.578 161.443C129.578 162.087 130.1 162.609 130.745 162.609Z'
                  fill='#2F433A'
                />
                <path
                  d='M132.152 171.468C132.96 171.468 133.615 170.813 133.615 170.005C133.615 169.198 132.96 168.543 132.152 168.543C131.344 168.543 130.689 169.198 130.689 170.005C130.689 170.813 131.344 171.468 132.152 171.468Z'
                  fill='white'
                />
                <path
                  d='M163.727 180H106.197C106.132 180 106.07 179.974 106.025 179.929C105.979 179.883 105.953 179.821 105.953 179.756C105.953 179.692 105.979 179.63 106.025 179.584C106.07 179.538 106.132 179.512 106.197 179.512H163.727C163.792 179.512 163.854 179.538 163.9 179.584C163.945 179.63 163.971 179.692 163.971 179.756C163.971 179.821 163.945 179.883 163.9 179.929C163.854 179.974 163.792 180 163.727 180Z'
                  fill='#2F433A'
                />
              </g>
              <defs>
                <clipPath id='clip0_20269_10897'>
                  <rect
                    width='163.945'
                    height='180'
                    fill='white'
                    transform='translate(0.0273438)'
                  />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className='flex flex-col  items-center gap-y-2 '>
            <span>
              Add prospective students to the course and assign to batches Add
              Student(s)
            </span>

            <Dialog>
              <DialogTrigger asChild>
                <Button className='w-1/3 gap-x-2 '>
                  <Plus /> Add Students
                </Button>
              </DialogTrigger>
              <DialogOverlay />
              <AddStudentsModal message={false} id={courseData?.id || ""} />
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
