type LanguageInfo = {
  region: string;
  majorCities: string[];
  symbol: string;
  fact: string;
  commonGreetings: {
    hello: string;
    thankYou: string;
  };
};

export const DIALECTS: { label: string; value: string }[] = [
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

// Language Culture Info
export const LANGUAGE_INFO: Record<string, LanguageInfo> = {
  Tagalog: {
    region: "Central Luzon, Metro Manila",
    majorCities: ["Manila", "Quezon City", "Cavite", "Batangas"],
    symbol: "Pahiyas Festival",
    fact: "Official basis for Filipino, the national language",
    commonGreetings: { hello: "Kumusta", thankYou: "Salamat" },
  },
  Cebuano: {
    region: "Central Visayas, parts of Mindanao",
    majorCities: ["Cebu City", "Davao", "Cagayan de Oro"],
    symbol: "Sinulog Festival",
    fact: "Second most spoken language in the Philippines",
    commonGreetings: { hello: "Maayong adlaw", thankYou: "Salamat" },
  },
  Hiligaynon: {
    region: "Western Visayas",
    majorCities: ["Iloilo City", "Bacolod", "Roxas City"],
    symbol: "MassKara Festival",
    fact: "Also known as Ilonggo and widely spoken in Iloilo and Bacolod",
    commonGreetings: { hello: "Kumusta", thankYou: "Salamat" },
  },
  Ilocano: {
    region: "Northern Luzon",
    majorCities: ["Laoag", "Vigan", "Tuguegarao"],
    symbol: "Vigan's Calle Crisologo",
    fact: "Known for its rich proverbs and deep heritage in poetry and literature",
    commonGreetings: { hello: "Kablaaw", thankYou: "Agyamanak" },
  },
  Bicol: {
    region: "Bicol Region",
    majorCities: ["Legazpi", "Naga", "Sorsogon"],
    symbol: "Mayon Volcano",
    fact: "Famous for its spicy cuisine and distinct Bikolano dialects",
    commonGreetings: { hello: "Marhay na aga", thankYou: "Dios Mabalos" },
  },
  Waray: {
    region: "Eastern Visayas",
    majorCities: ["Tacloban", "Catbalogan", "Borongan"],
    symbol: "San Juanico Bridge",
    fact: "Waray speakers are known for their strong and resilient culture",
    commonGreetings: { hello: "Maupay nga adlaw", thankYou: "Salamat" },
  },
  Pangasinan: {
    region: "Pangasinan Province",
    majorCities: ["Dagupan", "Alaminos", "Urdaneta"],
    symbol: "Hundred Islands National Park",
    fact: "Home to the Hundred Islands National Park and Bangus Festival",
    commonGreetings: { hello: "Kumusta", thankYou: "Salamat" },
  },
  Maguindanao: {
    region: "Bangsamoro Autonomous Region",
    majorCities: ["Cotabato City", "Sultan Kudarat", "Maguindanao"],
    symbol: "Sultan Haji Hassanal Bolkiah Mosque",
    fact: "Has a rich tradition of Islamic culture and indigenous music",
    commonGreetings: { hello: "Assalamu Alaikum", thankYou: "Salamat" },
  },
  Kapampangan: {
    region: "Central Luzon (Pampanga, Tarlac)",
    majorCities: ["San Fernando", "Angeles City", "Tarlac City"],
    symbol: "Giant Lantern Festival",
    fact: "Known for its culinary heritage and 'Sisig' dish",
    commonGreetings: { hello: "Komusta", thankYou: "Dakal a Salamat" },
  },
  Bisaya: {
    region: "Visayas, parts of Mindanao",
    majorCities: ["Cebu City", "Dumaguete", "Tagbilaran"],
    symbol: "Chocolate Hills",
    fact: "Often used interchangeably with Cebuano but also includes other dialects",
    commonGreetings: { hello: "Maayong adlaw", thankYou: "Salamat" },
  },
};
