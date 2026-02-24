import React, { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom, useAtomValue, useAtom } from 'jotai'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  onGenClickAtom,
  favoritesAtom,
  imageSizeAtom,
  ineffectiveTagsAtom,
  collapsedGroupsAtom,
  favoritesOnlyAtom,
  artistOrderAtom,
  gensPerPageAtom,
  type SearchParams,
  type ArtistModel,
  artistsModelAtom,
} from '../globalState'
import { type TagGroup, defaultPrompt } from '../tagGroups'
import Fuse from 'fuse.js'
import artistMetadata from '../assets/artistTagsAll.json'
import Rand from 'rand-seed'
import ReactPaginate from 'react-paginate'
import type { AnyRoute } from '@tanstack/react-router'
import { Pill } from '../components/Pill'
import { assertUnreachable, chunkArray, isTouchDevice } from '../utils'

export const TagGroupBlock = ({
  tagGroup,
  route,
  webp,
  artists,
}: {
  tagGroup: TagGroup
  route: AnyRoute
  webp?: boolean
  artists?: boolean
}) => {
  const { slug, wikiPage, prompt, tags, fails } = tagGroup
  const searchParams: SearchParams = route.useSearch()
  const ineffectiveTags = useAtomValue(ineffectiveTagsAtom)
  const favoritesOnly = useAtomValue(favoritesOnlyAtom)
  const favorites = useAtomValue(favoritesAtom)
  const artistOrder = useAtomValue(artistOrderAtom)
  const imageSize = useAtomValue(imageSizeAtom)
  // eslint-disable-next-line
  const navigate = useNavigate({ from: route.fullPath })
  const gensPerPage = useAtomValue(gensPerPageAtom)
  const collapsedGroups = useAtomValue(collapsedGroupsAtom)
  const setCollapsedGroups = useSetAtom(collapsedGroupsAtom)
  const model = useAtomValue(artistsModelAtom)
  const tagGroupFilter = searchParams.tagGroupFilter?.replace(/\s+/g, '_') ?? ''
  const tagFilter = searchParams.tagFilter ?? ''
  const commonFuseOptions = useMemo(
    () => ({ ignoreLocation: true, threshold: 0.1, keys: [], findAllMatches: true }),
    [],
  )
  const tagGroupFuse = useMemo(() => new Fuse([slug], commonFuseOptions), [commonFuseOptions, slug])
  const tagsWithIneffective = useMemo(
    () => [
      ...tags.map((t) => t.name),
      ...(ineffectiveTags === 'IneffectiveTagsShow' || favoritesOnly
        ? (fails ?? []).map((t) => `_fail_${t.name}`)
        : []),
    ],
    [tags, fails, ineffectiveTags, favoritesOnly],
  )
  const tagFuse = useMemo(
    () =>
      new Fuse(
        tagsWithIneffective.map((t) => t.replace(/_fail_/g, '')),
        commonFuseOptions,
      ),
    [commonFuseOptions, tagsWithIneffective],
  )

  const matchedTags = tagFuse.search(tagFilter).map((result) => result.item)
  const tagsToShowWithoutBase = useMemo(
    () =>
      (tagFilter.trim() !== '' ? matchedTags : tagsWithIneffective)
        .filter((tag) => !favoritesOnly || favorites.includes(tag.replace(/_fail_/g, '')))
        .sort(sortArtists(artists ?? false, artistOrder, searchParams.randomSeed ?? '', model)),
    [
      tagFilter,
      matchedTags,
      favoritesOnly,
      favorites,
      artistOrder,
      searchParams.randomSeed,
      model,
      artists,
      tagsWithIneffective,
    ],
  )
  const pageNumber = useMemo(() => searchParams.page ?? 1, [searchParams.page])
  const setPageNumber = (newPageNumber: number) => {
    // eslint-disable-next-line
    void navigate({ search: { ...searchParams, page: newPageNumber } } as any)
  }
  const pages = chunkArray(tagsToShowWithoutBase, gensPerPage)
  const pageToShow = artists ? (pages[pageNumber - 1] ?? pages[0] ?? []) : tagsToShowWithoutBase
  const tagsToShow =
    pageToShow.length > 0 ? (favoritesOnly ? pageToShow : ['_base', ...pageToShow]) : []

  const tagGroupSlugIsMatched = tagGroupFuse.search(tagGroupFilter).length > 0
  const isFilteredByTagGroup = tagGroupFilter.trim() !== '' && !tagGroupSlugIsMatched
  const isFilteredByTag = tagsToShow.length === 0
  const isFiltered = isFilteredByTagGroup || isFilteredByTag

  const isCollapsed = collapsedGroups.includes(slug) && tagFilter.trim() === ''
  const toggleCollapseIcon = isCollapsed ? <ChevronDown size={32} /> : <ChevronUp size={32} />
  const toggleCollapse = () =>
    setCollapsedGroups((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  const [showPrompt, setShowPrompt] = useState(false)

  const minWidths = { small: 125, medium: 175, large: 275, huge: 475 }

  return (
    <div
      className="strong-bg my-5 pb-5 pt-2 px-4 rounded-lg custom-shadow-md flex flex-col gap-3 relative"
      style={{ display: isFiltered ? 'none' : 'flex' }}
    >
      <div className="flex justify-between items-center flex-wrap">
        <div
          className="flex justify-between items-center flex-wrap grow cursor-pointer"
          onClick={artists ? () => {} : toggleCollapse}
        >
          <div className="font-semibold flex gap-2 items-center ">
            {artists ? <></> : toggleCollapseIcon} {slug.replace(/_/g, ' ')}
          </div>
        </div>
        <div className="flex gap-2 items-center ">
          <Pill
            label={showPrompt ? 'hide prompt' : 'show prompt'}
            className="cursor-pointer text-xs"
            onClick={() => setShowPrompt((prev) => !prev)}
          />
          {wikiPage && (
            <a href={wikiPage} target="_blank" rel="noopener noreferrer">
              <Pill label="wiki" className="cursor-pointer text-xs" />
            </a>
          )}
        </div>
      </div>
      <div
        className="flex items-start gap-2 flex-wrap relative"
        style={{
          height: isCollapsed ? '100px' : 'unset',
          transition: 'height 0.3s ease-in-out',
          overflow: 'hidden',
        }}
      >
        <div className="flex flex-col gap-2 w-full">
          {showPrompt && (
            <div className="w-full flex justify-end whitespace-pre-wrap">
              <div
                className="text-gray-700 dark:text-neutral-300 font-mono max-w-[400px]"
                style={{ fontSize: '0.7rem', textAlign: 'right' }}
              >
                {prompt ?? defaultPrompt}
                {artists ? 'TAG' : ' (TAG:1.1)'}
              </div>
            </div>
          )}
          {isCollapsed && (
            <div
              className="w-full bottom-0 bg-gray-100 dark:bg-[#282828] h-[5px] absolute z-10"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent, black)',
              }}
            ></div>
          )}
          {artists && (
            <PageSelector page={pageNumber} maxPage={pages.length} onSubmit={setPageNumber} />
          )}
          <div
            className="grid w-full px-1"
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${minWidths[imageSize]}px, 1fr))`,
              gap: '8px',
            }}
          >
            {tagsToShow.map((tag, i) => (
              <Gen key={i + tag} tag={tag} slug={slug} webp={webp} portrait={tagGroup.portrait} />
            ))}
          </div>
          {artists && (
            <PageSelector page={pageNumber} maxPage={pages.length} onSubmit={setPageNumber} />
          )}
        </div>
      </div>
    </div>
  )
}

const PageSelector = (props: {
  page: number
  maxPage: number
  onSubmit: (newPage: number) => void
}) => {
  return (
    <ReactPaginate
      nextLabel=">"
      onPageChange={({ selected }) => {
        props.onSubmit(selected + 1)
      }}
      pageRangeDisplayed={3}
      marginPagesDisplayed={2}
      pageCount={props.maxPage}
      forcePage={props.page - 1}
      previousLabel="<"
      pageClassName=""
      pageLinkClassName="p-1 page-link "
      previousClassName=""
      previousLinkClassName="p-1 subtle-border"
      nextClassName=""
      nextLinkClassName="p-1 subtle-border"
      breakLabel="…"
      breakClassName="page-item"
      breakLinkClassName="page-link"
      containerClassName="flex gap-1 font-mono cursor-pointer text-xs flex justify-center items-center my-3 select-none"
      activeClassName="font-bold underline"
      renderOnZeroPageCount={null}
    />
  )
}

const Gen = ({
  tag: tagUnchecked,
  slug,
  webp,
  portrait,
}: {
  tag: string
  slug: string
  webp?: boolean
  portrait?: boolean
}) => {
  const [justClicked, setJustClicked] = useState(false)
  const onGenClick = useAtomValue(onGenClickAtom)
  const [favorites, setFavorites] = useAtom(favoritesAtom)

  const isFail = tagUnchecked.startsWith('_fail_')
  const tag = isFail ? tagUnchecked.slice(6) : tagUnchecked === '_base' ? 'no tag' : tagUnchecked
  const failStyle = isFail ? { color: 'var(--fail)' } : {}
  const ext = webp ? '.webp' : '.png'
  const imgUrl = encodeURI(`/gens/${slug}/${tag.replace(/\//g, '%2F')}_00001_${ext}`)
  const imageAspectRatio = portrait ? 'aspect-[416/608]' : 'aspect-square'
  const danbooruTag = tag.replace(/ /g, '_').replace(/\\/g, '')

  const openDanbooru = () =>
    window.open(`https://danbooru.donmai.us/posts?tags=${danbooruTag}`, '_blank')

  const handleClick = () => {
    switch (onGenClick) {
      case 'OpenImage':
        window.open(imgUrl, '_blank')
        break
      case 'CopyTag':
        setJustClicked(true)
        void navigator.clipboard.writeText(tag)
        setTimeout(() => {
          setJustClicked(false)
        }, 1000)
        break
      case 'OpenDanbooru':
        openDanbooru()
        break

      default:
        return assertUnreachable(onGenClick)
    }
  }

  const handleMiddleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.button === 1)) return
    switch (onGenClick) {
      case 'OpenImage':
        window.open(imgUrl, '_blank')
        break
      case 'OpenDanbooru':
        openDanbooru()
        break
      default:
        return
    }
  }

  return (
    <div
      className={[
        'flex flex-col bg-white dark:bg-black rounded-lg overflow-hidden my-1 custom-shadow-sm cursor-pointer relative',
        'full-opacity-on-hover-parent',
        'gen-card',
      ].join(' ')}
      onClick={handleClick}
      onAuxClick={handleMiddleClick}
    >
      {tag !== 'no tag' && (
        <div className="absolute top-[0px] right-[8px] z-10 text-3xl">
          <button
            className="text-red-400 hover:text-red-500 cursor-pointer full-opacity-on-hover"
            style={{
              opacity: favorites.includes(tag) || isTouchDevice() ? 1 : 0,
              textShadow: '0 0 3px rgba(0, 0, 0, 1)',
            }}
            onClick={(e) => {
              e.stopPropagation()
              setFavorites((prev) =>
                prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
              )
            }}
          >
            {favorites.includes(tag) ? '♥' : '♡'}
          </button>
        </div>
      )}
      <div className="w-full">
        <img
          src={imgUrl}
          className={['w-full h-auto', imageAspectRatio].join(' ')}
          loading="lazy"
        />
      </div>
      <div
        className={[
          'py-1 px-2 whitespace-normal w-full font-mono',
          tag === 'no tag' ? 'italic' : '',
        ].join(' ')}
        style={{
          fontSize: '0.7rem',
          color: justClicked ? 'var(--subtle)' : 'unset',
          transitionProperty: 'opacity',
          transitionDuration: '0.2s',
          transitionDelay: justClicked ? '0.8s' : '0s',
          opacity: justClicked ? 0 : 1,

          ...failStyle,
        }}
      >
        {justClicked ? 'Copied to clipboard.' : tag}
      </div>
    </div>
  )
}

