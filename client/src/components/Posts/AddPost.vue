<template>
  <v-container text-center mt-5 pt-5>
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1>Add Post</h1>
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
              @submit.prevent="handleAddPost"
              ref="form"
            >
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    name="title"
                    label="Title"
                    prepend-icon="title"
                    type="text"
                    v-model="form.title"
                    :rules="rules.title"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-text-field
                    name="imageUrl"
                    label="ImageUrl"
                    prepend-icon="image"
                    type="text"
                    v-model="form.imageUrl"
                    :rules="rules.imageUrl"
                  ></v-text-field>
                  <v-img height="300" :src="form.imageUrl"></v-img>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-select
                    :items="categoryItems"
                    multiple
                    v-model="form.categories"
                    label="Categories"
                    prepend-icon="category"
                    :rules="rules.categories"
                  ></v-select>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-textarea
                    name="description"
                    label="Description"
                    prepend-icon="description"
                    type="text"
                    v-model="form.description"
                    :rules="rules.description"
                  ></v-textarea>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-btn type="submit" :loading="loading" :disabled="!isFormValid || loading">
                    <span class="custom-loader mr-2">
                      <v-icon light v-if="loading">cached</v-icon>
                    </span>Create
                  </v-btn>
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
export default {
  name: "AddPost",
  data() {
    return {
      isFormValid: true,
      form: {
        title: "",
        imageUrl: "",
        categories: [],
        description: "",
        TEST: ""
      },

      rules: {
        title: [
          title => !!title || "Title is required!",
          title =>
            title.length < 100 || "Title sould be less than 100 characters!"
        ],
        imageUrl: [
          image => !!image || "Image is required!",
          image =>
            image.length < 555 || "Image sould be less than 555 characters!"
        ],
        categories: [
          categories =>
            categories.length > 0 || "At least one catgory is required"
        ],
        description: [
          description => !!description || "Description is required!",
          description =>
            description.length < 355 ||
            "Description sould be less than 255 characters!"
        ]
      }
    };
  },
  computed: {
    creatorId() {
      return this.user._id;
    },
    categoryItems() {
      return ["Sport", "Travel", "Science"];
    },
    ...mapGetters(["loading", "user"])
  },
  methods: {
    handleAddPost() {
      // console.log({ form: this.form });
      this.$store.dispatch("addPost", {
        title: this.form.title,
        imageUrl: this.form.imageUrl,
        categories: this.form.categories,
        description: this.form.description,
        creatorId: this.user._id
      });
    }
  },
  beforeUpdate() {
    console.log("beforeUpdate");
    // localStorage.setItem("form", JSON.stringify(this.form));
  },
  updated() {
    console.log("updated");
    // this.form = JSON.parse(localStorage.getItem("form"));
  }
};
</script>

<style>
</style>