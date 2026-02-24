import { useCallback, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useSetAtom, useAtom } from 'jotai'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  onGenClickAtom,
  imageSizeAtom,
  ineffectiveTagsAtom,
  collapsedGroupsAtom,
  favoritesOnlyAtom,
  artistOrderAtom,
  gensPerPageAtom,
  areSettingsCollapsed,
  type SearchParams,
  artistsModelAtom,
  type ArtistModel,
} from '../globalState'
import type { AnyRoute } from '@tanstack/react-router'
import { Pill } from './Pill'

export const Settings = (props: {
  route: AnyRoute
  collapsibleGroupSlugs: string[]
  artistPage?: boolean
}) => {
  const [imageSize, setImageSize] = useAtom(imageSizeAtom)
  const [onGenClick, setOnGenClick] = useAtom(onGenClickAtom)
  const [ineffectiveTags, setIneffectiveTags] = useAtom(ineffectiveTagsAtom)
  const [artistOrder, setArtistOrder] = useAtom(artistOrderAtom)
  const [favoritesOnly, setFavoritesOnly] = useAtom(favoritesOnlyAtom)
  const [gensPerPage, setGensPerPage] = useAtom(gensPerPageAtom)
  const [artistsModel, setArtistsModel] = useAtom(artistsModelAtom)
  const [isCollapsed, setIsCollapsed] = useAtom(areSettingsCollapsed)
  const setCollapsedGroups = useSetAtom(collapsedGroupsAtom)
  // eslint-disable-next-line
  const navigate = useNavigate({ from: props.route.fullPath })

  const allSlugs = props.collapsibleGroupSlugs
  const collapseAll = () => setCollapsedGroups(allSlugs)
  const expandAll = () => setCollapsedGroups([])
  const searchParams: SearchParams = props.route.useSearch()
  const resetSearchParams = useCallback(() => {
    if (!props.artistPage) {
      if (artistOrder === 'Random') {
        setArtistOrder('Alphabetical')
      }
      // eslint-disable-next-line
      void navigate({ search: { ...searchParams, randomSeed: undefined, page: undefined } } as any)
    } else if (searchParams.randomSeed && artistOrder !== 'Random') {
      setArtistOrder('Random')
    }
  }, [props.artistPage, searchParams, navigate, artistOrder, setArtistOrder])
  useEffect(() => {
    resetSearchParams()
  }, [resetSearchParams])
  const toggleFavoritesOnly = () => setFavoritesOnly((prev) => !prev)
  const toggleCollapseIcon = isCollapsed ? <ChevronDown size={32} /> : <ChevronUp size={32} />
  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev)
  }

  return (
    <div className="subtle-bg my-5 py-5 px-4 rounded-lg custom-shadow-md flex flex-col gap-3 text-sm">
      <div className="text-lg flex items-center gap-2 cursor-pointer" onClick={toggleCollapse}>
        {toggleCollapseIcon} Settings
      </div>
      <div
        className="flex flex-col gap-3"
        style={{
          display: isCollapsed ? 'none' : 'flex',
        }}
      >
        <div className="flex gap-5 pb-4 flex-col" style={{ borderBottom: 'var(--subtle-border)' }}>
          <div className="flex gap-6 gap-y-1 items-center flex-wrap">
            <DropdownSetting
              id="imageSize"
              label="Image size"
              value={imageSize}
              onValueSelected={setImageSize}
              options={[
                { value: 'small', label: 'small' },
                { value: 'medium', label: 'medium' },
                { value: 'large', label: 'large' },
                { value: 'huge', label: 'huge' },
              ]}
            />
            <DropdownSetting
              id="onGenClick"
              label="On click"
              value={onGenClick}
              onValueSelected={setOnGenClick}
              options={[
                { value: 'CopyTag', label: 'Copy tag' },
                { value: 'OpenImage', label: 'Open image' },
                { value: 'OpenDanbooru', label: 'Danbooru search' },
              ]}
            />
            {!props.artistPage && (
              <DropdownSetting
                id="ineffectiveTags"
                label="Ineffective tags"
                value={ineffectiveTags}
                onValueSelected={setIneffectiveTags}
                options={[
                  { value: 'IneffectiveTagsHide', label: 'Hide' },
                  { value: 'IneffectiveTagsShow', label: 'Show' },
                ]}
              />
            )}
            {props.artistPage && (
              <DropdownSetting
                id="artistOrder"
                label="Artist order"
                value={artistOrder}
                onValueSelected={(newVal) => {
                  const randomNumber = Math.floor(Math.random() * 99999999) + 1
                  // eslint-disable-next-line
                  void navigate({
                    search: {
                      ...searchParams,
                      randomSeed: newVal === 'Random' ? randomNumber : undefined,
                      page: 1,
                    },
                    // eslint-disable-next-line
                  } as any).then(() => {
                    setArtistOrder(newVal)
                  })
                }}
                options={[
                  { value: 'Alphabetical', label: 'Alphabetical' },
                  { value: 'PostCount', label: 'Post count' },
                  { value: 'FaveCount', label: 'Favorites' },
                  { value: 'Score', label: 'Score' },
                  { value: 'AverageFaveCount', label: 'Average favorites' },
                  { value: 'AverageScore', label: 'Average score' },
                  { value: 'Uniqueness', label: 'Uniqueness (NEW!)' },
                  { value: 'Random', label: 'Random' },
                ]}
              />
            )}
            {props.artistPage && (
              <>
                <DropdownSetting
                  id="gensPerPage"
                  label="Images per page"
                  value={String(gensPerPage)}
                  onValueSelected={(value) => setGensPerPage(Number(value))}
                  options={[
                    { value: '25', label: '25' },
                    { value: '50', label: '50' },
                    { value: '100', label: '100' },
                    { value: '200', label: '200' },
                  ]}
                />
                <DropdownSetting
                  id="artistsModel"
                  label="Model"
                  value={artistsModel}
                  onValueSelected={(value) => setArtistsModel(strToArtistModel(value))}
                  options={[
                    { value: 'Illustrious', label: 'Illustrious' },
                    { value: 'Anima', label: 'Anima' },
                  ]}
                />
              </>
            )}
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {!props.artistPage && (
              <>
                <Pill
                  label="Collapse all"
                  className="cursor-pointer text-nowrap"
                  onClick={collapseAll}
                  id="collapseAllPill"
                />
                <Pill
                  label="Expand all"
                  className="cursor-pointer text-nowrap"
                  onClick={expandAll}
                  id="expandAllPill"
                />
              </>
            )}
            <Pill
              label="Favorites only"
              className={['cursor-pointer', favoritesOnly ? 'bg-red-200 dark:bg-red-900' : ''].join(
                ' ',
              )}
              onClick={toggleFavoritesOnly}
            />
          </div>
        </div>
        <div className="text-xs">
          Search queries are stored in the URL, so you can bookmark or share them.
        </div>
        {!props.artistPage && (
          <SearchBar
            id="filterTagGroups"
            label="Search tag groups:"
            value={searchParams.tagGroupFilter ?? ''}
            onInput={(newVal) => {
              // eslint-disable-next-line
              void navigate({ search: { ...searchParams, tagGroupFilter: newVal } } as any)
            }}
            onClear={() =>
              // eslint-disable-next-line
              void navigate({ search: { ...searchParams, tagGroupFilter: undefined } } as any)
            }
          />
        )}
        <SearchBar
          id="filterTags"
          label="Search tags:"
          value={searchParams.tagFilter ?? ''}
          onInput={(newVal) => {
            // eslint-disable-next-line
            void navigate({ search: { ...searchParams, tagFilter: newVal } } as any)
          }}
          onClear={() =>
            // eslint-disable-next-line
            void navigate({ search: { ...searchParams, tagFilter: undefined } } as any)
          }
        />
      </div>
    </div>
  )
}

