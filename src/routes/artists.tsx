import { createFileRoute } from '@tanstack/react-router'
import { TagGroupBlock } from '../components/TagGroupBlock'
import { Settings } from '../components/Settings'
import { artistTagStrings } from '../artistTagStrings'
import { animaArtistTagStrings } from '../animaArtistTagStrings'
import { noOverride, type TagGroup } from '../tagGroups'
import { useAtomValue } from 'jotai'
import { artistsModelAtom } from '../globalState'
import { useMemo } from 'react'

export const Route = createFileRoute('/artists')({
  component: Artists,
  head: () => ({
    meta: [{ title: 'Artists - tagexplorer' }],
  }),
})

const illustriousArtistTagGroup: TagGroup = {
  slug: 'artists',
  wikiPage: 'https://danbooru.donmai.us/artists',
  prompt:
    'masterpiece, best quality, 1girl, white shirt, collared shirt, red cardigan, open cardigan, pleated skirt, medium breasts, bob cut, black hair, bedroom, bed, calendar, potted plant, easel, poster \\(object\\), looking at viewer, cowboy shot, ',
  tags: (artistTagStrings as unknown as string[]).map(noOverride),
}

const animaArtistTagGroup: TagGroup = {
  slug: 'artists_anima',
  wikiPage: 'https://danbooru.donmai.us/artists',
  prompt:
    '1girl, white shirt, collared shirt, red cardigan, open cardigan, pleated skirt, medium breasts, bob cut, black hair, bedroom, bed, calendar, potted plant, easel, looking at viewer, cowboy shot, @',
  tags: (animaArtistTagStrings as unknown as string[]).map(noOverride),
}

function Artists() {
  const artistsModel = useAtomValue(artistsModelAtom)
  const artistTagGroup = useMemo(() => {
    switch (artistsModel) {
      case 'Illustrious':
        return illustriousArtistTagGroup
      case 'Anima':
        return animaArtistTagGroup
    }
  }, [artistsModel])
  return (
    <div className="py-3 px-5 bg">
      <Settings collapsibleGroupSlugs={[]} artistPage={true} route={Route} />
      <div>
        <TagGroupBlock tagGroup={artistTagGroup} route={Route} webp={true} artists={true} />
      </div>
    </div>
  )
}
