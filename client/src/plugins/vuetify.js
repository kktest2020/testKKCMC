import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import colors from "vuetify/es5/util/colors";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    primary: colors.teal.base,
    secondary: colors.grey.base,
    accent: colors.blue.base,
    error: colors.red.base,
    warning: colors.orange.base,
    info: colors.yellow.base,
    success: colors.green.base,
  },
});
