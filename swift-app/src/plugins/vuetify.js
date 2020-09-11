import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#F75564',
        secondary: '#343434',
        accent: '#76C5BA',
      },
      dark: {
        primary: '#F75564',
        secondary: '#FFFFFF',
        accent: '#76C5BA',
        background: "#343434"
      }
    },
  },
  breakpoint: {
    thresholds: {
      xs: 340,
      sm: 540,
      md: 800,
      lg: 1280,
    },
    scrollBarWidth: 24,
  },
});
