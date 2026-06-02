export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  supportedCountries: string[];
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
    supportedCountries: ['US'],
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: '﷼',
    decimals: 2,
    supportedCountries: ['SA'],
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    decimals: 2,
    supportedCountries: ['AE'],
  },
  EGP: {
    code: 'EGP',
    name: 'Egyptian Pound',
    symbol: 'E£',
    decimals: 2,
    supportedCountries: ['EG'],
  },
  TRY: {
    code: 'TRY',
    name: 'Turkish Lira',
    symbol: '₺',
    decimals: 2,
    supportedCountries: ['TR'],
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimals: 2,
    supportedCountries: ['DE', 'FR', 'IT', 'ES', 'PT', 'NL', 'BE', 'AT', 'IE', 'GR', 'FI'],
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    decimals: 2,
    supportedCountries: ['GB'],
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    decimals: 2,
    supportedCountries: ['CN'],
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    decimals: 0,
    supportedCountries: ['JP'],
  },
  KRW: {
    code: 'KRW',
    name: 'South Korean Won',
    symbol: '₩',
    decimals: 0,
    supportedCountries: ['KR'],
  },
  BRL: {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    decimals: 2,
    supportedCountries: ['BR'],
  },
};

export const DEFAULT_CURRENCY = 'USD';

export function getCurrencyByCountry(countryCode: string): CurrencyInfo {
  for (const currency of Object.values(SUPPORTED_CURRENCIES)) {
    if (currency.supportedCountries.includes(countryCode)) {
      return currency;
    }
  }
  return SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
}
