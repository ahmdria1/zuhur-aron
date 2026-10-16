import type { Occasion } from "./catalog";
import type { CopyKey } from "./copy";
import type { AddonId, CityId, SizeId } from "./quote";

export const SIZE_KEY: Record<SizeId, CopyKey> = {
  petite: "sizePetite",
  classic: "sizeClassic",
  grand: "sizeGrand",
};

export const CITY_KEY: Record<CityId, CopyKey> = {
  buraidah: "cityBuraidah",
  unaizah: "cityUnaizah",
  rass: "cityRass",
  riyadh: "cityRiyadh",
  jeddah: "cityJeddah",
  dammam: "cityDammam",
};

export const ADDON_KEY: Record<AddonId, CopyKey> = {
  vase: "addonVase",
  dates: "addonDates",
  ribbon: "addonRibbon",
};

export const OCCASIONS = ["love", "thanks", "newborn", "grad", "wedding", "sympathy", "apology"] as const;

export const OCCASION_KEY: Record<Occasion, CopyKey> = {
  love: "occLove",
  thanks: "occThanks",
  newborn: "occNewborn",
  grad: "occGrad",
  wedding: "occWedding",
  sympathy: "occSympathy",
  apology: "occApology",
};

export const fieldClass =
  "h-12 w-full border border-ink/15 bg-foam px-3 text-base text-ink outline-none";
