export type Listing = {
  slug: string;
  price: string;
  priceNum: number;
  priceJPY: string;
  name: string;
  city: string;
  prefecture: string;
  region: string;
  beds: number;
  size: string;
  built: string;
  parking: string;
  notes: string;
  isPremium: boolean;
  contact?: string;
  tags: string[];
  images: string[];
};

const CDN = "https://cdn.prod.website-files.com/6789dd1a798234106f5e33b7/";

export const listings: Listing[] = [
  {
    slug: "joetsu-niigata-1000yen",
    price: "$7", priceNum: 7, priceJPY: "¥1,000",
    name: "A Rare 1,000-Yen Countryside Home in Joetsu",
    city: "Joetsu", prefecture: "Niigata", region: "Chubu",
    beds: 10, size: "1,367 sq ft", built: "1974", parking: "1 spot",
    notes: "10-room wooden house on a 150-tsubo lot. Ideal for DIY renovation or countryside retreat. The land value alone likely exceeds the asking price.",
    isPremium: false, contact: "contact@oldhousesjapan.com",
    tags: ["renovation-project", "large-lot", "countryside", "niigata"],
    images: [
      CDN + "6939d71ab36f3191badb63b1_78978327_0001.jpg",
      "https://cdn.prod.website-files.com/6789dd1a798234106f5e335b/678b3365564b81248e96dbfb_OByUgrVaLX0.jpg",
      "https://cdn.prod.website-files.com/6789dd1a798234106f5e335b/678b333c8db47336f5d0c39e_s5yMtPuamjc.jpg",
    ],
  },
  {
    slug: "sasebo-nagasaki-68",
    price: "$68", priceNum: 68, priceJPY: "~¥10,000",
    name: "Traditional Home in Sasebo",
    city: "Sasebo", prefecture: "Nagasaki", region: "Kyushu",
    beds: 4, size: "649 sq ft", built: "Est. 1960s", parking: "None",
    notes: "Traditional Japanese home in a quiet residential area. Renovation required but the price is almost nothing. Nagasaki is one of Japan's most scenic coastal regions.",
    isPremium: true,
    tags: ["renovation-project", "coastal", "nagasaki", "traditional"],
    images: [
      CDN + "68226416157f51d450384603_1863404304_500x375%20(1).jpeg",
      CDN + "682f66dcc75e20e03e490b24_1864892493_500x375%20(1).jpeg",
      CDN + "68226660f150d27e9832dcb9_1817181332_500x375%20(1).jpeg",
    ],
  },
  {
    slug: "hakodate-hokkaido-69",
    price: "$69", priceNum: 69, priceJPY: "~¥10,000",
    name: "3LDK Home in Hakodate",
    city: "Hakodate", prefecture: "Hokkaido", region: "Hokkaido",
    beds: 4, size: "682 sq ft", built: "1969", parking: "None",
    notes: "Quiet residential neighborhood in Hakodate — one of Hokkaido's most charming historic port cities. Classic Japanese layout with renovation potential.",
    isPremium: true,
    tags: ["renovation-project", "hokkaido", "hakodate", "historic-city"],
    images: [
      CDN + "6843a9c17f140229633338c1_75494895_0001%20(1).jpg",
      CDN + "692bb5a679b5875e1085ecff_1876961674_500x375%20(1).jpeg",
      "https://cdn.prod.website-files.com/6789dd1a798234106f5e335b/678b3365564b81248e96dbfb_OByUgrVaLX0.jpg",
    ],
  },
  {
    slug: "sorachi-hokkaido-640",
    price: "$640", priceNum: 640, priceJPY: "~¥96,000",
    name: "Spacious 3LDK on Large Lot — Sorachi District",
    city: "Kamisunagawa-cho", prefecture: "Hokkaido", region: "Hokkaido",
    beds: 3, size: "1,989 sq ft", built: "1961", parking: "1 spot",
    notes: "Nearly 2,000 sq ft on a large lot near Sunagawa City. Shops and schools nearby. A rare entry-level price for a property of this size in Hokkaido.",
    isPremium: false, contact: "contact@oldhousesjapan.com",
    tags: ["large-lot", "hokkaido", "spacious", "near-amenities"],
    images: [
      CDN + "69398fc5f6891037223ca8c1_1931124888_500x348.jpeg",
      CDN + "692bb3900fc65f366008a955_78823878_0001.jpg",
      CDN + "6939d71ab36f3191badb63b1_78978327_0001.jpg",
    ],
  },
  {
    slug: "otaru-hokkaido-1281",
    price: "$1,281", priceNum: 1281, priceJPY: "~¥192,000",
    name: "3LDK Home With Garden & Parking in Otaru",
    city: "Otaru", prefecture: "Hokkaido", region: "Hokkaido",
    beds: 3, size: "1,024 sq ft", built: "1966", parking: "1 spot",
    notes: "Peaceful coastal living in one of Hokkaido's most beloved cities. Convenience store and supermarket within 10 min walk. Garden included. Otaru is famous for its historic canal, glass workshops, and fresh seafood.",
    isPremium: false, contact: "contact@oldhousesjapan.com",
    tags: ["garden", "parking", "walkable", "hokkaido", "coastal", "otaru"],
    images: [
      CDN + "692ba861878b06826a0b3982_1864238240_400x300.jpeg",
      CDN + "692bb5a679b5875e1085ecff_1876961674_500x375%20(1).jpeg",
      CDN + "692bb3900fc65f366008a955_78823878_0001.jpg",
    ],
  },
  {
    slug: "muroran-hokkaido-1921",
    price: "$1,921", priceNum: 1921, priceJPY: "~¥288,000",
    name: "Wooden Home in Coastal Muroran",
    city: "Muroran", prefecture: "Hokkaido", region: "Hokkaido",
    beds: 3, size: "811 sq ft", built: "1976", parking: "None",
    notes: "A diamond-in-the-rough on the Hokkaido coast. Muroran is an industrial port city with dramatic cliff scenery and easy access to the rest of Hokkaido. Renovation required.",
    isPremium: true,
    tags: ["coastal", "renovation-project", "hokkaido", "wooden"],
    images: [
      CDN + "692bb1c8e28e5340d87c2b76_1929011446_376x500.jpeg",
      CDN + "69398fc5f6891037223ca8c1_1931124888_500x348.jpeg",
      CDN + "692ba861878b06826a0b3982_1864238240_400x300.jpeg",
    ],
  },
  {
    slug: "seiyo-ehime-2036",
    price: "$2,036", priceNum: 2036, priceJPY: "~¥305,000",
    name: "Charming Home in Seiyo, Ehime",
    city: "Seiyo", prefecture: "Ehime", region: "Shikoku",
    beds: 2, size: "676 sq ft", built: "1975", parking: "None",
    notes: "Traditional 4DK with tatami rooms and shoji sliding doors. Quiet residential area in western Ehime. Renovation potential throughout.",
    isPremium: true,
    tags: ["tatami", "traditional", "shikoku", "ehime"],
    images: [
      CDN + "68b4ff5550a5f674d49240ce_1898044896_500x373.jpeg",
      CDN + "6843abc9f4876251e8af9b40_1870809824_500x375.jpeg",
      CDN + "6843a7411d1972f00f3cd729_1839309454_500x329%20(1).jpeg",
    ],
  },
  {
    slug: "sasebo-nagasaki-1900",
    price: "$2,695", priceNum: 2695, priceJPY: "~¥404,000",
    name: "Historic Akiya in Sasebo — Built 1900",
    city: "Sasebo", prefecture: "Nagasaki", region: "Kyushu",
    beds: 3, size: "637 sq ft", built: "1900", parking: "None",
    notes: "Over 125 years old. A piece of Japanese history for under $3,000. Sasebo is a coastal city in Nagasaki known for its harbor and island scenery.",
    isPremium: true,
    tags: ["historic", "coastal", "nagasaki", "renovation-project"],
    images: [
      CDN + "68226416157f51d450384603_1863404304_500x375%20(1).jpeg",
      CDN + "682f66dcc75e20e03e490b24_1864892493_500x375%20(1).jpeg",
      CDN + "68b4fc222fbb2acaddd349d8_1894188773_500x378.jpeg",
    ],
  },
  {
    slug: "kashiwazaki-niigata-2957",
    price: "$2,957", priceNum: 2957, priceJPY: "~¥443,000",
    name: "6DK Home in Kamijo, Kashiwazaki",
    city: "Kashiwazaki", prefecture: "Niigata", region: "Chubu",
    beds: 6, size: "2,277 sq ft", built: "1936", parking: "1 spot",
    notes: "A 90-year-old wooden Japanese home with a garden. Over 2,200 sq ft for under $3,000. Kashiwazaki sits on the Sea of Japan coast with bullet train access to Tokyo.",
    isPremium: true,
    tags: ["garden", "spacious", "historic", "niigata", "sea-of-japan"],
    images: [
      CDN + "690048833c4ba9b273bff6ff_1873316933_500x375.jpeg",
      CDN + "68225eb86d6e1c2f42053062_1862654851_500x374.jpeg",
      CDN + "6822615bd5680f649def05b5_76746847_0013%20(1).jpg",
    ],
  },
  {
    slug: "imizu-toyama-3427",
    price: "$3,427", priceNum: 3427, priceJPY: "~¥514,000",
    name: "7-Bedroom Village Escape in Imizu",
    city: "Imizu", prefecture: "Toyama", region: "Chubu",
    beds: 7, size: "1,275 sq ft", built: "1971", parking: "None",
    notes: "7 bedrooms for under $3,500. Imizu is part of Toyama, ranked #1 in Japan for quality of life multiple years running. Traditional Japanese countryside layout.",
    isPremium: true,
    tags: ["7-bedrooms", "countryside", "toyama", "livable-city"],
    images: [
      CDN + "68425b9b941092a788af2f05_image.jpeg",
      CDN + "68425ba8e1958c624250870f_77588848_0001.jpeg",
      CDN + "68425b9bf90b3bee393102d2_2.jpeg",
    ],
  },
  {
    slug: "joetsu-niigata-4042",
    price: "$4,042", priceNum: 4042, priceJPY: "~¥606,000",
    name: "Spacious Akiya in Joetsu",
    city: "Joetsu", prefecture: "Niigata", region: "Chubu",
    beds: 5, size: "1,274 sq ft", built: "1978", parking: "1 spot",
    notes: "Tatami rooms and traditional Japanese charm. Joetsu offers mountains, sea, and excellent skiing — gateway to Myoko and Hakuba resorts.",
    isPremium: true,
    tags: ["tatami", "mountains", "ski-country", "niigata"],
    images: [
      CDN + "6822615bd5680f649def05b5_76746847_0013%20(1).jpg",
      CDN + "690048833c4ba9b273bff6ff_1873316933_500x375.jpeg",
      CDN + "6939d71ab36f3191badb63b1_78978327_0001.jpg",
    ],
  },
  {
    slug: "ebino-miyazaki-4560",
    price: "$4,560", priceNum: 4560, priceJPY: "~¥684,000",
    name: "Ebino Hillside Hideaway",
    city: "Ebino", prefecture: "Miyazaki", region: "Kyushu",
    beds: 3, size: "896 sq ft", built: "1975", parking: "1 spot",
    notes: "Surrounded by nature with a large yard and mountain views. Ebino is a highland city near Kirishima National Park.",
    isPremium: true,
    tags: ["mountain-views", "large-yard", "national-park", "kyushu"],
    images: [
      CDN + "682f73308c335e18751973c9_1858226690_500x375%20(1).jpeg",
      CDN + "683f932586c4735ca0edb439_74784852_0001%20(1).jpg",
      CDN + "682f70ba30a050b551f2c296_76199375_0001%20(1).jpg",
    ],
  },
  {
    slug: "otaru-hokkaido-5122",
    price: "$5,122", priceNum: 5122, priceJPY: "~¥768,000",
    name: "Classic 4LDK Home in Otaru",
    city: "Otaru", prefecture: "Hokkaido", region: "Hokkaido",
    beds: 4, size: "1,208 sq ft", built: "Est. 1960s", parking: "1 spot",
    notes: "Quiet residential neighborhood in beloved Otaru. Famous for its snow canal, seafood, and glasswork — a top tourist destination and highly livable city.",
    isPremium: true,
    tags: ["otaru", "hokkaido", "coastal", "tourist-town"],
    images: [
      CDN + "692bb5a679b5875e1085ecff_1876961674_500x375%20(1).jpeg",
      CDN + "692bb3900fc65f366008a955_78823878_0001.jpg",
      CDN + "692ba861878b06826a0b3982_1864238240_400x300.jpeg",
    ],
  },
  {
    slug: "takikawa-hokkaido-6338",
    price: "$6,338", priceNum: 6338, priceJPY: "~¥950,000",
    name: "Two-Story Home Near Takikawa Station",
    city: "Takikawa", prefecture: "Hokkaido", region: "Hokkaido",
    beds: 4, size: "1,025 sq ft", built: "1973", parking: "None",
    notes: "Walk to the train station. Full ownership. Takikawa is known for glider aviation and rapeseed fields. Easy access to Sapporo by train.",
    isPremium: true,
    tags: ["train-access", "walkable", "hokkaido", "near-sapporo"],
    images: [
      CDN + "692ba6b8a2341150661aa58e_78812536_0001%20(1).jpg",
      CDN + "69398fc5f6891037223ca8c1_1931124888_500x348.jpeg",
      CDN + "692bb5a679b5875e1085ecff_1876961674_500x375%20(1).jpeg",
    ],
  },
  {
    slug: "kashiwazaki-niigata-6602",
    price: "$6,602", priceNum: 6602, priceJPY: "~¥990,000",
    name: "Cozy Akiya in Kashiwazaki — 3,195 sq ft",
    city: "Kashiwazaki", prefecture: "Niigata", region: "Chubu",
    beds: 7, size: "3,195 sq ft", built: "1974", parking: "2 spots",
    notes: "Over 3,000 sq ft for under $7,000. 7 bedrooms, 2 parking spots, near the Sea of Japan. One of the best value-per-sqft listings we've found.",
    isPremium: true,
    tags: ["best-value", "spacious", "7-bedrooms", "sea-of-japan", "niigata"],
    images: [
      CDN + "68225eb86d6e1c2f42053062_1862654851_500x374.jpeg",
      CDN + "690048833c4ba9b273bff6ff_1873316933_500x375.jpeg",
      CDN + "6822615bd5680f649def05b5_76746847_0013%20(1).jpg",
    ],
  },
  {
    slug: "saijo-ehime-7590",
    price: "$7,590", priceNum: 7590, priceJPY: "~¥1,138,000",
    name: "6DK Home in Saijo City",
    city: "Saijo", prefecture: "Ehime", region: "Shikoku",
    beds: 6, size: "1,919 sq ft", built: "1991", parking: "1 spot",
    notes: "One of the newer builds on our list (1991). Spacious 6-bedroom layout with a garden. Saijo is known for pure groundwater and traditional festivals.",
    isPremium: true,
    tags: ["newer-build", "garden", "shikoku", "ehime"],
    images: [
      CDN + "6843abc9f4876251e8af9b40_1870809824_500x375.jpeg",
      CDN + "68b4ff5550a5f674d49240ce_1898044896_500x373.jpeg",
      CDN + "6843a7411d1972f00f3cd729_1839309454_500x329%20(1).jpeg",
    ],
  },
  {
    slug: "kameoka-kyoto-9827",
    price: "$9,827", priceNum: 9827, priceJPY: "¥1,500,000",
    name: "4DK Home Near Kyoto in Kameoka City",
    city: "Kameoka", prefecture: "Kyoto", region: "Kansai",
    beds: 4, size: "810 sq ft", built: "1977", parking: "3 spots",
    notes: "Kyoto Prefecture for under $10,000. Kameoka is 20 minutes from central Kyoto by train. Garden + 3 parking spots. Budget-friendly entry into one of Japan's most desirable prefectures.",
    isPremium: true,
    tags: ["kyoto", "near-kyoto", "garden", "kansai", "train-access"],
    images: [
      CDN + "68fa75e06895d9ea45765e1a_kyotooct23.jpeg",
      CDN + "68fa7a19d3cfa4e656c61552_kyotooct231.jpg",
      CDN + "68fa75d3c02a38ff4e328e40_kyotooct10232.jpg",
    ],
  },
  {
    slug: "kurayoshi-tottori-6332",
    price: "$6,332", priceNum: 6332, priceJPY: "¥1,000,000",
    name: "5DK Two-Story House in Kurayoshi",
    city: "Kurayoshi", prefecture: "Tottori", region: "Chugoku",
    beds: 5, size: "1,119 sq ft", built: "1983", parking: "1 spot",
    notes: "¥1,000,000. Includes a storehouse. Acquisition subsidy up to ¥400,000 available from local government. Note: major floor and plumbing repairs needed.",
    isPremium: true,
    tags: ["subsidy-available", "storehouse", "renovation-project", "tottori"],
    images: [
      CDN + "683f932586c4735ca0edb439_74784852_0001%20(1).jpg",
      CDN + "682f70ba30a050b551f2c296_76199375_0001%20(1).jpg",
      CDN + "682f6d76fe831de38d037ebe_77544680_0001%20(1).jpg",
    ],
  },
];

export function getListing(slug: string): Listing | undefined {
  return listings.find((l) => l.slug === slug);
}

export function getFreeListing(): Listing[] {
  return listings.filter((l) => !l.isPremium).slice(0, 6);
}
