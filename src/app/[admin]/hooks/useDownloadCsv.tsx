
import { api } from '@/utils/axios.config'

type CsvConfig = {
  endpoint: string
  fileName: string
  columns: { header: string; key: string }[]
  mapData: (item: any) => any
  dataPath?: string //NEW (for different APIs)
}

const useDownloadCsv = () => {
  const downloadCsv = async ({
    endpoint,
    fileName,
    columns,
    mapData,
    dataPath = 'data.data',
  }: CsvConfig) => {
    try {
      const response = await api.get(endpoint)

      const data = dataPath
        .split('.')
        .reduce((acc: any, key) => acc?.[key], response.data)

      if (!Array.isArray(data) || data.length === 0) {
        console.error('No data available for CSV')
        return
      }

      const headers = columns.map((col) => col.header).join(',')

      const csvRows = data.map((item: any) =>
        columns
          .map((col) =>
            `"${(mapData(item)[col.key] ?? '')
              .toString()
              .replace(/"/g, '""')}"`
          )
          .join(',')
      )

      const csvContent = [headers, ...csvRows].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}.csv`
    document.body.appendChild(link)
    const event = new MouseEvent('click')
    link.dispatchEvent(event)
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    

    } catch (error) {
      console.error('CSV download error', error)
    }
  }

  return { downloadCsv }
}

export default useDownloadCsv
