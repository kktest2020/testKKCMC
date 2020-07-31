<template>
  <v-container text-center mt-5 pt-5>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1>Welcome back!</h1>
      </v-flex>
    </v-layout>

    <v-layout row wrap v-if="error">
      <v-flex xs12 sm6 offset-sm3>
        <form-alert :message="error.message"></form-alert>
      </v-flex>
    </v-layout>

    <v-layout row>
      <v-flex xs12 sm6 offset-sm3>
        <v-card color="accent" dark>
          <v-container>
            <v-form
              class="pa-5"
              v-model="isFormValid"
              lazy-validation
              @submit.prevent="handleSigninUser"
              ref="form"
              data-cy="signinForm"
              id="signinForm"
            >
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    name="username"
                    label="Username"
                    id="uernmame"
                    prepend-icon="face"
                    type="text"
                    v-model="username"
                    :rules="usernameRules"
                    data-cy="signinUsername"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    name="password"
                    label="Password"
                    id="password"
                    prepend-icon="extension"
                    type="password"
                    v-model="password"
                    :rules="passwordRules"
                    data-cy="signinPassword"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-btn
                    type="submit"
                    :loading="loading"
                    :disabled="!isFormValid || loading"
                    data-cy="signinSubmit"
                  >
                    <span class="custom-loader mr-2">
                      <v-icon light v-if="loading">cached</v-icon>
                    </span>
                    Signin
                  </v-btn>

                  <h3>
                    Don't have an account?
                    <router-link to="/signup">Signup</router-link>
                  </h3>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import router from "../../router";
export default {
  name: "Signin",
  data() {
    return {
      username: "",
      password: "",
      usernameRules: [
        (username) => !!username || "Username is required",
        (username) =>
          username.length < 10 || "Username should be less than 10 characters",
      ],
      passwordRules: [
        (password) => !!password || "Password is required",
        (password) =>
          password.length < 10 || "PAssword should be less than 10 characters",
      ],
      isFormValid: true,
    };
  },
  computed: {
    ...mapGetters(["user", "error", "loading"]),
  },
  watch: {
    user(value) {
      if (value) {
        router.push({ path: "/" });
      }
    },
  },
  methods: {
    handleSigninUser() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("signinUser", {
          username: this.username,
          password: this.password,
        });
      }
    },
  },
};
</script>

<style>
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>