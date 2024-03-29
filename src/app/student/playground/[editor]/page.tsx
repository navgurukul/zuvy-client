import IDE from './editor'

export default function page({ params }: { params: { editor: string } }) {
    return <IDE params={params} />
}
