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
      },
    },
});
