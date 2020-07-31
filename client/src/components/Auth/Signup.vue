<template>
  <v-container text-center mt-5 pt-5>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1>Create new account!.</h1>
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
              @submit.prevent="handleSignupUser"
              ref="form"
            >
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    name="username"
                    label="Username"
                    prepend-icon="face"
                    type="text"
                    v-model="username"
                    :rules="usernameRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    name="email"
                    label="Email"
                    prepend-icon="email"
                    type="text"
                    v-model="email"
                    :rules="emailRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    name="password"
                    label="Password"
                    prepend-icon="extension"
                    type="password"
                    v-model="password"
                    :rules="passwordRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    name="passwordConfirmation"
                    label="Password Confirmation"
                    prepend-icon="extension"
                    type="password"
                    v-model="passwordConfirmation"
                    :rules="passwordRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-btn type="submit" :loading="loading" :disabled="!isFormValid || loading">
                    <span class="custom-loader mr-2">
                      <v-icon light v-if="loading">cached</v-icon>
                    </span>Signup
                  </v-btn>
                  <h3>
                    Have already an account
                    <router-link to="/signin">Signin</router-link>
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
  name: "Signup",
  data() {
    return {
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      isFormValid: true,
      usernameRules: [
        username => !!username || "Username is required",
        username =>
          username.length < 10 || "Username should be less than 10 characters"
      ],
      emailRules: [
        email => !!email || "Email is required",
        email => {
          var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          return mailformat.test(email) || "Email is not valid";
        }
      ],
      passwordRules: [
        password => !!password || "Password is required",
        password =>
          password.length < 10 || "Password should be less than 7 characters",
        confirmation =>
          confirmation === this.password ||
          "Confirm password should match password!"
      ]
    };
  },
  computed: {
    ...mapGetters(["user", "error", "loading"])
  },
  methods: {
    handleSignupUser() {
      console.log("handleSignupUser");
      // return;
      if (this.$refs.form.validate()) {
        // Signup user
        console.log("dispatch handleSignupUser");
        this.$store.dispatch("signupUser", {
          username: this.username,
          email: this.email,
          password: this.password
        });
      }
    }
  }
};
</script>

<style>
</style>