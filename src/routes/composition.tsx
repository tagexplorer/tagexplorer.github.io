import { createFileRoute } from '@tanstack/react-router'
import { compositionTagGroups } from '../tagGroups'
import { TagGroupBlock } from '../components/TagGroupBlock'
import { Settings } from '../components/Settings'

export const Route = createFileRoute('/composition')({
  component: Composition,
  head: () => ({
    meta: [{ title: 'Composition - tagexplorer' }],
  }),
})

function Composition() {
  return (
    <div className="py-3 px-5 bg">
      <Settings collapsibleGroupSlugs={compositionTagGroups.map((g) => g.slug)} route={Route} />
      <div>
        {compositionTagGroups.map((tagGroup, i) => (
          <TagGroupBlock key={i} tagGroup={tagGroup} route={Route} />
        ))}
      </div>
    </div>
  )
}
