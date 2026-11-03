// src/data/recommendations.ts
// ההמלצות שלי, מתוך הרשימות השמורות בגוגל מפס.
// googleRating = הדירוג בגוגל מפס (נכון לצילום המסך, 3/11/2026).
// mustGo = הסימון האישי שלי: 👑 חובה. כל השאר 👍 שווה.
// note = טיפ קצר (רובם מההערות שכתבתי בגוגל מפס). אפשר להוסיף עוד!

export type Category =
  | 'restaurant'
  | 'cafe'
  | 'hotel'
  | 'shopping'
  | 'attraction'
  | 'nightlife'
  | 'wellness';

export const CATEGORY_LABELS: Record<Category, string> = {
  restaurant: 'מסעדות',
  cafe: 'קפה וקינוחים',
  hotel: 'מלונות',
  shopping: 'קניות',
  attraction: 'אטרקציות',
  nightlife: 'ברים ומסיבות',
  wellness: 'ספא ועיסויים',
};

export interface Destination {
  id: string;
  name: string; // שם בעברית, לתצוגה
  nameEn: string; // שם באנגלית, לחיפוש בגוגל מפס
  countryCode: string; // cca3 – מקשר למדינה מ-REST Countries
  intro?: string; // כמה מילים שלי על היעד – מוצג בעמוד היעד
  photos?: string[]; // מזהי תמונות (id) מתוך src/data/photos.ts – מוצגות בעמוד היעד
}

export interface Recommendation {
  id: string;
  name: string;
  destinationId: string;
  category: Category;
  googleRating: number; // הדירוג בגוגל מפס
  mustGo?: boolean; // 👑 הסימון האישי שלי: "חובה". בלי הסימון = 👍 "שווה"
  note?: string;
}

export const destinations: Destination[] = [
  { id: 'new-york', name: 'ניו יורק', nameEn: 'New York', countryCode: 'USA', intro: `ידעתם שאפשר להתאהב בעיר?\nניו יורק, עיר האפשרויות. העיר שמתהלכים בה ומרגישים כמו נמלה בין גורדי השחקים, עם קולינריה בלתי נגמרת וסטייל בכל פינה.\nטיילתי חמישה ימים בניו יורק בכריסמס, ולא שבעתי ממנה. כל יום הסתכם בעשרות אלפי צעדים ובבטן מלאה באוכל טעים.\nהרכבת התחתית והרגליים הן הדרך הכי טובה וקלה להתנייד בעיר.\nלא לוותר על מחזמר טוב (אפשר לסגור גם בספונטניות, לא חייבים הרבה זמן מראש) ועל פיקניק בסנטרל פארק.\nכל ההמלצות שריכזתי לכם נלקחו ממי שיודע הכי טוב – חבר טוב שלי שהוא דייל באל על (אבל אל תספרו לו).\nתעשו לעצמכם טוב ותכרטסו את עצמכם לשם!`, photos: ['new-york-brooklyn-bridge', 'new-york-times-square', 'new-york-street'] },
  { id: 'budapest', name: 'בודפשט', nameEn: 'Budapest', countryCode: 'HUN', intro: `אירופה קלאסית ומהממת.\nממליצה על בודפשט כיעד רומנטי לזוג, או לטיול עם חברות או עם אמא.\nביקרתי בבודפשט בכריסמס וטיילתי בין השווקים. אורות קישטו את העיר, ושוקו חם וקיורטוש היו בכל פינה.\nאטרקציות חמודות: הגלגל הענק, ושיט על הדנובה – הנהר שמחבר בין בודה לפשט.\nיש שופינג בשדרה המרכזית, בתי קפה מעולים, ברים עם קונספט מגניב, ומסאז' מעולה למי שאוהב להתפנק.\nאת כל אלה ריכזתי לכם כאן, נגיש וקל!`, photos: [] },
  { id: 'bangkok', name: 'בנגקוק', nameEn: 'Bangkok', countryCode: 'THA', intro: '', photos: [] },
  { id: 'koh-phangan', name: 'קופנגן', nameEn: 'Koh Phangan', countryCode: 'THA', intro: '', photos: [] },
  { id: 'koh-tao', name: 'קו טאו', nameEn: 'Koh Tao', countryCode: 'THA', intro: '', photos: ['koh-phangan-snorkel', 'koh-phangan-beach', 'koh-phangan-road'] },
  { id: 'phuket', name: 'פוקט', nameEn: 'Phuket', countryCode: 'THA', intro: '', photos: [] },
  { id: 'athens', name: 'אתונה', nameEn: 'Athens', countryCode: 'GRC', intro: '', photos: ['athens-acropolis'] },
  { id: 'rhodes', name: 'רודוס', nameEn: 'Rhodes', countryCode: 'GRC', intro: '', photos: [] },
  { id: 'corfu', name: 'קורפו', nameEn: 'Corfu', countryCode: 'GRC', intro: '', photos: ['corfu-cliffs'] },
  // מקסיקו = יעד אחד: פלאיה דל כרמן, בקלאר, איסלה ופוארטו אסקונדידו. (id נשאר playa-del-carmen כדי לא לשבור את ההמלצות הקיימות)
  { id: 'playa-del-carmen', name: 'מקסיקו', nameEn: 'Playa del Carmen', countryCode: 'MEX', intro: '', photos: [] },
  { id: 'bansko', name: 'בנסקו', nameEn: 'Bansko', countryCode: 'BGR', intro: '', photos: ['bansko-aperol', 'bansko-slope'] },
  { id: 'gudauri', name: 'גודאורי', nameEn: 'Gudauri', countryCode: 'GEO', intro: '', photos: ['gudauri-snowboard', 'gudauri-snow'] }, // סקי – ההמלצות בדרך
];

