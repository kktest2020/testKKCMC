<template>
  <v-app color="#222">
    <!-- Navigation drawer -->
    <v-navigation-drawer v-model="sideNav" app fixed temporary>
      <v-toolbar color="accent" dark>
        <v-app-bar-nav-icon @click="toggleSideNav">
          <v-icon>close</v-icon>
        </v-app-bar-nav-icon>
        <router-link to="/" tag="span" style="cursor: pointer;">
          <h1 class="pl-2">{{ title }}</h1>
        </router-link>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- Side Bar Links -->
      <v-list>
        <v-list-item v-ripple v-for="(item, index) in sideNavItems" :key="index" :to="item.link">
          <v-list-item-icon>
            <v-icon v-text="item.icon"></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="user" @click="signoutUser" data-cy="signoutSidebarBtn">
          <v-list-item-icon>
            <v-icon>exit_to_app</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Signout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Display search posts reults -->
    <v-card v-if="searchPosts.length" class="search-posts-container">
      <v-list>
        <v-list-item
          v-for="(post) in searchPosts"
          :key="post._id"
          @click="handleGoToPost(post._id)"
        >
          <h4 class="mr-2">{{post.title}}</h4>
          <span class>{{formatText(post.description)}}</span>
          <v-spacer></v-spacer>
          <v-list-item-action>
            <v-icon v-if="isPostLikedByUser(post._id)">favorite</v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Horizontal Navbar -->
    <v-app-bar color="primary" dark absolute>
      <!-- App Title -->
      <v-app-bar-nav-icon @click="toggleSideNav"></v-app-bar-nav-icon>
      <v-toolbar-title class="hidden-xs-only">
        <router-link to="/" tag="span" style="cursor: pointer;">{{ title }}</router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Search Input -->
      <v-text-field
        prepend-icon="search"
        placeholder="Search posts"
        maxlength="25"
        flex
        single-line
        hide-details="auto"
        v-model="searchText"
        @input="handleSearchPost"
      ></v-text-field>

      <v-spacer></v-spacer>

      <v-toolbar-items class="hidden-xs-only" color="transparent">
        <v-btn
          v-for="(item, index) in horizontalNavItems"
          :key="index"
          :to="item.link"
          :data-cy="item.datacy"
          text
        >
          <v-icon left class="hidden-sm-only">{{item.icon}}</v-icon>
          {{ item.title}}
        </v-btn>
        <v-btn text to="/profile" v-if="user">
          <v-icon class="hidden-sm-only" left>account_box</v-icon>
          <v-badge right color="red darken-2">
            <span slot="badge" v-if="user.favorites.length">{{user.favorites.length}}</span>
            Profile
          </v-badge>
        </v-btn>
        <v-btn text v-if="user" @click="signoutUser" data-cy="signoutBtn">
          <v-icon class="hidden-sm-only" left>exit_to_app</v-icon>Signout
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <main class="pb-1">
      <v-container style="margin-top: 50px;">
        <transition name="component-fade" mode="out-in">
          <router-view />
        </transition>

        <v-snackbar :timeout="3000" v-model="authSnackbar" absolute left bottom color="success">
          <v-icon class="mr-2">check_circle</v-icon>You have signedin successfully!.
          <v-btn small color="secondary" text @click="authSnackbar = false">Close</v-btn>
        </v-snackbar>

        <v-snackbar
          :timeout="30000"
          v-model="authErrorSnackbar"
          absolute
          left
          bottom
          color="error"
          data-cy="authErrorSnackbar"
        >
          <v-icon class="mr-2">error</v-icon>
          {{authError.name}} {{authError.message}}.
          <v-btn small color="secondary" text @click="authErrorSnackbar = false">Close</v-btn>
        </v-snackbar>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "App",
  data() {
    return {
      title: "Vue Gql CMS",
      sideNav: false,
      authSnackbar: false,
      authErrorSnackbar: false,
      searchText: "",
    };
  },
  computed: {
    ...mapGetters(["user", "error", "authError", "searchPosts"]),
    horizontalNavItems() {
      let items = [
        { icon: "chat", title: "Posts", link: "/posts", datacy: "postsBtn" },
        {
          icon: "lock_open",
          title: "Sign In",
          link: "/signin",
          datacy: "signinBtn",
        },
        {
          icon: "create",
          title: "Sign Up",
          link: "/signup",
          datacy: "signupBtn",
        },
      ];

      if (this.user) {
        items = [
          { icon: "chat", title: "Posts", link: "/posts", datacy: "signinBtn" },
        ];
      }
      return items;
    },
    sideNavItems() {
      let items = [
        { icon: "chat", title: "Posts", link: "/posts" },
        { icon: "lock_open", title: "Sign In", link: "/signin" },
        { icon: "create", title: "Sign Up", link: "/signup" },
      ];

      if (this.user) {
        items = [
          { icon: "chat", title: "Posts", link: "/posts" },
          { icon: "stars", title: "Create Post", link: "/post/add" },
          { icon: "account_box", title: "Profile", link: "/profile" },
        ];
      }
      return items;
    },
    handleHideSnackbar() {
      this.authSnackbar = false;
    },
  },
  watch: {
    user(newValue, oldValue) {
      if (!oldValue && newValue) {
        this.authSnackbar = true;
      }
    },
    authError(newValue, oldValue) {
      this.authErrorSnackbar = true;
    },
  },
  methods: {
    ...mapActions(["signoutUser"]),
    toggleSideNav() {
      this.sideNav = !this.sideNav;
    },
    handleSearchPost() {
      console.log("handleSearchPost", this.searchText);
      if (this.searchText !== null) {
        const variables = { searchText: this.searchText };
        this.$store.dispatch("getSearchPosts", variables);
      }
    },
    handleGoToPost(postId) {
      this.$router.push(`/posts/${postId}`);
      this.$store.dispatch("clearSearchPosts");
      this.searchText = "";
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
  },
};
</script>
<style>
main {
  background-color: aliceblue;
}
component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.3s ease;
}

.component-fade-enter, 
.component-fade-leave-to
/* .component-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.search-posts-container {
  position: absolute;
  top: 56px;
}
</style>