const sortArtists =
  (artists: boolean, artistOrder: string, seed: string, model: ArtistModel) =>
  (a: string, b: string) => {
    const cleanA = a.replace(/_fail_/g, '')
    const cleanB = b.replace(/_fail_/g, '')
    type ArtistMetadata = Record<
      string,
      {
        postCount: number
        faveCount: number
        score: number
        animaUniqueness: number | null
        ilUniqueness?: number | null
      }
    >
    const metadata: ArtistMetadata = artistMetadata
    if (!artists || artistOrder === 'Alphabetical') {
      return cleanA.localeCompare(cleanB)
    }
    if (artistOrder === 'PostCount') {
      const aCount = metadata[cleanA]?.postCount ?? 0
      const bCount = metadata[cleanB]?.postCount ?? 0
      return bCount - aCount
    }
    if (artistOrder === 'FaveCount') {
      const aCount = metadata[cleanA]?.faveCount ?? 0
      const bCount = metadata[cleanB]?.faveCount ?? 0
      return bCount - aCount
    }
    if (artistOrder === 'Score') {
      const aScore = metadata[cleanA]?.score ?? 0
      const bScore = metadata[cleanB]?.score ?? 0
      return bScore - aScore
    }
    if (artistOrder === 'AverageFaveCount') {
      const aCount = metadata[cleanA]?.faveCount ?? 0
      const bCount = metadata[cleanB]?.faveCount ?? 0
      const aPosts = metadata[cleanA]?.postCount || 1
      const bPosts = metadata[cleanB]?.postCount || 1
      return bCount / bPosts - aCount / aPosts
    }
    if (artistOrder === 'AverageScore') {
      const aScore = metadata[cleanA]?.score ?? 0
      const bScore = metadata[cleanB]?.score ?? 0
      const aPosts = metadata[cleanA]?.postCount || 1
      const bPosts = metadata[cleanB]?.postCount || 1
      return bScore / bPosts - aScore / aPosts
    }
    if (artistOrder === 'Uniqueness') {
      const uniquenessPropName = (() => {
        switch (model) {
          case 'Illustrious':
            return 'ilUniqueness'
          case 'Anima':
            return 'animaUniqueness'
        }
      })()
      const aUniqueness = metadata[cleanA]?.[uniquenessPropName] ?? 0
      const bUniqueness = metadata[cleanB]?.[uniquenessPropName] ?? 0
      return bUniqueness - aUniqueness
    }
    if (artistOrder === 'Random') {
      const rand = new Rand(seed + cleanA + cleanB)
      const randA = rand.next()
      const randB = rand.next()
      return randB - randA
    }
    return cleanA.localeCompare(cleanB)
  }
