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
  display: { fontFamily: fontFamily.serif, fontSize: 36, lineHeight: 37 },
  displayLarge: { fontFamily: fontFamily.serif, fontSize: 40, lineHeight: 44 },
  headline: { fontFamily: fontFamily.serif, fontSize: 30, lineHeight: 33 },
  title: { fontFamily: fontFamily.serif, fontSize: 34, lineHeight: 36 },
  titleCard: { fontFamily: fontFamily.serif, fontSize: 23, lineHeight: 28 },
  // Instrument Serif has no ₹ glyph, so amounts use DM Sans.
  amount: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.26,
  },
  bodyLarge: { fontFamily: fontFamily.sans, fontSize: 16, lineHeight: 24 },

  body: { fontFamily: fontFamily.sans, fontSize: 13.5, lineHeight: 19 },
  bodySmall: { fontFamily: fontFamily.sans, fontSize: 12.5, lineHeight: 18 },
  label: { fontFamily: fontFamily.sansMedium, fontSize: 12.5, lineHeight: 16 },
  labelSmall: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 11.5,
    lineHeight: 15,
  },
  button: { fontFamily: fontFamily.sansMedium, fontSize: 14, lineHeight: 18 },
  // The site never uses 600/700: headings are DM Sans 500.
  heading: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 15,
    lineHeight: 20,
  },
  price: { fontFamily: fontFamily.sansMedium, fontSize: 17, lineHeight: 22 },

  kicker: {
    fontFamily: fontFamily.mono,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2.2,
  },
  tag: {
    fontFamily: fontFamily.mono,
    fontSize: 9.5,
    lineHeight: 12,
    letterSpacing: 0.95,
  },
} as const;
