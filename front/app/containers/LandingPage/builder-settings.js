import { Builder, builder } from '@builder.io/react';

// Be sure to import all of your components where you use <BuilderComponent /> so they are
// bundled and accessible
import './ProjectCard/ProjectCard.builder';

// Add your public apiKey here
const YOUR_KEY = '7b78e1a1ad944f6dbe06cd71d7941555';
builder.init(YOUR_KEY);

// Remove this to allow all built-in components to be used too
const OVERRIDE_INSERT_MENU = false;

if (OVERRIDE_INSERT_MENU) {
  // (optionally) use this to hide all default built-in components and fully manage
  // the insert menu components and sections yourself
  Builder.set({ customInsertMenu: true });
}

// (optionally) set these to add your own sections of components arranged as you choose.
// this can be used with or without `customInsertMenu` above

Builder.register('insertMenu', {
  name: 'Custom Component Menu',
  items: [{ name: 'ProjectCard' }],
});
