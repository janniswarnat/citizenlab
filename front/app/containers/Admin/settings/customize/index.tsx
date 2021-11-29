import React, { PureComponent } from 'react';
import { Subscription, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { get, has, isEmpty, omitBy } from 'lodash-es';

// components
import {
  Section,
  SectionTitle,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import ErrorMessage from 'components/UI/Error';
import {
  Setting,
  StyledToggle,
  ToggleLabel,
  LabelContent,
  LabelTitle,
  LabelDescription,
} from '../general';
import FeatureFlag from 'components/FeatureFlag';
import Branding from './Branding';
import Header from './Header';
import ProjectHeader from './ProjectHeader';

// resources
import GetPage, { GetPageChildProps } from 'resources/GetPage';

// style
import styled, { withTheme } from 'styled-components';

// utils
import { convertUrlToUploadFileObservable } from 'utils/fileUtils';
import getSubmitState from 'utils/getSubmitState';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// services
import { localeStream } from 'services/locale';
import {
  currentAppConfigurationStream,
  updateAppConfiguration,
  IUpdatedAppConfigurationProperties,
  IAppConfiguration,
  IAppConfigurationSettings,
} from 'services/appConfiguration';
import { updatePage } from 'services/pages';

// typings
import { CLError, UploadFile, Locale, Multiloc } from 'typings';

import { isCLErrorJSON } from 'utils/errorUtils';
import Outlet from 'components/Outlet';

export const ColorPickerSectionField = styled(SectionField)``;

export const WideSectionField = styled(SectionField)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
`;

export const EventsToggleSectionField = styled(SectionField)`
  margin: 0;
`;

const EventsSectionTitle = styled(SectionTitle)`
  margin-bottom 30px;
`;

const EventsSection = styled(Section)`
  margin-bottom 20px;
`;

interface DataProps {
  homepageInfoPage: GetPageChildProps;
}

interface InputProps {
  lang: string;
  theme: any;
}

interface Props extends DataProps, InputProps {}

interface IAttributesDiff {
  settings?: Partial<IAppConfigurationSettings>;
  homepage_info?: Multiloc;
  logo?: UploadFile;
  header_bg?: UploadFile;
}

interface State {
  locale: Locale | null;
  attributesDiff: IAttributesDiff;
  tenant: IAppConfiguration | null;
  logo: UploadFile[] | null;
  header_bg: UploadFile[] | null;
  loading: boolean;
  errors: { [fieldName: string]: CLError[] };
  saved: boolean;
  logoError: string | null;
  headerError: string | null;
  titleError: Multiloc;
  settings: Partial<IAppConfigurationSettings>;
  subtitleError: Multiloc;
}

class SettingsCustomizeTab extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      attributesDiff: {},
      tenant: null,
      logo: null,
      header_bg: null,
      loading: false,
      errors: {},
      saved: false,
      logoError: null,
      headerError: null,
      titleError: {},
      subtitleError: {},
      settings: {},
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const tenant$ = currentAppConfigurationStream().observable;

    this.subscriptions = [
      combineLatest([locale$, tenant$])
        .pipe(
          switchMap(([locale, tenant]) => {
            const logoUrl = get(tenant, 'data.attributes.logo.large', null);
            const headerUrl = get(
              tenant,
              'data.attributes.header_bg.large',
              null
            );
            const settings = get(tenant, 'data.attributes.settings', {});

            const logo$ = logoUrl
              ? convertUrlToUploadFileObservable(logoUrl, null, null)
              : of(null);
            const headerBg$ = headerUrl
              ? convertUrlToUploadFileObservable(headerUrl, null, null)
              : of(null);

            return combineLatest([logo$, headerBg$]).pipe(
              map(([tenantLogo, tenantHeaderBg]) => ({
                locale,
                tenant,
                tenantLogo,
                tenantHeaderBg,
                settings,
              }))
            );
          })
        )
        .subscribe(
          ({ locale, tenant, tenantLogo, tenantHeaderBg, settings }) => {
            const logo = !isNilOrError(tenantLogo) ? [tenantLogo] : [];
            const header_bg = !isNilOrError(tenantHeaderBg)
              ? [tenantHeaderBg]
              : [];
            this.setState({ locale, tenant, logo, header_bg, settings });
          }
        ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subsription) => subsription.unsubscribe());
  }

  handleUploadOnAdd = (name: 'logo' | 'header_bg' | 'favicon') => (
    newImage: UploadFile[]
  ) => {
    this.setState((state) => ({
      ...state,
      logoError: name === 'logo' ? null : state.logoError,
      headerError: name === 'header_bg' ? null : state.headerError,
      [name]: [newImage[0]],
      attributesDiff: {
        ...(state.attributesDiff || {}),
        [name]: newImage[0].base64,
      },
    }));
  };

  handleUploadOnRemove = (name: 'logo' | 'header_bg') => () => {
    this.setState((state) => ({
      ...state,
      logoError: name === 'logo' ? null : state.logoError,
      headerError: name === 'header_bg' ? null : state.headerError,
      [name]: null,
      attributesDiff: {
        ...(state.attributesDiff || {}),
        [name]: null,
      },
    }));
  };

  validate = (tenant: IAppConfiguration, attributesDiff: IAttributesDiff) => {
    const { formatMessage } = this.props.intl;
    const hasRemoteLogo = has(tenant, 'data.attributes.logo.large');
    const localLogoIsNotSet = !has(attributesDiff, 'logo');
    const localLogoIsNull = !localLogoIsNotSet && attributesDiff.logo === null;
    const logoError =
      !localLogoIsNull || (hasRemoteLogo && localLogoIsNotSet)
        ? null
        : formatMessage(messages.noLogo);
    const hasRemoteHeader = has(tenant, 'data.attributes.header_bg.large');
    const localHeaderIsNotSet = !has(attributesDiff, 'header_bg');
    const localHeaderIsNull =
      !localHeaderIsNotSet && attributesDiff.header_bg === null;
    const headerError =
      !localHeaderIsNull || (hasRemoteHeader && localHeaderIsNotSet)
        ? null
        : formatMessage(messages.noHeader);
    const hasTitleError = !isEmpty(omitBy(this.state.titleError, isEmpty));
    const hasSubtitleError = !isEmpty(
      omitBy(this.state.subtitleError, isEmpty)
    );

    this.setState({ logoError, headerError });

    return !logoError && !headerError && !hasTitleError && !hasSubtitleError;
  };

  save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { tenant, attributesDiff } = this.state;
    const { homepageInfoPage } = this.props;

    if (tenant && this.validate(tenant, attributesDiff)) {
      this.setState({ loading: true, saved: false });

      try {
        await updateAppConfiguration(
          attributesDiff as IUpdatedAppConfigurationProperties
        );

        if (!isNilOrError(homepageInfoPage)) {
          const homepageInfoPageId = homepageInfoPage.id;

          if (attributesDiff.homepage_info) {
            const homepageInfoPageMultiloc = attributesDiff.homepage_info;
            await updatePage(homepageInfoPageId, {
              body_multiloc: homepageInfoPageMultiloc,
            });
          }
        }
        this.setState({ loading: false, saved: true, attributesDiff: {} });
      } catch (error) {
        if (isCLErrorJSON(error)) {
          this.setState({ loading: false, errors: error.json.errors });
        } else {
          this.setState({ loading: false, errors: error });
        }
      }
    }
  };

  getSetting = (setting: string) => {
    return (
      get(this.state.attributesDiff, `settings.${setting}`) ??
      get(this.state.tenant, `data.attributes.settings.${setting}`)
    );
  };

  handleCustomSectionMultilocOnChange = (
    homepageInfoPageMultiloc: Multiloc
  ) => {
    this.setState((state) => ({
      attributesDiff: {
        ...(state.attributesDiff || {}),
        homepage_info: homepageInfoPageMultiloc,
      },
    }));
  };

  handleCoreMultilocSettingOnChange = (propertyName: string) => (
    multiloc: Multiloc
  ) => {
    this.setState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...state.settings,
            ...get(state.attributesDiff, 'settings', {}),
            core: {
              ...get(state.settings, 'core', {}),
              ...get(state.attributesDiff, 'settings.core', {}),
              [propertyName]: multiloc,
            },
          },
        },
      };
    });
  };

  /*
  Below values are intentionally defined outside of render() for better performance
  because references stay the handleEnabledOnChangesame this way, e.g. onClick={this.handleLogoOnAdd} vs onClick={this.handleUploadOnAdd('logo')},
  and therefore do not trigger unneeded rerenders which would otherwise noticably slow down text input in the form
  */
  handleLogoOnAdd = this.handleUploadOnAdd('logo');
  handleHeaderBgOnAdd = this.handleUploadOnAdd('header_bg');
  handleLogoOnRemove = this.handleUploadOnRemove('logo');
  handleHeaderBgOnRemove = this.handleUploadOnRemove('header_bg');

  handleToggleEventsPage = () => {
    const { tenant } = this.state;
    if (!tenant?.data.attributes.settings.events_page) return;

    const previousValue = this.getSetting('events_page.enabled');

    this.setState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...state.settings,
            ...get(state.attributesDiff, 'settings', {}),
            events_page: {
              ...get(state.settings, 'events_page', {}),
              ...get(state.attributesDiff, 'settings.events_page', {}),
              enabled: !previousValue,
            },
          },
        },
      };
    });
  };

  handleToggleEventsWidget = () => {
    const { tenant } = this.state;
    if (!tenant?.data.attributes.settings.events_widget) return;

    const previousValue = this.getSetting('events_widget.enabled');

    this.setState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...state.settings,
            ...get(state.attributesDiff, 'settings', {}),
            events_widget: {
              ...get(state.settings, 'events_widget', {}),
              ...get(state.attributesDiff, 'settings.events_widget', {}),
              enabled: !previousValue,
            },
          },
        },
      };
    });
  };

  render() {
    const { locale, tenant } = this.state;
    const { formatMessage } = this.props.intl;

    if (!isNilOrError(locale) && !isNilOrError(tenant)) {
      const { homepageInfoPage } = this.props;
      const {
        logo,
        header_bg,
        attributesDiff,
        logoError,
        headerError,
        titleError,
        subtitleError,
        errors,
        saved,
      } = this.state;

      const latestAppConfigStyleSettings = {
        ...tenant.data.attributes,
        ...attributesDiff,
      }.style;

      const latestAppConfigCoreSettings = {
        ...tenant.data.attributes,
        ...attributesDiff,
      }.settings.core;

      return (
        <form onSubmit={this.save}>
          <Branding
            logo={logo}
            logoError={logoError}
            setParentState={this.setState}
            getSetting={this.getSetting}
            handleLogoOnAdd={this.handleLogoOnAdd}
            handleLogoOnRemove={this.handleLogoOnRemove}
          />

          <Header
            header_bg={header_bg}
            headerError={headerError}
            titleError={titleError}
            subtitleError={subtitleError}
            latestAppConfigStyleSettings={latestAppConfigStyleSettings}
            latestAppConfigCoreSettings={latestAppConfigCoreSettings}
            setParentState={this.setState}
            handleHeaderBgOnAdd={this.handleHeaderBgOnAdd}
            handleHeaderBgOnRemove={this.handleHeaderBgOnRemove}
            handleCoreMultilocSettingOnChange={
              this.handleCoreMultilocSettingOnChange
            }
          />

          <ProjectHeader
            currentlyWorkingOnText={
              latestAppConfigCoreSettings?.['currently_working_on_text']
            }
            onChangeCurrentlyWorkingOnText={this.handleCoreMultilocSettingOnChange(
              'currently_working_on_text'
            )}
          />

          <Section key="homepage_customizable_section">
            <SubSectionTitle>
              <FormattedMessage {...messages.homePageCustomizableSection} />
            </SubSectionTitle>

            <WideSectionField>
              <QuillMultilocWithLocaleSwitcher
                id="custom-section"
                label={formatMessage(messages.customSectionLabel)}
                labelTooltipText={formatMessage(
                  messages.homePageCustomizableSectionTooltip
                )}
                valueMultiloc={
                  attributesDiff.homepage_info ||
                  get(homepageInfoPage, 'attributes.body_multiloc')
                }
                onChange={this.handleCustomSectionMultilocOnChange}
                withCTAButton
              />
              <ErrorMessage
                fieldName="homepage-info"
                apiErrors={errors['homepage-info']}
              />
            </WideSectionField>
          </Section>

          <FeatureFlag name="events_page" onlyCheckAllowed>
            <EventsSection>
              <EventsSectionTitle>
                <FormattedMessage {...messages.eventsSection} />
              </EventsSectionTitle>

              <EventsToggleSectionField>
                <Setting>
                  <ToggleLabel>
                    <StyledToggle
                      checked={this.getSetting('events_page.enabled')}
                      onChange={this.handleToggleEventsPage}
                    />
                    <LabelContent>
                      <LabelTitle>
                        {formatMessage(messages.eventsPageSetting)}
                      </LabelTitle>
                      <LabelDescription>
                        {formatMessage(messages.eventsPageSettingDescription)}
                      </LabelDescription>
                    </LabelContent>
                  </ToggleLabel>
                </Setting>
              </EventsToggleSectionField>

              <Outlet
                id="app.containers.Admin.settings.customize.eventsSectionEnd"
                checked={this.getSetting('events_widget.enabled')}
                onChange={this.handleToggleEventsWidget}
              />
            </EventsSection>
          </FeatureFlag>

          <SubmitWrapper
            loading={this.state.loading}
            status={getSubmitState({ errors, saved, diff: attributesDiff })}
            messages={{
              buttonSave: messages.save,
              buttonSuccess: messages.saveSuccess,
              messageError: messages.saveErrorMessage,
              messageSuccess: messages.saveSuccessMessage,
            }}
          />
        </form>
      );
    }

    return null;
  }
}

const SettingsCustomizeTabWithHOCs = withTheme(
  injectIntl<Props>(SettingsCustomizeTab)
);

export default (inputProps: InputProps) => (
  <GetPage slug="homepage-info">
    {(page) => (
      <SettingsCustomizeTabWithHOCs homepageInfoPage={page} {...inputProps} />
    )}
  </GetPage>
);
