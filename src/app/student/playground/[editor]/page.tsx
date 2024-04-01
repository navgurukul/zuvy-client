import IDE from './editor'

export default function page({ params }: { params: { editor: string } }) {
    return (
        <div>
            <IDE params={params} />
        </div>
    )
}
