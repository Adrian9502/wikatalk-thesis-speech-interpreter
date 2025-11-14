export const PRONUNCIATION_ASSETS: Record<
  string,
  { fileName: string; asset: any }[]
> = {
  bicol: [
    {
      fileName: "kumusta_ka",
      asset: require("@/assets/pronunciation/bicolano/kumusta_ka.mp3"),
    },
    {
      fileName: "marahay_na_aga",
      asset: require("@/assets/pronunciation/bicolano/marahay_na_aga.mp3"),
    },
    {
      fileName: "marahay_na_hapon",
      asset: require("@/assets/pronunciation/bicolano/marahay_na_hapon.mp3"),
    },
    {
      fileName: "marahay_na_banggi",
      asset: require("@/assets/pronunciation/bicolano/marahay_na_banggi.mp3"),
    },
    {
      fileName: "paaram",
      asset: require("@/assets/pronunciation/bicolano/paaram.mp3"),
    },
  ],
  cebuano: [
    {
      fileName: "kumusta_ka",
      asset: require("@/assets/pronunciation/cebuano/kumusta_ka.mp3"),
    },
    {
      fileName: "maayong_buntag",
      asset: require("@/assets/pronunciation/cebuano/maayong_buntag.mp3"),
    },
    {
      fileName: "maayong_hapon",
      asset: require("@/assets/pronunciation/cebuano/maayong_hapon.mp3"),
    },
    {
      fileName: "maayong_gabii",
      asset: require("@/assets/pronunciation/cebuano/maayong_gabii.mp3"),
    },
    {
      fileName: "pananghid",
      asset: require("@/assets/pronunciation/cebuano/pananghid.mp3"),
    },
  ],
};

export const BUNDLED_PRONUNCIATION_DATA = {
  bicol: [
    {
      english: "Hello",
      translation: "Kumusta ka",
      pronunciation: "koo-moo-sta kah",
      fileName: "kumusta_ka",
    },
    {
      english: "Good morning",
      translation: "Marahay na aga",
      pronunciation: "mah-rah-hay nah ah-gah",
      fileName: "marahay_na_aga",
    },
    {
      english: "Good afternoon",
      translation: "Marahay na hapon",
      pronunciation: "mah-rah-hay nah hah-pon",
      fileName: "marahay_na_hapon",
    },
    {
      english: "Good evening",
      translation: "Marahay na banggi",
      pronunciation: "mah-rah-hay nah bang-gee",
      fileName: "marahay_na_banggi",
    },
    {
      english: "Goodbye",
      translation: "Paaram",
      pronunciation: "pah-ah-ram",
      fileName: "paaram",
    },
  ],
  cebuano: [
    {
      english: "Hello",
      translation: "Kumusta ka",
      pronunciation: "koo-moos-tah kah",
      fileName: "kumusta_ka",
    },
    {
      english: "Good morning",
      translation: "Maayong buntag",
      pronunciation: "ma-ah-yong boon-tahg",
      fileName: "maayong_buntag",
    },
    {
      english: "Good afternoon",
      translation: "Maayong hapon",
      pronunciation: "ma-ah-yong hah-pon",
      fileName: "maayong_hapon",
    },
    {
      english: "Good evening",
      translation: "Maayong gabii",
      pronunciation: "ma-ah-yong gah-bee",
      fileName: "maayong_gabii",
    },
    {
      english: "Goodbye",
      translation: "Pananghid",
      pronunciation: "pah-nahng-hid",
      fileName: "pananghid",
    },
  ],
};
