import { atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'
import { faceTagGroups, styleTagGroups, compositionTagGroups } from './tagGroups'

export type Theme = 'light' | 'dark'

export const themeAtom = atomWithStorage<Theme>('theme', 'light')

export type ImageSize = 'small' | 'medium' | 'large' | 'huge'

export const imageSizeAtom = atomWithStorage<ImageSize>('imageSize', 'medium')

export type OnGenClick = 'CopyTag' | 'OpenImage' | 'OpenDanbooru'

export const onGenClickAtom = atomWithStorage<OnGenClick>('onGenClick', 'CopyTag')

export const favoritesAtom = atomWithStorage<string[]>('favorites', [])

export const favoritesOnlyAtom = atom(false)

export type IneffectiveTags = 'IneffectiveTagsHide' | 'IneffectiveTagsShow'

export const ineffectiveTagsAtom = atomWithStorage<IneffectiveTags>(
  'ineffectiveTags',
  'IneffectiveTagsHide',
)

export const collapsedGroupsAtom = atomWithStorage<string[]>(
  'collapsedGroups',
  [faceTagGroups, styleTagGroups, compositionTagGroups]
    .map((superGroup) => superGroup.map((tagGroup) => tagGroup.slug).slice(1))
    .flat(),
)

export type ArtistOrder =
  | 'Alphabetical'
  | 'PostCount'
  | 'FaveCount'
  | 'Score'
  | 'AverageFaveCount'
  | 'AverageScore'
  | 'Uniqueness'
  | 'Random'

export const artistOrderAtom = atomWithStorage<ArtistOrder>('artistOrder', 'Alphabetical')

export const gensPerPageAtom = atomWithStorage<number>('gensPerPage', 50)

export type ArtistModel = 'Illustrious' | 'Anima'

export const artistsModelAtom = atomWithStorage<ArtistModel>('artistsModel', 'Illustrious')

export const areSettingsCollapsed = atomWithStorage<boolean>('areSettingsCollapsed', false)

export interface SearchParams {
  tagGroupFilter?: string
  tagFilter?: string
  randomSeed?: string
  page?: number
}
