// Google Analytics events
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

// Page view tracking
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_path: url,
    });
  }
};

// Custom event tracking
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Booking events
export const trackBookingStarted = (bookingType: string) => {
  event({
    action: 'booking_started',
    category: 'Booking',
    label: bookingType,
  });
};

export const trackBookingCompleted = (bookingType: string, value: number) => {
  event({
    action: 'booking_completed',
    category: 'Booking',
    label: bookingType,
    value: value,
  });

  // Google Ads conversion tracking
  if (typeof window !== 'undefined' && window.gtag && GOOGLE_ADS_ID) {
    window.gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/CONVERSION_LABEL`,
      value: value,
      currency: 'EUR',
    });
  }
};

export const trackTourViewed = (tourName: string) => {
  event({
    action: 'tour_viewed',
    category: 'Tours',
    label: tourName,
  });
};

export const trackSearchPerformed = (searchQuery: string) => {
  event({
    action: 'search',
    category: 'Search',
    label: searchQuery,
  });
};

export const trackContactFormSubmitted = () => {
  event({
    action: 'contact_form_submitted',
    category: 'Contact',
  });
};

export const trackNewsletterSignup = () => {
  event({
    action: 'newsletter_signup',
    category: 'Newsletter',
  });
};

// Declare gtag on window
declare global {
  interface Window {
    gtag: (
      command: string,
      target: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}
