import { useQuery } from '@tanstack/react-query'
import { getStationsByTag, parseTags, type Station } from '../../lib/radio-browser'
import { queryKeys } from '../../lib/query-keys'
import SectionHeader from '../ui/SectionHeader'
import StationCard from '../ui/StationCard'
import { SkeletonGrid } from '../ui/SkeletonCard'

interface RelatedStationsProps {
  station: Station
}

export default function RelatedStations({ station }: RelatedStationsProps) {
  const tags = parseTags(station.tags)
  const primaryTag = tags[0]

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.stations.byTag(primaryTag ?? ''), 'related', 8],
    queryFn: () => getStationsByTag(primaryTag!, 9),
    enabled: !!primaryTag,
  })

  // Exclude the current station from the related list
  const related = data?.filter((s) => s.stationuuid !== station.stationuuid).slice(0, 8)

  if (!primaryTag || (!isLoading && (!related || related.length === 0))) return null

  return (
    <section className="page-wrap mt-12 px-4">
      <SectionHeader
        title="More like this"
        subtitle={`More ${primaryTag} stations`}
        href={`/genres/${primaryTag}`}
        hrefLabel={`All ${primaryTag}`}
      />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading && <SkeletonGrid count={8} variant="card" />}
        {related?.map((s, i) => (
          <div
            key={s.stationuuid}
            className="rise-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <StationCard station={s} />
          </div>
        ))}
      </div>
    </section>
  )
}
