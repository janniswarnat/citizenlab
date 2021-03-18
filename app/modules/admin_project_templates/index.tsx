import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ProjectTemplates from './admin/containers';
import Tab from './admin/components/Tab';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { TTabName } from 'containers/Admin/projects/all/CreateProject';
import ProjectTemplatePreviewContainerAdmin from './admin/containers/ProjectTemplatePreviewContainerAdmin';
declare module 'containers/Admin/projects/all/CreateProject' {
  export interface ITabNamesMap {
    template: 'template';
  }
}

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

type RenderOnSelectedTabValueProps = {
  selectedTabValue: TTabName;
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isEnabled = useFeatureFlag('admin_project_templates');
  if (isEnabled) {
    return <>{children}</>;
  }
  return null;
};

const RenderOnSelectedTabValue = ({
  selectedTabValue,
  children,
}: RenderOnSelectedTabValueProps) => {
  if (selectedTabValue !== 'template') return null;
  return <>{children}</>;
};

const configuration: ModuleConfiguration = {
  routes: {
    citizen: [
      {
        path: 'templates/:projectTemplateId',
        name: 'project template preview page',
        container: () =>
          import('./citizen/containers/ProjectTemplatePreviewPageCitizen'),
      },
    ],
    'admin.project_templates': [
      {
        path: 'templates/:projectTemplateId',
        name: 'admin project template preview page',
        container: () =>
          import('./admin/containers/ProjectTemplatePreviewPageAdmin'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.all.container': ProjectTemplatePreviewContainerAdmin,
    'app.containers.Admin.projects.all.createProject': (props) => (
      <RenderOnFeatureFlag>
        <RenderOnSelectedTabValue selectedTabValue={props.selectedTabValue}>
          <ProjectTemplates />
        </RenderOnSelectedTabValue>
      </RenderOnFeatureFlag>
    ),
    'app.containers.Admin.projects.all.createProject.tabs': (props) => (
      <RenderOnFeatureFlag>
        <Tab {...props} />
      </RenderOnFeatureFlag>
    ),
  },
};

export default configuration;
