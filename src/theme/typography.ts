// Font families match design/project CSS: DM Sans (UI), Instrument Serif
// (display/headlines), JetBrains Mono (kickers, tags, mono labels).
export const fontFamily = {
  sans: 'DMSans-Regular',
  sansMedium: 'DMSans-Medium',
  sansSemiBold: 'DMSans-SemiBold',
  sansBold: 'DMSans-Bold',
  serif: 'InstrumentSerif-Regular',
  serifItalic: 'InstrumentSerif-Italic',
  mono: 'JetBrainsMono-Medium',
} as const;

export const typography = {
  display: { fontFamily: fontFamily.serif, fontSize: 34, lineHeight: 37 },
  displayLarge: { fontFamily: fontFamily.serif, fontSize: 40, lineHeight: 44 },
  headline: { fontFamily: fontFamily.serif, fontSize: 29, lineHeight: 32 },
  title: { fontFamily: fontFamily.serif, fontSize: 28, lineHeight: 30 },

  body: { fontFamily: fontFamily.sans, fontSize: 13.5, lineHeight: 19 },
  bodySmall: { fontFamily: fontFamily.sans, fontSize: 12.5, lineHeight: 18 },
  label: { fontFamily: fontFamily.sansMedium, fontSize: 12.5, lineHeight: 16 },
  labelSmall: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 11,
    lineHeight: 14,
  },
  button: { fontFamily: fontFamily.sansMedium, fontSize: 14.5, lineHeight: 18 },
  heading: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },

  kicker: {
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    lineHeight: 13,
    letterSpacing: 1.2,
  },
  tag: {
    fontFamily: fontFamily.mono,
    fontSize: 9.5,
    lineHeight: 12,
    letterSpacing: 0.8,
  },
} as const;
