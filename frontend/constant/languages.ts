export type Dialect = {
  label: string;
  value: string;
};

export type LanguageInfo = {
  region: string;
  symbol: string;
  fact: string;
};

export const DIALECTS: Dialect[] = [
  { label: "Tagalog", value: "Tagalog" },
  { label: "Cebuano", value: "Cebuano" },
  { label: "Hiligaynon", value: "Hiligaynon" },
  { label: "Ilocano", value: "Ilocano" },
  { label: "Bicol", value: "Bicol" },
  { label: "Waray", value: "Waray" },
  { label: "Pangasinan", value: "Pangasinan" },
  { label: "Maguindanao", value: "Maguindanao" },
  { label: "Kapampangan", value: "Kapampangan" },
  { label: "Bisaya", value: "Bisaya" },
];

// Language Background Images Mapping
export const LANGUAGE_BACKGROUND: Record<string, string> = {
  Tagalog: require("@/assets/images/languages/tagalog-bg.jpg"),
  Cebuano: require("@/assets/images/languages/cebuano-bg.jpg"),
  Hiligaynon: require("@/assets/images/languages/hiligaynon-bg.jpg"),
  Ilocano: require("@/assets/images/languages/ilocano-bg.jpg"),
  Bicol: require("@/assets/images/languages/bicolano-bg.jpg"),
  Waray: require("@/assets/images/languages/waray-bg.jpg"),
  Pangasinan: require("@/assets/images/languages/pangasinense-bg.jpg"),
  Maguindanao: require("@/assets/images/languages/maguindanao-bg.jpg"),
  Kapampangan: require("@/assets/images/languages/kapampangan-bg.jpg"),
  Bisaya: require("@/assets/images/languages/bisaya-bg.jpg"),
};

// Language Culture Info -
export const LANGUAGE_INFO: Record<string, LanguageInfo> = {
  Tagalog: {
    region: "Central Luzon, Metro Manila",
    symbol: "Sampaguita flower",
    fact: "Official basis for Filipino, the national language",
  },
  Cebuano: {
    region: "Central Visayas, parts of Mindanao",
    symbol: "Sinulog Festival",
    fact: "Second most spoken language in the Philippines",
  },
  Hiligaynon: {
    region: "Western Visayas",
    symbol: "MassKara Festival",
    fact: "Also known as Ilonggo and widely spoken in Iloilo and Bacolod",
  },
  Ilocano: {
    region: "Northern Luzon",
    symbol: "Vigan's Calle Crisologo",
    fact: "Known for its rich proverbs and deep heritage in poetry and literature",
  },
  Bicol: {
    region: "Bicol Region",
    symbol: "Mayon Volcano",
    fact: "Famous for its spicy cuisine and distinct Bikolano dialects",
  },
  Waray: {
    region: "Eastern Visayas",
    symbol: "San Juanico Bridge",
    fact: "Waray speakers are known for their strong and resilient culture",
  },
  Pangasinan: {
    region: "Pangasinan Province",
    symbol: "Hundred Islands National Park",
    fact: "Home to the Hundred Islands National Park and Bangus Festival",
  },
  Maguindanao: {
    region: "Bangsamoro Autonomous Region",
    symbol: "Sultan Haji Hassanal Bolkiah Mosque",
    fact: "Has a rich tradition of Islamic culture and indigenous music",
  },
  Kapampangan: {
    region: "Central Luzon (Pampanga, Tarlac)",
    symbol: "Giant Lantern Festival",
    fact: "Known for its culinary heritage and 'Sisig' dish",
  },
  Bisaya: {
    region: "Visayas, parts of Mindanao",
    symbol: "Chocolate Hills",
    fact: "Often used interchangeably with Cebuano but also includes other dialects",
  },
};
