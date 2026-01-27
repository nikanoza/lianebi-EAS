import { useEffect } from 'react';
import { Platform } from 'react-native';
import { usePathname } from 'expo-router';
import ReactGA from 'react-ga4';

const TRACKING_ID = 'G-NGH2Q6JTHB';

const AnalyticsTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    if (!(window as any).GA_INITIALIZED) {
      ReactGA.initialize(TRACKING_ID);
      (window as any).GA_INITIALIZED = true;
    }

    ReactGA.send({
      hitType: 'pageview',
      page: pathname,
    });
  }, [pathname]);

  return null;
};

export default AnalyticsTracker;
