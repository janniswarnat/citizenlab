import { Builder } from '@builder.io/react';
import { ProjectCard } from './index';

Builder.registerComponent(ProjectCard, {
  name: 'ProjectCard',
  inputs: [
    {
      name: 'projectId',
      type: 'string',
      defaultValue: '858a21b8-862f-4360-ac96-998a9f8ddadf',
    },
  ],
});
