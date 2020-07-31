import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "@babel/polyfill";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";

import FormAlert from "./components/Shared/FormAlert.vue";

import ApolloClient from "apollo-boost";
import VueApollo from "vue-apollo";

Vue.component("form-alert", FormAlert);

Vue.use(VueApollo);

// Setup ApolloClient
export const defaultClient = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  // include auth token with requests made to backend
  fetchOptions: {
    credentials: "include",
  },
  request: (operation) => {
    // if no token with key od token in local storage, add it
    if (!localStorage.token) {
      localStorage.setItem("token", "");
    }
    operation.setContext({
      headers: {
        authorization: localStorage.getItem("token"),
      },
    });
  },
  onError: ({ graphQLErrors, networkError }) => {
    if (networkError) {
      // console.log("[Network Error]", networkError);
      store.dispatch("setAuthError", networkError);
      localStorage.setItem("token", "");
    }

    if (graphQLErrors) {
      for (let error of graphQLErrors) {
        store.dispatch("setAuthError", {
          error: error.name,
          message: error.message.replace("Context creation failed: ", ""),
        });
      }
    }
  },
});

const apolloProvider = new VueApollo({
  defaultClient,
});

Vue.config.productionTip = false;

new Vue({
  // Adds the apollo key to components
  apolloProvider,
  router,
  store,
  vuetify,
  render: (h) => h(App),
  created() {
    this.$store.dispatch("getCurrentUser");
  },
}).$mount("#app");
