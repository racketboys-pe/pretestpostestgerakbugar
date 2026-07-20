import { AppTheme } from '../types';

export interface ThemeClasses {
  textPrimary: string;       // e.g. 'text-teal-600'
  bgPrimary: string;         // e.g. 'bg-teal-600'
  bgPrimaryHover: string;    // e.g. 'hover:bg-teal-700'
  bgAccent: string;          // e.g. 'bg-teal-50'
  textAccent: string;        // e.g. 'text-teal-700'
  borderAccent: string;      // e.g. 'border-teal-200'
  gradientHeader: string;    // e.g. 'from-emerald-600 via-teal-600 to-indigo-600'
  gradientButton: string;    // e.g. 'from-teal-600 to-emerald-600'
  badgeBg: string;           // e.g. 'bg-emerald-700/50'
  textMuted: string;         // e.g. 'text-slate-500'
  cardBg: string;            // e.g. 'bg-white'
  border: string;            // e.g. 'border-slate-100'
  darkCanvas: boolean;
  ringFocus: string;         // e.g. 'focus:ring-teal-500'
  borderFocus: string;       // e.g. 'focus:border-teal-500'
  inputBg: string;           // e.g. 'bg-slate-50'
  inputText: string;         // e.g. 'text-slate-800'
  optionActive: string;      // option button when active
  optionInactive: string;    // option button when inactive
  optionCircleActive: string;// option letter badge when active
  optionCircleInactive: string;// option letter badge when inactive
}

export const themeMap: Record<AppTheme, ThemeClasses> = {
  mint: {
    textPrimary: 'text-teal-600',
    bgPrimary: 'bg-teal-600',
    bgPrimaryHover: 'hover:bg-teal-700',
    bgAccent: 'bg-teal-50',
    textAccent: 'text-teal-700',
    borderAccent: 'border-teal-200',
    gradientHeader: 'from-emerald-600 via-teal-600 to-indigo-600',
    gradientButton: 'from-teal-600 to-emerald-600',
    badgeBg: 'bg-emerald-700/50',
    textMuted: 'text-slate-500',
    cardBg: 'bg-white',
    border: 'border-slate-100',
    darkCanvas: false,
    ringFocus: 'focus:ring-teal-500',
    borderFocus: 'focus:border-teal-500',
    inputBg: 'bg-slate-50',
    inputText: 'text-slate-800',
    optionActive: 'border-teal-500 bg-teal-50/50 shadow-sm ring-1 ring-teal-400/20',
    optionInactive: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-700',
    optionCircleActive: 'bg-teal-600 text-white',
    optionCircleInactive: 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
  },
  ocean: {
    textPrimary: 'text-blue-600',
    bgPrimary: 'bg-blue-600',
    bgPrimaryHover: 'hover:bg-blue-700',
    bgAccent: 'bg-blue-50',
    textAccent: 'text-blue-700',
    borderAccent: 'border-blue-200',
    gradientHeader: 'from-blue-600 via-sky-600 to-indigo-700',
    gradientButton: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-700/50',
    textMuted: 'text-slate-500',
    cardBg: 'bg-white',
    border: 'border-slate-100',
    darkCanvas: false,
    ringFocus: 'focus:ring-blue-500',
    borderFocus: 'focus:border-blue-500',
    inputBg: 'bg-slate-50',
    inputText: 'text-slate-800',
    optionActive: 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-400/20',
    optionInactive: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-700',
    optionCircleActive: 'bg-blue-600 text-white',
    optionCircleInactive: 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
  },
  sunset: {
    textPrimary: 'text-orange-600',
    bgPrimary: 'bg-orange-600',
    bgPrimaryHover: 'hover:bg-orange-700',
    bgAccent: 'bg-amber-50',
    textAccent: 'text-orange-700',
    borderAccent: 'border-amber-200',
    gradientHeader: 'from-amber-500 via-orange-500 to-rose-600',
    gradientButton: 'from-amber-500 to-rose-500',
    badgeBg: 'bg-amber-700/50',
    textMuted: 'text-slate-500',
    cardBg: 'bg-white',
    border: 'border-slate-100',
    darkCanvas: false,
    ringFocus: 'focus:ring-orange-500',
    borderFocus: 'focus:border-orange-500',
    inputBg: 'bg-slate-50',
    inputText: 'text-slate-800',
    optionActive: 'border-orange-500 bg-amber-50/50 shadow-sm ring-1 ring-orange-400/20',
    optionInactive: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-700',
    optionCircleActive: 'bg-orange-600 text-white',
    optionCircleInactive: 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
  },
  cosmic: {
    textPrimary: 'text-violet-400',
    bgPrimary: 'bg-violet-600',
    bgPrimaryHover: 'hover:bg-violet-500',
    bgAccent: 'bg-violet-950/40',
    textAccent: 'text-violet-300',
    borderAccent: 'border-violet-850/50',
    gradientHeader: 'from-purple-900 via-indigo-950 to-slate-900',
    gradientButton: 'from-purple-600 to-indigo-600',
    badgeBg: 'bg-purple-950/80',
    textMuted: 'text-slate-400',
    cardBg: 'bg-slate-900',
    border: 'border-slate-800',
    darkCanvas: true,
    ringFocus: 'focus:ring-violet-500',
    borderFocus: 'focus:border-violet-500',
    inputBg: 'bg-slate-850',
    inputText: 'text-slate-200',
    optionActive: 'border-violet-500 bg-violet-950/40 shadow-sm ring-1 ring-violet-500/30',
    optionInactive: 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 bg-slate-900 text-slate-300',
    optionCircleActive: 'bg-violet-500 text-white',
    optionCircleInactive: 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
  },
  lavender: {
    textPrimary: 'text-purple-600',
    bgPrimary: 'bg-purple-600',
    bgPrimaryHover: 'hover:bg-purple-700',
    bgAccent: 'bg-purple-50',
    textAccent: 'text-purple-700',
    borderAccent: 'border-purple-200',
    gradientHeader: 'from-purple-600 via-fuchsia-600 to-indigo-600',
    gradientButton: 'from-purple-600 to-fuchsia-600',
    badgeBg: 'bg-purple-700/50',
    textMuted: 'text-slate-500',
    cardBg: 'bg-white',
    border: 'border-slate-100',
    darkCanvas: false,
    ringFocus: 'focus:ring-purple-500',
    borderFocus: 'focus:border-purple-500',
    inputBg: 'bg-slate-50',
    inputText: 'text-slate-800',
    optionActive: 'border-purple-500 bg-purple-50/50 shadow-sm ring-1 ring-purple-400/20',
    optionInactive: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-700',
    optionCircleActive: 'bg-purple-600 text-white',
    optionCircleInactive: 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
  }
};
