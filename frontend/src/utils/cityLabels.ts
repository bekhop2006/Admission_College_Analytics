/** Map internal city keys to readable Russian labels for the UI. */
const CITY_LABELS: Record<string, string> = {
  Astana: 'Астана',
  Almaty: 'Алматы',
  Shymkent: 'Шымкент',
  Karaganda: 'Караганда',
  Kokshetau: 'Кокшетау',
  Aktobe: 'Актобе',
  Atyrau: 'Атырау',
  Uralsk: 'Уральск',
  Taraz: 'Тараз',
  Kostanay: 'Костанай',
  Kyzylorda: 'Кызылорда',
  Aktau: 'Актау',
  Pavlodar: 'Павлодар',
  Petropavl: 'Петропавловск',
  'Ust-Kamenogorsk': 'Усть-Каменогорск',
  Turkestan: 'Туркестан',
  Semey: 'Семей',
  Taldykorgan: 'Талдыкорган',
  Zhezkazgan: 'Жезказган',
  Kaskelen: 'Каскелен',
  Kazakhstan: 'Казахстан',
}

/** Return a human-readable city name for display in the UI. */
export function formatCity(city: string): string {
  return CITY_LABELS[city] ?? city
}
