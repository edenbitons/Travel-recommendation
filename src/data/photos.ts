export interface TravelPhoto {
  id: string
  title: string
  location: string
  background: string
}

export const photos: TravelPhoto[] = [
  {
    id: 'new-york',
    title: 'אורות העיר',
    location: 'ניו יורק',
    background: 'linear-gradient(145deg, #10243b, #517fa5 52%, #f0ad70)',
  },
  {
    id: 'budapest',
    title: 'ערב על הדנובה',
    location: 'בודפשט',
    background: 'linear-gradient(145deg, #142d50, #d48258 58%, #f4d5a5)',
  },
  {
    id: 'thailand',
    title: 'בין האיים',
    location: 'תאילנד',
    background: 'linear-gradient(145deg, #1d7b91, #66c2bd 48%, #f3d37d)',
  },
  {
    id: 'athens',
    title: 'שקיעה בעיר העתיקה',
    location: 'אתונה',
    background: 'linear-gradient(145deg, #4c628e, #d08b67 55%, #f2d4a0)',
  },
  {
    id: 'corfu',
    title: 'כחול בלי סוף',
    location: 'קורפו',
    background: 'linear-gradient(145deg, #075b83, #39a7b3 52%, #c3e6cf)',
  },
  {
    id: 'playa',
    title: 'רגע של חופש',
    location: 'פלאיה דל כרמן',
    background: 'linear-gradient(145deg, #087b78, #67c3a0 48%, #f1d78d)',
  },
  {
    id: 'bansko',
    title: 'אוויר הרים',
    location: 'בנסקו',
    background: 'linear-gradient(145deg, #304a60, #91acb8 50%, #e8dfc7)',
  },
  {
    id: 'gudauri',
    title: 'פסגות מושלגות',
    location: 'גודאורי',
    background: 'linear-gradient(145deg, #567e9b, #d2e3e7 56%, #f7f3e8)',
  },
]
