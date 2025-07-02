import React from 'react'

type Props = {
    logSelectedRows: () => any[]
    table: any
}


const AddLiveClasstoChapter = ({ logSelectedRows, table }: Props) => {
    const selectedRows = logSelectedRows()
    console.log(selectedRows)

  return (
    <div>AddLiveClasstoChapter</div>
  )
}

export default AddLiveClasstoChapter