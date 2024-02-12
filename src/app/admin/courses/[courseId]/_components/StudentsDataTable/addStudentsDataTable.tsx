import { useState, useEffect } from "react";

import { User, columns } from "./columns";
import { DataTable } from "./dataTable";

type Props = {};

export default function AddStudentsDataTable() {
  const [data, setData] = useState<User[]>([]); // Set initial state as an empty array

  useEffect(() => {
    async function getStudentsData(): Promise<User[]> {
      const res = await fetch(
        "https://65c9e6bc3b05d29307df3814.mockapi.io/Students"
      );

      const data = await res.json();
      return data;
    }

    async function fetchData() {
      const studentsData = await getStudentsData();
      setData(studentsData);
      console.log(studentsData); // Log the fetched data
    }

    fetchData();
  }, []);

  return (
    <section>
      <div className=''>
        <h1>All Users</h1>
        <DataTable columns={columns} data={data} />
      </div>
    </section>
  );
}
