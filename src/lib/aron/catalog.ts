// Studio catalog — Ahmed Al-Omrani

export type Locale = "ar" | "en";
export type Category = "bouquets" | "orchids" | "dried" | "bridal";
export type Occasion =
  | "love"
  | "thanks"
  | "newborn"
  | "grad"
  | "wedding"
  | "sympathy"
  | "apology";

export type Product = {
  slug: string;
  name: Record<Locale, string>;
  summary: Record<Locale, string>;
  story: Record<Locale, string>;
  stems: Record<Locale, string>;
  price: number;
  category: Category;
  occasions: Occasion[];
  image: string;
  featured: boolean;
};

export const products: Product[] = [
  {
    slug: "ward-qirmizi",
    name: { ar: "ورد الجوري القرمزي", en: "Crimson garden roses" },
    summary: {
      ar: "جوري كثيف بلون واضح، ملفوف بورق قطني غير لامع.",
      en: "Dense garden roses in a clear red, wrapped in matte cotton paper.",
    },
    story: {
      ar: "الباقة لمن يريد لوناً واحداً بدون زحمة. تُقصّ في الصباح وتُراجع على الطاولة قبل ما تطلع.",
      en: "One colour, no clutter. Cut in the morning and checked on the bench before it leaves.",
    },
    stems: { ar: "جوري حديقة، أوراق زيتون", en: "Garden roses, olive leaves" },
    price: 320,
    category: "bouquets",
    occasions: ["love", "apology"],
    image: "/flowers/ward-qirmizi.jpg",
    featured: true,
  },
  {
    slug: "dabab-abyad",
    name: { ar: "ضباب أبيض", en: "White mist" },
    summary: {
      ar: "حوذان وبزاليا عطرية بتغليف عاجي، خفيفة في اليد.",
      en: "Ranunculus and sweet peas in ivory wrap, light in the hand.",
    },
    story: {
      ar: "مناسبة للشكر وزيارة المولود. اللون هادئ والتغليف ما يغلب الورد.",
      en: "For thanks, and for a new baby. Quiet colour, paper that does not shout over the flowers.",
    },
    stems: { ar: "حوذان أبيض، بزاليا عطرية، يوكالبتوس", en: "White ranunculus, sweet pea, eucalyptus" },
    price: 280,
    category: "bouquets",
    occasions: ["thanks", "newborn"],
    image: "/flowers/dabab-abyad.jpg",
    featured: true,
  },
  {
    slug: "orkid-aron",
    name: { ar: "أوركيد أرون", en: "Aron orchid" },
    summary: {
      ar: "سنبلتا فالاينوبسيس في إناء خزفي قصير، تبقى أسابيع.",
      en: "Two phalaenopsis stems in a short ceramic cylinder. They last for weeks.",
    },
    story: {
      ar: "للمكتب أو طاولة الاستقبال. نرسلها ثابتة في الإناء، بدون تغليف ورقي يطيح في الطريق.",
      en: "For a desk or a reception table. It ships seated in the vessel, not in paper that collapses on the way.",
    },
    stems: { ar: "فالاينوبسيس أبيض، إناء خزفي", en: "White phalaenopsis, ceramic cylinder" },
    price: 460,
    category: "orchids",
    occasions: ["thanks", "grad"],
    image: "/flowers/orkid-aron.jpg",
    featured: true,
  },
  {
    slug: "hadiqat-khukh",
    name: { ar: "حديقة الخوخ", en: "Peach garden" },
    summary: {
      ar: "جوري خوخي وحوحان مشمشي مع ورق زيتون.",
      en: "Peach spray roses and apricot ranunculus with olive.",
    },
    story: {
      ar: "لون الموسم الدافئ. تطلع مرتبة بدون ما تصير دائرية زيادة عن اللزوم.",
      en: "The warm colour of the season. Arranged, but not forced into a perfect ball.",
    },
    stems: { ar: "جوري بخاخ، حوحان، زيتون", en: "Spray roses, ranunculus, olive" },
    price: 295,
    category: "bouquets",
    occasions: ["love", "grad", "wedding"],
    image: "/flowers/hadiqat-khukh.jpg",
    featured: true,
  },
  {
    slug: "ghasaq",
    name: { ar: "غسق البنفسج", en: "Dusk violet" },
    summary: {
      ar: "شقائق وليزيانثوس بنفسجي غامق، بورق ترابي.",
      en: "Anemones and lisianthus in deep violet, in earth paper.",
    },
    story: {
      ar: "باقة أغمق من بقية الرف. تصلح لاعتذار جاد أو هدية ما تبي تكون وردية.",
      en: "Darker than the rest of the bench. For a serious apology, or a gift that should not be pink.",
    },
    stems: { ar: "شقائق، ليزيانثوس، أوراق داكنة", en: "Anemones, lisianthus, dark foliage" },
    price: 340,
    category: "bouquets",
    occasions: ["love", "apology"],
    image: "/flowers/ghasaq.jpg",
    featured: false,
  },
  {
    slug: "raml",
    name: { ar: "رمل مجفّف", en: "Sand dried" },
    summary: {
      ar: "لاغورس ورَسكَس وسعف فاتح. تبقى شهوراً بدون ماء.",
      en: "Lagurus, ruscus, and pale palm. It keeps for months with no water.",
    },
    story: {
      ar: "للي يسافر أو يبي هدية ما تذبل بعد يومين. اللون رملي، قريب من ورق التغليف.",
      en: "For someone who travels, or a gift that should not wilt in two days. Sand-coloured, close to the paper.",
    },
    stems: { ar: "لاغورس، رَسكَس، سعف مجفف", en: "Lagurus, ruscus, dried palm" },
    price: 210,
    category: "dried",
    occasions: ["thanks", "grad"],
    image: "/flowers/raml.jpg",
    featured: false,
  },
  {
    slug: "tulip-rabi",
    name: { ar: "توليب الربيع", en: "Spring tulips" },
    summary: {
      ar: "توليب بلون الخدود، سيقان طويلة وتغليف عاجي.",
      en: "Blush tulips, long stems, ivory wrap.",
    },
    story: {
      ar: "موسم قصير. إذا ظهرت في المتجر فهي متوفرة هذا الأسبوع، وما نبدلها بورد آخر بدون ما نكلّمك.",
      en: "A short season. If it is on the shelf, it is in this week — we will not swap it for another flower without calling.",
    },
    stems: { ar: "توليب وردي", en: "Blush tulips" },
    price: 255,
    category: "bouquets",
    occasions: ["newborn", "grad", "thanks"],
    image: "/flowers/tulip-rabi.jpg",
    featured: false,
  },
  {
    slug: "zanbaq",
    name: { ar: "زنبق هادئ", en: "Quiet lilies" },
    summary: {
      ar: "ثلاثة زنابق بيضاء في إناء حجري منخفض.",
      en: "Three white lilies in a low stoneware vase.",
    },
    story: {
      ar: "تنسيق للتعزية والزيارة الهادئة. بدون شريط أسود وبدون عبارة جاهزة. البطاقة تكتبها أنت، أو نتركها فاضية.",
      en: "For condolence and a quiet visit. No black ribbon and no stock phrase. You write the card, or we leave it blank.",
    },
    stems: { ar: "زنبق شرقي أبيض، إناء حجري", en: "White oriental lilies, stoneware vase" },
    price: 375,
    category: "bouquets",
    occasions: ["sympathy", "thanks"],
    image: "/flowers/zanbaq.jpg",
    featured: false,
  },
  {
    slug: "farah",
    name: { ar: "باقة الفرح", en: "Joy mixed" },
    summary: {
      ar: "جوري مرجاني وستوك كريمي وورق زيتون.",
      en: "Coral roses, cream stock, and olive.",
    },
    story: {
      ar: "للتخرج والعزائم. ألوان دافئة، مو مبهرة زيادة. الحجم الكبير يكفي طاولة الوسط.",
      en: "For a graduation or a gathering. Warm, not loud. The grand size holds a centre table.",
    },
    stems: { ar: "جوري مرجاني، ستوك، زيتون", en: "Coral roses, stock, olive" },
    price: 305,
    category: "bouquets",
    occasions: ["grad", "wedding", "thanks"],
    image: "/flowers/farah.jpg",
    featured: true,
  },
  {
    slug: "arus",
    name: { ar: "باقة العروس", en: "Bridal cascade" },
    summary: {
      ar: "جوري أبيض وياسمين ولبلاب متدلٍّ. تُنسَّق حسب المقاس.",
      en: "White garden roses, jasmine, and trailing ivy. Tied to the size you choose.",
    },
    story: {
      ar: "مو كتالوج عرائس جاهز. نأكد الموعد قبلها بيومين، ونجهّز الباقة صباح المناسبة.",
      en: "Not a catalogue bridal set. We confirm two days ahead and build it the morning of the event.",
    },
    stems: { ar: "جوري أبيض، ياسمين، لبلاب", en: "White garden roses, jasmine, ivy" },
    price: 980,
    category: "bridal",
    occasions: ["wedding"],
    image: "/flowers/arus.jpg",
    featured: true,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((item) => item.slug === slug);
}

export function productsByOccasion(occasion: Occasion): Product[] {
  return products.filter((item) => item.occasions.includes(occasion));
}
