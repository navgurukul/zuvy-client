
import { api } from '@/utils/axios.config'

type CsvConfig = {
  endpoint: string
  fileName: string
  columns: { header: string; key: string }[]
  mapData: (item: any, responseData?: any) => any
  dataPath?: string //NEW (for different APIs)
  /** Optional footer row appended after all data rows (e.g. totals) */
  buildFooterRow?: (responseData: any) => Record<string, any> | null
}

const useDownloadCsv = () => {
  const downloadCsv = async ({
    endpoint,
    fileName,
    columns,
    mapData,
    dataPath = 'data.data',
    buildFooterRow,
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

      const csvRows = data.map((item: any) => {
        const mappedItem = mapData(item, response.data)

        return columns
          .map((col) =>
            `"${(mappedItem[col.key] ?? '')
              .toString()
              .replace(/"/g, '""')}"`
          )
          .join(',')
      })

      // Append optional footer row (e.g. "Total Watch Time" summary)
      if (buildFooterRow) {
        const footerData = buildFooterRow(response.data)
        if (footerData) {
          const footerRow = columns
            .map((col) =>
              `"${(footerData[col.key] ?? '')
                .toString()
                .replace(/"/g, '""')}"`
            )
            .join(',')
          csvRows.push(footerRow)
        }
      }

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
