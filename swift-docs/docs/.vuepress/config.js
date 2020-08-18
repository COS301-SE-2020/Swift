const { description } = require('../../package')

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'Swift',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: '',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: false,
    nav: [
      {
        text: 'Documentation',
        link: '/documentation/',
      },
      {
        text: 'User Manual',
        link: '/user-manual/'
      },
      {
        text: 'API',
        link: '/api/'
      },
      {
        text: 'Installation Manual',
        link: '/installation-manual/'
      },
      {
        text: 'Coding Standards',
        link: '/coding-standards/'
      },
      {
        text: 'GitHub',
        link: 'https://github.com/COS301-SE-2020/Swift'
      },
    ],
    sidebar: {
      '/documentation/': [
        {
          title: 'Documentation',
          collapsable: false,
          children: [
            '',
            'architectural-design',
            'non-functional-requirements',
            'user-characteristics',
            'functional-requirements',
            'user-stories',
            'use-cases',
            'domain-model',
            'traceability-matrix',
          ]
        }
      ],
      '/user-manual/': [
        {
          title: 'User Manual',
          collapsable: false,
          children: [
            '',
          ]
        }
      ],
      '/api/': [
        {
          title: 'API',
          collapsable: false,
          children: [
            '',
          ]
        }
      ],
      '/installation-manual/': [
        {
          title: 'Installation Manual',
          collapsable: false,
          children: [
            '',
            //'customer-app-install',
            //'managemenet-app-install',
            //'api-install',
          ]
        }
      ]
    }
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
  ],

  /**
   * Webpack config
   */
  configureWebpack: {
    resolve: {
      alias: {
        '@assets': '../../assets/'
      }
    }
  }
}