// מלל אישי לכל מדינה שאני ממליצה עליה – כמה מילים שמופיעות בראש אזור ההמלצות בעמוד המדינה.
// המפתח הוא קוד המדינה (cca3). מדינה בלי טקסט (מחרוזת ריקה) פשוט לא מציגה את הקטע.
export const countryIntros: Record<string, string> = {
  USA: '', // TODO: עדן – כמה מילים על ניו יורק
  HUN: '', // TODO: עדן – כמה מילים על הונגריה
  THA: '', // TODO: עדן – כמה מילים על תאילנד
  GRC: '', // TODO: עדן – כמה מילים על יוון
  MEX: '', // TODO: עדן – כמה מילים על מקסיקו
  BGR: '', // TODO: עדן – כמה מילים על בולגריה
  GEO: '', // TODO: עדן – כמה מילים על גאורגיה
};

export const recommendations: Recommendation[] = [
  // ───────── ניו יורק ─────────
  { id: 'katzs-deli', name: "Katz's Delicatessen", destinationId: 'new-york', category: 'restaurant', googleRating: 4.5, note: 'מעדנייה יהודית' },
  { id: 'los-tacos-no1', name: 'Los Tacos No.1', destinationId: 'new-york', category: 'restaurant', googleRating: 4.8 },
  { id: 'joes-soup-dumplings', name: "Joe's Home of Soup Dumplings", destinationId: 'new-york', category: 'restaurant', googleRating: 4.5 },
  { id: 'prince-street-pizza', name: 'Prince Street Pizza', destinationId: 'new-york', category: 'restaurant', googleRating: 4.4 },
  { id: 'momofuku-noodle-bar', name: 'Momofuku Noodle Bar', destinationId: 'new-york', category: 'restaurant', googleRating: 4.2, note: 'ראמן' },
  { id: 'eataly-flatiron', name: 'Eataly Flatiron', destinationId: 'new-york', category: 'restaurant', googleRating: 4.4, note: 'לזניה, בהמלצת חברה' },
  { id: 'mad-dog-beans', name: 'Mad Dog & Beans Mexican Cantina', destinationId: 'new-york', category: 'restaurant', googleRating: 4.3, note: 'מרגריטות ב-4$' },
  { id: 'mary-os', name: "Mary O's", destinationId: 'new-york', category: 'restaurant', googleRating: 4.4, note: 'להזמין את לחמניית הסודה עם ריבה' },
  { id: 'levain-bakery', name: 'Levain Bakery', destinationId: 'new-york', category: 'cafe', googleRating: 4.7 },
  { id: 'van-leeuwen', name: 'Van Leeuwen Ice Cream', destinationId: 'new-york', category: 'cafe', googleRating: 4.4, note: 'גלידה (רשת)' },
  { id: 'juniors', name: "Junior's Restaurant & Bakery", destinationId: 'new-york', category: 'cafe', googleRating: 4.4 },
  { id: 'park-central-hotel', name: 'Park Central Hotel New York', destinationId: 'new-york', category: 'hotel', googleRating: 3.6 },
  { id: 'printemps-ny', name: 'Printemps New York', destinationId: 'new-york', category: 'shopping', googleRating: 4.3, note: 'חנות מהממת' },
  { id: 'brooklyn-charm', name: 'Brooklyn Charm', destinationId: 'new-york', category: 'shopping', googleRating: 4.8, note: 'בונים תכשיט בעצמך' },
  { id: 'woodbury-outlets', name: 'Woodbury Common Premium Outlets', destinationId: 'new-york', category: 'shopping', googleRating: 4.5 },
  { id: 'harry-potter-ny', name: 'Harry Potter Shop New York', destinationId: 'new-york', category: 'shopping', googleRating: 4.7 },
  { id: 'chelsea-market', name: 'Chelsea Market', destinationId: 'new-york', category: 'attraction', googleRating: 4.6, note: 'שוק אוכל' },
  { id: 'high-line', name: 'The High Line', destinationId: 'new-york', category: 'attraction', googleRating: 4.7, note: 'טיילת ליד ההדסון' },
  { id: 'summit-one-vanderbilt', name: 'SUMMIT One Vanderbilt', destinationId: 'new-york', category: 'attraction', googleRating: 4.7 },
  { id: 'the-met', name: 'The Metropolitan Museum of Art', destinationId: 'new-york', category: 'attraction', googleRating: 4.8 },
  { id: 'dead-rabbit', name: 'The Dead Rabbit', destinationId: 'new-york', category: 'nightlife', googleRating: 4.7, note: 'בר קוקטיילים לסיום הערב' },

  // ───────── בודפשט ─────────
  { id: 'fat-mama', name: 'Fat Mama Restaurant', destinationId: 'budapest', category: 'restaurant', googleRating: 4.8 },
  { id: 'tom-george', name: 'Tom George Osteria', destinationId: 'budapest', category: 'restaurant', googleRating: 4.7 },
  { id: 'a-la-maison', name: 'Á la Maison Breakfast and Brunch', destinationId: 'budapest', category: 'restaurant', googleRating: 4.4 },
  { id: 'cirkusz-cafe', name: 'Cirkusz Café', destinationId: 'budapest', category: 'cafe', googleRating: 4.7 },
  { id: 'gelarto-rosa', name: 'Gelarto Rosa Grande', destinationId: 'budapest', category: 'cafe', googleRating: 4.7 },
  { id: 'zoo-cafe', name: 'Zoo Café', destinationId: 'budapest', category: 'cafe', googleRating: 4.4 },
  { id: 'barcelo-budapest', name: 'Barceló Budapest', destinationId: 'budapest', category: 'hotel', googleRating: 4.7 },
  { id: 'westend', name: 'Westend Mall', destinationId: 'budapest', category: 'shopping', googleRating: 4.2 },
  { id: 'arena-mall', name: 'Arena Mall', destinationId: 'budapest', category: 'shopping', googleRating: 4.4 },
  { id: 'vaci-utca', name: 'Váci utca', destinationId: 'budapest', category: 'shopping', googleRating: 4.6 },
  { id: 'central-market-hall', name: 'Central Market Hall', destinationId: 'budapest', category: 'shopping', googleRating: 4.3 },
  { id: 'szechenyi-bath', name: 'Széchenyi Thermal Bath', destinationId: 'budapest', category: 'attraction', googleRating: 4.2 },
  { id: 'fishermans-bastion', name: "Fisherman's Bastion", destinationId: 'budapest', category: 'attraction', googleRating: 4.8 },
  { id: 'buda-castle', name: 'Buda Castle', destinationId: 'budapest', category: 'attraction', googleRating: 4.7 },
  { id: 'st-stephens', name: "St. Stephen's Basilica", destinationId: 'budapest', category: 'attraction', googleRating: 4.7 },
  { id: 'dohany-synagogue', name: 'Dohány Street Synagogue', destinationId: 'budapest', category: 'attraction', googleRating: 4.3 },
  { id: 'chain-bridge', name: 'Széchenyi Chain Bridge', destinationId: 'budapest', category: 'attraction', googleRating: 4.7 },
  { id: '360-bar', name: '360 Bar', destinationId: 'budapest', category: 'nightlife', googleRating: 4.3 },
  { id: 'spirit-thai-massage', name: 'Spirit Thai Massage', destinationId: 'budapest', category: 'wellness', googleRating: 4.6 },

  // ───────── בנגקוק ─────────
  { id: 'massilia', name: 'Massilia Italian Restaurant', destinationId: 'bangkok', category: 'restaurant', googleRating: 4.5 },
  { id: 'sushiro-emporium', name: 'Sushiro Thailand The Emporium', destinationId: 'bangkok', category: 'restaurant', googleRating: 4.4 },
  { id: 'isao', name: 'Isao', destinationId: 'bangkok', category: 'restaurant', googleRating: 4.6 },
  { id: 'bimbo-pizza', name: 'BIMBO Pizza & Josper', destinationId: 'bangkok', category: 'restaurant', googleRating: 4.8 },
  { id: 'kenns-ari', name: "Kenn's Ari", destinationId: 'bangkok', category: 'cafe', googleRating: 4.4 },
  { id: 'chillax-khaosan', name: 'Chillax Resort Khaosan', destinationId: 'bangkok', category: 'hotel', googleRating: 4.3 },
  { id: 'iconsiam', name: 'ICONSIAM', destinationId: 'bangkok', category: 'shopping', googleRating: 4.7 },
  { id: 'siam-paragon', name: 'Siam Paragon', destinationId: 'bangkok', category: 'shopping', googleRating: 4.5 },
  { id: 'centralworld', name: 'centralwOrld', destinationId: 'bangkok', category: 'shopping', googleRating: 4.5 },
  { id: 'siam-premium-outlets', name: 'Siam Premium Outlets Bangkok', destinationId: 'bangkok', category: 'shopping', googleRating: 4.4 },
  { id: 'the-speakeasy', name: 'The Speakeasy', destinationId: 'bangkok', category: 'nightlife', googleRating: 4.7 },
  { id: 'octave', name: 'Octave', destinationId: 'bangkok', category: 'nightlife', googleRating: 4.4 },
  { id: 'healthland', name: 'Healthland', destinationId: 'bangkok', category: 'wellness', googleRating: 4.6 },

  // ───────── קופנגן ─────────
  { id: 'sand-and-tan', name: 'Sand & Tan', destinationId: 'koh-phangan', category: 'restaurant', googleRating: 4.5 },
  { id: 'phangan-food-court', name: 'Phangan Food Court', destinationId: 'koh-phangan', category: 'restaurant', googleRating: 4.6 },
  { id: 'pum-pui', name: 'Pum Pui Restaurant', destinationId: 'koh-phangan', category: 'restaurant', googleRating: 4.7 },
  { id: 'chabad-koh-phangan', name: 'Chabad House Koh Phangan', destinationId: 'koh-phangan', category: 'restaurant', googleRating: 4.5 },
  { id: 'pura-vida', name: 'Pura Vida Cafe', destinationId: 'koh-phangan', category: 'cafe', googleRating: 4.6 },
  { id: 'the-factory-cafe', name: 'The Factory Cafe', destinationId: 'koh-phangan', category: 'cafe', googleRating: 4.6 },
  { id: 'phangan-cove', name: 'Phangan Cove', destinationId: 'koh-phangan', category: 'hotel', googleRating: 4.3 },
  { id: 'srithanu-beach', name: 'Srithanu Beach', destinationId: 'koh-phangan', category: 'attraction', googleRating: 4.5 },
  { id: 'secret-beach', name: 'Secret Beach', destinationId: 'koh-phangan', category: 'attraction', googleRating: 4.5 },
  { id: 'zen-beach', name: 'Zen Beach', destinationId: 'koh-phangan', category: 'attraction', googleRating: 4.5 },
  { id: 'oxa-jungle-party', name: 'OXA – Jungle Party', destinationId: 'koh-phangan', category: 'nightlife', googleRating: 4.8 },
  { id: 'lavella-spa', name: 'Lavella Spa', destinationId: 'koh-phangan', category: 'wellness', googleRating: 4.9 },

  // ───────── פוקט ─────────
  { id: 'chabad-phuket', name: 'Chabad House Phuket', destinationId: 'phuket', category: 'restaurant', googleRating: 4.8 },
  { id: 'movenpick-myth', name: 'Mövenpick Myth Hotel Patong Phuket', destinationId: 'phuket', category: 'hotel', googleRating: 4.7 },
  { id: 'chillva-market', name: 'Chillva Market', destinationId: 'phuket', category: 'shopping', googleRating: 4.4 },
  { id: 'cafe-del-mar-phuket', name: 'Café del Mar Phuket Beach Club', destinationId: 'phuket', category: 'nightlife', googleRating: 4.4 },

  // ───────── אתונה ─────────
  { id: 'tartufo', name: 'Tartufo Cucina Italiana', destinationId: 'athens', category: 'restaurant', googleRating: 4.4 },
  { id: 'brera-athens', name: 'Brera Athens', destinationId: 'athens', category: 'restaurant', googleRating: 4.6 },
  { id: 'hoocut', name: 'Hoocut', destinationId: 'athens', category: 'restaurant', googleRating: 4.3 },
  { id: 'krabo', name: 'Krabo', destinationId: 'athens', category: 'restaurant', googleRating: 4.2 },
  { id: 'usurum', name: 'Usurum', destinationId: 'athens', category: 'cafe', googleRating: 4.8 },
  { id: 'lukumades', name: 'Lukumades', destinationId: 'athens', category: 'cafe', googleRating: 4.5 },
  { id: 'ergon-house', name: 'ERGON House Athens', destinationId: 'athens', category: 'hotel', googleRating: 4.3 },
  { id: 'brown-lighthouse', name: 'Brown Lighthouse Athens', destinationId: 'athens', category: 'hotel', googleRating: 4.3 },
  { id: 'designer-outlet-athens', name: 'Designer Outlet Athens', destinationId: 'athens', category: 'shopping', googleRating: 4.5 },
  { id: 'acropolis', name: 'Acropolis', destinationId: 'athens', category: 'attraction', googleRating: 4.7 },
  { id: 'monastiraki', name: 'Monastiraki Square', destinationId: 'athens', category: 'attraction', googleRating: 4.5 },
  { id: 'vouliagmeni-lake', name: 'Vouliagmeni Lake', destinationId: 'athens', category: 'attraction', googleRating: 4.5 },
  { id: 'attic-urban-rooftop', name: 'Attic Urban Rooftop', destinationId: 'athens', category: 'nightlife', googleRating: 4.5 },
  { id: 'bolivar-beach-club', name: 'Bolivar Beach Club', destinationId: 'athens', category: 'nightlife', googleRating: 4.2 },

  // ───────── רודוס ─────────
  { id: 'il-borgo', name: 'Il Borgo', destinationId: 'rhodes', category: 'restaurant', googleRating: 4.7 },
  { id: 'sergios', name: "Sergio's", destinationId: 'rhodes', category: 'restaurant', googleRating: 4.7 },
  { id: 'amus-hotel', name: 'Amus Hotel & Spa', destinationId: 'rhodes', category: 'hotel', googleRating: 4.5 },
  { id: 'sheraton-rhodes', name: 'Sheraton Rhodes Resort', destinationId: 'rhodes', category: 'hotel', googleRating: 4.5 },
  { id: 'lindos-beach', name: 'Lindos Beach', destinationId: 'rhodes', category: 'attraction', googleRating: 4.5 },
  { id: 'plaka-beach-ladiko', name: 'Plaka Beach – Ladiko', destinationId: 'rhodes', category: 'attraction', googleRating: 4.4 },
  { id: 'tulum-beach-bar', name: 'Tulum Beach Bar Restaurant', destinationId: 'rhodes', category: 'nightlife', googleRating: 4.2 },

  // ───────── קורפו ─────────
  { id: 'mezen', name: 'MeZen Restaurant Corfu', destinationId: 'corfu', category: 'restaurant', googleRating: 4.7 },
  { id: 'margherita-corfu', name: 'Margherita Pizza Artigianale Corfu', destinationId: 'corfu', category: 'restaurant', googleRating: 4.7 },
  { id: 'vrachos', name: 'Vrachos Palaiokastritsa', destinationId: 'corfu', category: 'restaurant', googleRating: 4.2 },
  { id: 'limoncello', name: 'Limoncello', destinationId: 'corfu', category: 'restaurant', googleRating: 4.4 },
  { id: 'papagiorgis', name: 'Papagiorgis Patisserie-Gelateria', destinationId: 'corfu', category: 'cafe', googleRating: 4.8 },
  { id: 'rodostamo', name: 'Rodostamo Hotel & Spa', destinationId: 'corfu', category: 'hotel', googleRating: 4.7 },
  { id: 'porto-timoni', name: 'Porto Timoni Beach', destinationId: 'corfu', category: 'attraction', googleRating: 4.4 },
  { id: 'rovinia-beach', name: 'Rovinia Beach', destinationId: 'corfu', category: 'attraction', googleRating: 4.6 },
  { id: 'agios-spiridon', name: 'Agios Spiridon Beach', destinationId: 'corfu', category: 'attraction', googleRating: 4.4 },
  { id: 'alipa-port', name: 'Alipa Port', destinationId: 'corfu', category: 'attraction', googleRating: 4.5 },
  { id: 'la-grotta-bar', name: 'La Grotta Bar', destinationId: 'corfu', category: 'nightlife', googleRating: 4.4 },
  { id: 'sway-corfu', name: 'Sway Cocktail & Food Bar Corfu', destinationId: 'corfu', category: 'nightlife', googleRating: 4.4 },

  // ───────── פלאיה דל כרמן ─────────
  { id: 'ilios', name: 'Ilios – Greek Restaurant', destinationId: 'playa-del-carmen', category: 'restaurant', googleRating: 4.7 },
  { id: 'la-famiglia', name: 'La Famiglia', destinationId: 'playa-del-carmen', category: 'restaurant', googleRating: 4.7 },
  { id: 'moshe-cube', name: 'Moshe Cube', destinationId: 'playa-del-carmen', category: 'restaurant', googleRating: 4.8, note: 'כשר' },
  { id: 'chez-celine', name: 'Chez Céline', destinationId: 'playa-del-carmen', category: 'cafe', googleRating: 4.6 },
  { id: 'oh-my-brunch', name: 'Oh My Brunch', destinationId: 'playa-del-carmen', category: 'cafe', googleRating: 4.4 },
  { id: 'we-playa-hotel', name: 'We Playa Hotel – Adults Only', destinationId: 'playa-del-carmen', category: 'hotel', googleRating: 4.4 },
  { id: 'colectivo-tulum', name: 'Colectivo Station – Playa del Carmen to Tulum', destinationId: 'playa-del-carmen', category: 'attraction', googleRating: 4.4, note: 'מכאן יוצאים הוואנים לטולום' },

  // ───────── בנסקו ─────────
  { id: 'casa-di-papi', name: 'Casa di Papi', destinationId: 'bansko', category: 'restaurant', googleRating: 4.4 },
  { id: 'new-coffee-world', name: 'New Coffee World Bansko', destinationId: 'bansko', category: 'cafe', googleRating: 4.9 },
  { id: 'black-honey', name: 'Black Honey Specialty Coffee Shop', destinationId: 'bansko', category: 'cafe', googleRating: 4.9 },
  { id: 'lubanitza', name: 'Lubanitza', destinationId: 'bansko', category: 'cafe', googleRating: 4.5 },

  // ───────── גודאורי (גאורגיה) ─────────
  // TODO: עדן תשלח את המקומות
];
