// Libraries
import React, { PureComponent } from 'react';
import { reject } from 'lodash-es';
import clHistory from 'utils/cl-router/history';

// Components
import GoBackButton from 'components/UI/GoBackButton';
import Button from 'components/UI/Button';
import TabbedResource, { TabProps } from 'components/admin/TabbedResource';

// Localisation
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { adopt } from 'react-adopt';
import GetFeatureFlag, { GetFeatureFlagChildProps } from 'resources/GetFeatureFlag';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { IProjectData } from 'services/projects';
import { Subscription } from 'rxjs';
import eventEmitter from 'utils/eventEmitter';

const TopContainer = styled.div`
  width: 100%;
  margin-top: -5px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const ActionsContainer = styled.div`
  display: flex;

  & > *:not(:last-child) {
    margin-right: 15px;
  }
`;

interface ITracks {
  clickNewIdea: ({ extra: object }) => void;
}

export type SetBackButtonUrl = string | null;
export const setBackButtonUrlEventName = 'setBackButtonUrl';

export interface InputProps {}

interface DataProps {
  surveys_enabled: boolean | null;
  typeform_enabled: boolean | null;
  customTopicsEnabled: GetFeatureFlagChildProps;
  phases: GetPhasesChildProps;
  project: GetProjectChildProps;
}

interface State {
  backButtonUrl: string | null;
}

interface Props extends InputProps, DataProps { }

export class AdminProjectEdition extends PureComponent<Props & InjectedIntlProps & InjectedLocalized & WithRouterProps & ITracks, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      backButtonUrl: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter.observeEvent<SetBackButtonUrl>(setBackButtonUrlEventName).subscribe(({ eventValue: backButtonUrl }) => {
        this.setState({ backButtonUrl });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getTabs = (projectId: string, project: IProjectData) => {
    const baseTabsUrl = `/admin/projects/${projectId}`;
    const { formatMessage } = this.props.intl;
    const { typeform_enabled, surveys_enabled, phases, customTopicsEnabled } = this.props;
    const processType = project.attributes.process_type;
    const participationMethod = project.attributes.participation_method;

    let tabs: TabProps[] = [
      {
        label: formatMessage(messages.generalTab),
        url: `${baseTabsUrl}/edit`,
        className: 'general',
      },
      {
        label: formatMessage(messages.descriptionTab),
        url: `${baseTabsUrl}/description`,
        className: 'description',
      },
      {
        label: formatMessage(messages.ideasTab),
        url: `${baseTabsUrl}/ideas`,
        className: 'ideas',
      },
      {
        label: formatMessage(messages.ideaFormTab),
        url: `${baseTabsUrl}/ideaform`,
        feature: 'idea_custom_fields',
        className: 'ideaform',
      },
      {
        label: formatMessage(messages.topicsTab),
        url: `${baseTabsUrl}/topics`,
        className: 'topics',
      },
      {
        label: formatMessage(messages.volunteeringTab),
        url: `${baseTabsUrl}/volunteering`,
        feature: 'volunteering',
        className: 'volunteering',
      },
      {
        label: formatMessage(messages.eventsTab),
        url: `${baseTabsUrl}/events`,
        className: 'events',
      },
      {
        label: formatMessage(messages.permissionsTab),
        url: `${baseTabsUrl}/permissions`,
        feature: 'private_projects',
        className: 'permissions',
      },
    ];

    if (processType === 'continuous' && participationMethod !== 'ideation' && participationMethod !== 'budgeting') {
      tabs = reject(tabs, { className: 'ideas' });
    }

    if ((processType === 'continuous' && participationMethod !== 'ideation' && participationMethod !== 'budgeting') ||
        (processType === 'timeline' && !isNilOrError(phases)
        && phases.filter(phase => phase.attributes.participation_method === 'ideation' || phase.attributes.participation_method === 'budgeting').length === 0)) {
      tabs = reject(tabs, { className: 'ideaform' });
    }

    if ((processType === 'continuous' && participationMethod !== 'volunteering') ||
        (processType === 'timeline' && !isNilOrError(phases)
        && phases.filter(phase => phase.attributes.participation_method === 'volunteering').length === 0)) {
      tabs = reject(tabs, { className: 'volunteering' });
    }

    if (processType === 'continuous' && participationMethod === 'poll' ||
        (processType === 'timeline' && !isNilOrError(phases)
        && phases.filter(phase => phase.attributes.participation_method === 'poll').length > 0)) {
      tabs.splice(3, 0, {
        label: formatMessage(messages.pollTab),
        url: `${baseTabsUrl}/poll`,
        feature: 'polls',
        className: 'poll',
      });
    }

    if (processType === 'timeline') {
      tabs.splice(4, 0, {
        label: formatMessage(messages.phasesTab),
        url: `${baseTabsUrl}/timeline`,
        className: 'phases',
      });
    }

    if (surveys_enabled && typeform_enabled) {
      if (
        (
          processType === 'continuous' &&
          participationMethod === 'survey' &&
          project.attributes.survey_service === 'typeform'
        )
        ||
        (
          processType === 'timeline' &&
          !isNilOrError(phases) && phases.filter(phase => {
            return phase.attributes.participation_method === 'survey' &&
                   phase.attributes.survey_service === 'typeform';
          }).length > 0
        )) {
        tabs.splice(3, 0, {
          label: formatMessage(messages.surveyResultsTab),
          url: `${baseTabsUrl}/survey-results`,
          className: 'survey-results'
        });
      }
    }

    return tabs;
  }

  goBack = () => {
    const { backButtonUrl } = this.state;
    if (backButtonUrl) {
      clHistory.push(backButtonUrl);
    } else {
      // Automated fallback where we simply drop the last url segment
      const currentPath = location.pathname;
      const lastUrlSegment = currentPath.substr(currentPath.lastIndexOf('/') + 1);
      const newPath = currentPath.replace(lastUrlSegment, '').replace(/\/$/, '');
      const newLastUrlSegment = newPath.substr(newPath.lastIndexOf('/') + 1);

      if (newLastUrlSegment === this.props.params.projectId) {
        clHistory.push('/admin/projects');
      } else {
        clHistory.push(newPath);
      }
    }
  }

  onNewIdea = (pathname: string) => (_event) => {
    trackEventByName(tracks.clickNewIdea.name, { extra: { pathnameFrom: pathname } });
  }

  render() {
    const { projectId } = this.props.params;
    const { project, intl: { formatMessage }, localize, children, location: { pathname } } = this.props;
    const childrenWithExtraProps = React.cloneElement(children as React.ReactElement<any>, { project });
    const tabbedProps = {
      resource: {
        title: !isNilOrError(project) ? localize(project.attributes.title_multiloc) : formatMessage(messages.newProject),
      },
      tabs: ((projectId && !isNilOrError(project)) ? this.getTabs(projectId, project) : [])
    };

    return (
      <>
        <TopContainer>
          <GoBackButton onClick={this.goBack} />
          <ActionsContainer>
            {!isNilOrError(project) && tabbedProps.tabs.findIndex(tab => tab.className === 'ideas') !== -1 &&
              <Button
                id="e2e-new-idea"
                buttonStyle="cl-blue-outlined"
                icon="idea2"
                linkTo={`/projects/${project.attributes.slug}/ideas/new`}
                text={formatMessage(messages.addNewIdea)}
                onClick={this.onNewIdea(pathname)}
              />
            }
            {!isNilOrError(project) &&
              <Button
                buttonStyle="cl-blue"
                icon="eye"
                id="to-project"
                linkTo={`/projects/${project.attributes.slug}`}
              >
                <FormattedMessage {...messages.viewPublicProject} />
              </Button>
            }
          </ActionsContainer>
        </TopContainer>
        <TabbedResource {...tabbedProps}>
          {childrenWithExtraProps}
        </TabbedResource>
      </>
    );
  }
}

const AdminProjectEditionWithHoCs = withRouter(injectIntl<Props & WithRouterProps>(injectLocalize(AdminProjectEdition)));

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  surveys_enabled: <GetFeatureFlag name="surveys" />,
  typeform_enabled: <GetFeatureFlag name="typeform_surveys" />,
  customTopicsEnabled: <GetFeatureFlag name="custom_topics" />,
  phases: ({ params, render }) => <GetPhases projectId={params.projectId}>{render}</GetPhases>,
  project: ({ params, render }) => <GetProject projectId={params.projectId}>{render}</GetProject>,
});

export default (inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <AdminProjectEditionWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
