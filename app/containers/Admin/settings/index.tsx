import React from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

type Props = {};

type State = {};

class SettingsPage extends React.PureComponent<Props & InjectedIntlProps, State> {

  render() {
    const { children } = this.props;
    const { formatMessage } = this.props.intl;

    const tabs = [
      { label: formatMessage(messages.tabSettings), url: '/admin/settings/general' },
      { label: formatMessage(messages.tabCustomize), url: '/admin/settings/customize' },
      { label: formatMessage(messages.tabPages), url: '/admin/settings/pages' },
      { label: formatMessage(messages.tabRegistration), url: '/admin/settings/registration' },
      { label: formatMessage(messages.tabAreas), url: '/admin/settings/areas' },
    ];

    const resource = {
      title: formatMessage(messages.viewPublicResource)
    };

    return (
      <TabbedResource
        resource={resource}
        messages={messages}
        tabs={tabs}
      >
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {children}
      </TabbedResource>
    );
  }
}

export default injectIntl<Props>(SettingsPage);