const DropdownSetting = <T extends string>(props: {
  id: string
  label: string
  value: T
  onValueSelected: (value: T) => void
  options: { value: T; label: string }[]
}) => (
  <div className="flex items-start flex-wrap flex-col">
    <label htmlFor={props.id} className="font-semibold">
      {props.label}
    </label>
    <select
      id={props.id}
      value={props.value}
      onChange={(e) => props.onValueSelected(e.target.value as T)}
      className="rounded px-2 dark:bg-neutral-700 dark:text-neutral-200"
      style={{ border: 'var(--subtle-border)' }}
    >
      {props.options.map((option, i) => (
        <option key={i + option.label} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
)

const SearchBar = (props: {
  id: string
  label: string
  value: string
  onInput: (newVal: string) => void
  onClear: () => void
}) => (
  <div className="flex flex-col ">
    <label htmlFor={props.id} className="text-xs">
      {props.label}
    </label>
    <div className="flex gap-2 items-center">
      <input
        type="text"
        className="rounded py-[1px] px-2 w-full max-w-[200px] mt-1"
        style={{ border: 'var(--subtle-border)', fontSize: '0.75rem' }}
        value={props.value}
        onChange={(e) => props.onInput(e.target.value.toLowerCase())}
        id={props.id}
      />
      <Pill
        label="Clear"
        className="cursor-pointer text-xs px-1 py-[3px]"
        onClick={props.onClear}
      />
    </div>
  </div>
)

const strToArtistModel = (str: string): ArtistModel => {
  if (str === 'Illustrious' || str === 'Anima') {
    return str
  }
  return 'Illustrious'
}
