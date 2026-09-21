import * as type from './type';

import normalSettings from './settings/NormalSettings.json';
export const NormalSettings = normalSettings as type.NormalColorSettings;

import halloweenSettings from './settings/HalloweenSettings.json';
export const HalloweenSettings = halloweenSettings as type.NormalColorSettings;

// Northern hemisphere
import northSeasonSettings from './settings/NorthSeasonSettings.json';
export const NorthSeasonSettings =
    northSeasonSettings as type.SeasonColorSettings;

// Southern hemisphere
import southSeasonSettings from './settings/SouthSeasonSettings.json';
export const SouthSeasonSettings =
    southSeasonSettings as type.SeasonColorSettings;

import blueSettings from './settings/BlueSettings.json';
export const BlueSettings = blueSettings as type.NormalColorSettings;

import rainbowSettings from './settings/RainbowSettings.json';
export const RainbowSettings = rainbowSettings as type.RainbowColorSettings;

import gitBlockSettings from './settings/GitBlockSettings.json';
export const GitBlockSettings = gitBlockSettings as type.BitmapPatternSettings;
