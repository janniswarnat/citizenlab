import 'services/appConfiguration';

declare module 'services/appConfiguration' {
  export interface THomepageBannerLayoutMap {
    layout_1: 'layout_1';
    layout_2: 'layout_2';
    layout_3: 'layout_3';
  }

  type THomepageBannerLayout = THomepageBannerLayoutMap[keyof THomepageBannerLayoutMap];

  interface IAppConfigurationSettings {
    customizable_homepage_banner: {
      allowed: boolean;
      enabled: boolean;
      layout: THomepageBannerLayout | null;
    };
  }
}
