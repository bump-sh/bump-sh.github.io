/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  help:
    [
      'index',
      'getting-started',
      'bump-cli',
      {
        type: 'category',
        label: 'Continuous Integration',
        link: {type: 'doc', id: 'continuous-integration/index'},
        collapsible: true,
        collapsed: true,
        items: [
          'continuous-integration/github-actions'
        ],
      },
      {
        type: 'category',
        label: 'Specifications Support',
        link: {type: 'doc', id: 'specifications-support/index'},
        collapsible: true,
        collapsed: true,
        items: [
          {
            type: 'category',
            label: 'OpenAPI support',
            link: {type: 'doc', id: 'specifications-support/openapi-support'},
            items: [
              'specifications-support/openapi-support/name-and-sort-resources',
              'specifications-support/openapi-support/webhooks'
            ]
          },
          'specifications-support/asyncapi-support',
          'specifications-support/markdown-support',
          'specifications-support/polymorphism',
          'specifications-support/references',
        ],
      },
      {
        type: 'category',
        label: 'API change management',
        link: {type: 'doc', id: 'api-change-management/index'},
        collapsible: true,
        collapsed: true,
        items: [
          'api-change-management/webhooks'
        ],
      },
      'branching',
      'hubs',
      'access-management',
      {
        type: 'category',
        label: 'Organizations',
        link: {type: 'doc', id: 'organizations/index'},
        collapsible: true,
        collapsed: true,
        items: ['organizations/single-sign-on-sso'],
      },
      'custom-domains',
      'meta-images',
      'faq',
    ]
};

module.exports = sidebars;
