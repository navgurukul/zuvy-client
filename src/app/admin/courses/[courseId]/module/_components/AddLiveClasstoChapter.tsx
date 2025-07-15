import React from 'react'

type Props = {
    logSelectedRows: () => any[]
    table: any
}


const AddLiveClasstoChapter = ({ logSelectedRows, table }: Props) => {
    const selectedRows = logSelectedRows()

  return (
    <div>AddLiveClasstoChapter</div>
  )
}

export default AddLiveClasstoChapter