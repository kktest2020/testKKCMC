<template>
  <v-container mt-5 pt-5>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title hover>
            <h1>{{getPost.title}}</h1>
            <v-btn v-if="user" icon class="ml-3">
              <v-icon
                :color="isPostLikedByUser ? 'red' : 'grey'"
                dark
                @click="handleLikePost"
              >favorite</v-icon>
            </v-btn>

            <h3 class="font-weight-thin ml-3">{{getPost.likes}} likes</h3>
            <v-spacer></v-spacer>
            <v-icon large color="info" @click="goBack">arrow_back</v-icon>
          </v-card-title>

          <v-tooltip right>
            <span>Click to enlarge image</span>
            <template v-slot:activator="{on}">
              <v-img
                :src="getPost.imageUrl"
                :contain="false"
                height="300"
                v-on="on"
                @click="dialog = true"
              ></v-img>
            </template>
          </v-tooltip>
          <v-dialog v-model="dialog" width="80vw" transition="dialog-transition" color="white">
            <v-card>
              <v-img :src="getPost.imageUrl" contain height="80vh"></v-img>
            </v-card>
          </v-dialog>

          <v-card-text>
            <v-chip
              v-for="(category, index) in getPost.categories"
              :key="index"
              color="blue"
              text-color="white"
              class="mr-2"
            >{{category}}</v-chip>
            <h3 class="mt-3">{{getPost.description}}</h3>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="user">
      <v-col>
        <v-form
          @submit.prevent="handleAddPostMessage"
          lazy-validation
          v-model="isFormValid"
          ref="form"
        >
          <v-text-field
            :append-icon="isFormValid ? 'send' : ''"
            prepend-icon="email"
            name="name"
            label="Add message"
            id="addMessage"
            v-model="form.messageBody"
            @click:append="handleAddPostMessage"
            :rules="rules.messageBody"
          ></v-text-field>
        </v-form>
      </v-col>
    </v-row>

    <v-row v-if="getPost.messages">
      <v-col>
        <v-list>
          <v-subheader>Messages ({{getPost.messages.length}})</v-subheader>

          <template v-for="(message,index) in getPost.messages">
            <v-list-item two-line :key="index">
              <v-list-item-avatar>
                <v-img :src="message.messageUser.avatar"></v-img>
              </v-list-item-avatar>
              <v-list-item-title>
                <h3>{{message.messageBody}}</h3>
                <p>
                  {{message.messageUser.username}}
                  <span
                    class="grey--text text--lighten-1"
                  >{{formatDate(message.messageDate)}}</span>
                </p>
              </v-list-item-title>
              <v-list-item-action>
                <v-icon :color="checkIfOwnMessage(message) ? 'blue' : 'gray'">chat_bubble</v-icon>
              </v-list-item-action>
            </v-list-item>
          </template>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {
  GET_CURRENT_USER,
  GET_POST,
  ADD_POST_MESSAGE,
  LIKE_POST,
  UNLIKE_POST,
} from "../../queries";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Post",
  data() {
    return {
      getPost: {},
      dialog: false,
      form: {
        messageBody: "",
      },
      isFormValid: false,
      rules: {
        messageBody: [
          (message) => (message && !!message) || "Message is required!",
          (message) =>
            (message && message.length < 60) ||
            "Message sould be less than 60 characters!",
        ],
      },
    };
  },
  computed: {
    isPostLikedByUser: function () {
      const _this = this;
      return (
        _this.user &&
        _this.user.favorites.some(function (favoritePost) {
          return favoritePost._id === _this.id;
        })
      );
    },
    ...mapGetters(["user"]),
  },
  props: ["id"],
  apollo: {
    getPost: {
      query: GET_POST,
      variables() {
        return { id: this.id };
      },
    },
  },
  methods: {
    checkIfOwnMessage(message) {
      if (!this.user) return false;

      return this.user._id === message.messageUser._id;
    },
    formatDate(timestamp) {
      let date = new Date(+timestamp);
      return date.toDateString();
    },
    goBack() {
      this.$router.go(-1);
    },
    handleAddPostMessage() {
      console.log("handleAddPostMessage");
      if (!this.$refs.form.validate()) {
        console.error("The form is not submited because inputs are not valid!");
        return;
      }
      self = this;
      const variables = {
        messageBody: this.form.messageBody,
        userId: this.user._id,
        postId: this.id,
      };

      console.log({ variables });

      this.$apollo
        .mutate({
          mutation: ADD_POST_MESSAGE,
          variables,
          update: (cache, { data: { addPostMessage } }) => {
            console.log("update", {
              cache,
              addPostMessage,
              id: this.id,
            });

            const data = cache.readQuery({
              query: GET_POST,
              variables: {
                id: self.id,
              },
            });

            data.getPost.messages.unshift(addPostMessage);
          },
        })
        .then(({ data }) => {
          self.$refs.form.reset();
        })
        .catch((error) => {
          console.error(error);
        });
    },
    handleLikePost() {
      console.log("handle like post");

      if (this.isPostLikedByUser) {
        this.unlikePost();
      } else {
        this.likePost();
      }
    },
    likePost() {
      console.log("like post");
      const _this = this;

      const variables = {
        postId: this.id,
        userId: this.user._id,
      };

      this.$apollo
        .mutate({
          mutation: LIKE_POST,
          variables,
          update: function (cache, { data: { likePost } }) {
            // Get getPost from the cache
            const postData = cache.readQuery({
              query: GET_POST,
              variables: { id: variables.postId },
            });
            // Update the data to the new values
            postData.getPost.likes = likePost.likes;
            // Write data to the cache
            cache.writeQuery({
              query: GET_POST,
              variables: { id: variables.postId },
              data: postData,
            });
          },
        })
        .then(({ data }) => {
          // Update user data
          const updatedUser = {
            ...this.user,
            favorites: data.likePost.favorites,
          };

          this.$store.dispatch("setUser", updatedUser);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    unlikePost() {
      console.log("unlike post");
      const _this = this;

      const variables = {
        postId: this.id,
        userId: this.user._id,
      };

      this.$apollo
        .mutate({
          mutation: UNLIKE_POST,
          variables,
          update: function (cache, { data: { unlikePost } }) {
            // Update the user favorites on the cache

            // Get getPost from the cache
            const postData = cache.readQuery({
              query: GET_POST,
              variables: { id: variables.postId },
            });
            // Update the data to the new values
            postData.getPost.likes = unlikePost.likes;
            // Write data to the cache
            cache.writeQuery({
              query: GET_POST,
              variables: { id: variables.postId },
              data: postData,
            });
          },
        })
        .then(({ data }) => {
          // Update user data
          const updatedUser = {
            ...this.user,
            favorites: data.unlikePost.favorites,
          };

          this.$store.dispatch("setUser", updatedUser);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>