<template>
  <v-container>
    <v-card class="xs-12 col-sm-8 offset-sm-2 text-center">
      <v-row>
        <v-col>
          <v-row text-center>
            <v-col>
              <v-img contain :src="user.avatar" height="125px"></v-img>
            </v-col>
            <v-col>
              <div class="headline">{{user.username}}</div>
              <div>Joined {{formatDate(user.joinDate)}}</div>
              <div class="font-weight-thin">{{user.favorites.length}} Favorites</div>
              <div class="font-weight-thin">{{userPosts.length}} Posts added</div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>

    <v-row>
      <v-col>
        <h1>{{user.favorites.length}} Favorites</h1>
        <v-divider></v-divider>
      </v-col>
    </v-row>
    <v-row>
      <v-col :cols="12" :sm="6" v-for="post in user.favorites" :key="post._id">
        <v-card>
          <v-img :src="post.imageUrl" height="30vh" @click="gotoPost(post._id)"></v-img>

          <v-expand-transition>
            <v-list>
              <v-divider></v-divider>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-text="post.title"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <h1>{{userPosts.length}} Added posts</h1>
        <v-divider></v-divider>
      </v-col>
    </v-row>
    <v-row>
      <v-col :cols="12" :sm="6" v-for="post in userPosts" :key="post._id">
        <v-card class="text-center">
          <v-img :src="post.imageUrl" height="30vh" @click="gotoPost(post._id)">
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
              </v-row>
            </template>
          </v-img>

          <v-expand-transition>
            <v-list>
              <v-divider></v-divider>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-text="post.title"></v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon color="blue" @click="handleShowEditPostForm(post)">edit</v-icon>
                </v-list-item-action>
                <v-list-item-action>
                  <v-icon color="red" @click="handleDeletePost(post._id)">delete</v-icon>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="showEditPostForm" transition="dialog-transition">
      <v-card>
        <v-container>
          <v-form
            class="pa-5"
            v-model="isFormValid"
            lazy-validation
            @submit.prevent="handleEditPost"
            ref="form"
          >
            <v-row>
              <v-col xs12>
                <v-text-field
                  name="title"
                  label="Title"
                  prepend-icon="title"
                  type="text"
                  v-model="form.title"
                  :rules="rules.title"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col xs12>
                <v-text-field
                  name="imageUrl"
                  label="ImageUrl"
                  prepend-icon="image"
                  type="text"
                  v-model="form.imageUrl"
                  :rules="rules.imageUrl"
                ></v-text-field>
                <v-img height="150" :src="form.imageUrl"></v-img>
              </v-col>
            </v-row>
            <v-row>
              <v-col xs12>
                <v-select
                  :items="categoryItems"
                  multiple
                  v-model="form.categories"
                  label="Categories"
                  prepend-icon="category"
                  :rules="rules.categories"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col xs12>
                <v-textarea
                  name="description"
                  label="Description"
                  prepend-icon="description"
                  type="text"
                  v-model="form.description"
                  :rules="rules.description"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn
                  type="submit"
                  class="float-left"
                  :loading="loading"
                  :disabled="!isFormValid || loading"
                >
                  <span class="custom-loader">
                    <v-icon light v-if="loading">update</v-icon>
                  </span>Update post
                </v-btn>

                <v-btn type="reset" class="float-right" @click="showEditPostForm=false">
                  <span class="custom-loader">
                    <v-icon light v-if="loading">cancel</v-icon>
                  </span>Cancel
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Profile",
  data() {
    return {
      showEditPostForm: false,
      isFormValid: false,
      form: {
        _id: "",
        title: "",
        imageUrl: "",
        categories: [],
        description: "",
        creatorId: "",
      },

      rules: {
        title: [
          (title) => !!title || "Title is required!",
          (title) =>
            title.length < 100 || "Title sould be less than 100 characters!",
        ],
        imageUrl: [
          (image) => !!image || "Image is required!",
          (image) =>
            image.length < 555 || "Image sould be less than 555 characters!",
        ],
        categories: [
          (categories) =>
            categories.length > 0 || "At least one catgory is required",
        ],
        description: [
          (description) => !!description || "Description is required!",
          (description) =>
            description.length < 355 ||
            "Description sould be less than 255 characters!",
        ],
      },
    };
  },
  created() {
    this.$store.dispatch("getUserPosts", { userId: this.user._id });
  },
  computed: {
    ...mapGetters(["user", "userPosts", "loading"]),
    categoryItems() {
      return ["Sport", "Travel", "Science"];
    },
  },
  methods: {
    formatDate(timestamp) {
      let date = new Date(+timestamp);
      return date.toDateString();
    },
    gotoPost(postId) {
      this.$router.push(`/posts/${postId}`);
    },
    formatText(text) {
      console.log({
        text,
        length: text.length,
      });
      return text.length > 10 ? `${text.slice(0, 10)}...` : text;
    },
    isPostLikedByUser: function (postId) {
      const _this = this;
      return (
        _this.user &&
        _this.user.favorites.some(function (favoritePost) {
          return favoritePost._id === postId;
        })
      );
    },
    handleShowEditPostForm(post) {
      // console.log("handleShowEditPostForm");
      this.showEditPostForm = true;
      // console.log({
      //   post,
      // });

      this.form._id = post._id;
      this.form.title = post.title;
      this.form.imageUrl = post.imageUrl;
      this.form.categories = post.categories;
      this.form.description = post.description;
      this.form.creatorId = this.user._id;
    },
    handleEditPost() {
      // console.log("handleEditPost");
      const payload = {
        _id: this.form._id,
        title: this.form.title,
        imageUrl: this.form.imageUrl,
        categories: this.form.categories,
        description: this.form.description,
        creatorId: this.form.creatorId,
      };

      // Update post data
      this.$store.dispatch("updateUserPost", payload);

      this.showEditPostForm = false;

      // Update user post data
    },
    handleDeletePost(postId) {
      console.log("handleDeletePost");
      const payload = { postId, userId: this.user._id };
      this.$store.dispatch("deleteUserPost", payload);
    },
  },
};
</script>

<style>
</style>