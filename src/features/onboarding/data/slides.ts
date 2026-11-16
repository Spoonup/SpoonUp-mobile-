// Static onboarding copy from the Claude Design handoff (6s). Content, not API data.
export type OnboardingSlide = {
  image: number;
  tag: string;
  tagColor: string;
  headline: string;
  body: string;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    image: require('../../../assets/images/lifestyle/eat-now.jpg'),
    tag: 'MADE THIS MORNING',
    tagColor: '#4A5D2E',
    headline: 'Real food, at your door in ~35 min.',
    body: 'Chia puddings, smoothies and air-fried snacks, cooked fresh in our Koramangala kitchen.',
  },
  {
    image: require('../../../assets/images/lifestyle/week-jars.jpg'),
    tag: '30-DAY PLAN',
    tagColor: '#1B2A18',
    headline: 'Pay once. Your jar, every morning.',
    body: 'Prepay a 30-day plan in one payment. It ends on its own after 30 days and never charges you again.',
  },
];
