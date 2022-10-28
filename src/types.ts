import { Profile } from './lens/schema/graphql'

export enum NodeStyle {
    Bubble = 'Bubble',
    LensHandle = 'LensHandle',
}

export enum ColorMode {
    System = 'System',
    Light = 'Light',
    Dark = 'Dark',
}

export type CurrentProfile = Pick<Profile, 'id' | 'handle'>