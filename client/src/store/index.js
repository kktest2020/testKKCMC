import Vue from "vue";
import Vuex from "vuex";
import { defaultClient as ApolloClient } from "../main";
import {
  GET_CURRENT_USER,
  GET_POSTS,
  SEARCH_POSTS,
  USER_POSTS,
  ADD_POST,
  UPDATE_USER_POST,
  DELETE_USER_POST,
  SIGNIN_USER,
  SIGNUP_USER,
  GET_POST,
} from "../queries";
import router from "../router";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    posts: [],
    userPosts: [],
    searchPosts: [],
    error: false,
    authError: {},
    loading: false,
  },
  getters: {
    user(state) {
      return state.user;
    },
    posts(state) {
      return state.posts;
    },
    userPosts(state) {
      return state.userPosts;
    },
    searchPosts(state) {
      return state.searchPosts;
    },
    error(state) {
      return state.error;
    },
    loading(state) {
      return state.loading;
    },
    authError(state) {
      return state.authError;
    },
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
    setPosts(state, payload) {
      state.posts = payload;
    },
    setUserPosts(state, payload) {
      state.userPosts = payload;
    },
    setSearchPosts(state, payload) {
      console.log("setSearchPosts", payload);
      state.searchPosts = payload;
    },
    setError(state, payload) {
      state.error = payload;
    },
    setLoading(state, payload) {
      state.loading = payload;
    },
    setAuthError(state, payload) {
      state.authError = payload;
    },
    clearSearchPosts(state) {
      state.searchPosts = [];
    },
  },
  actions: {
    setUser({ commit }, payload) {
      commit("setUser", payload);
    },
    getCurrentUser: ({ commit, dispatch }) => {
      ApolloClient.query({
        query: GET_CURRENT_USER,
      })
        .then(({ data }) => {
          // Get the data from action to state via mutations
          commit("setUser", data.getCurrentUser);
        })
        .catch((error) => {
          localStorage.setItem("token", "");

          dispatch("setAuthError", {
            name: error.name,
            message: error.message,
          });

          // Disable page reload on login
          // router.go();
        });
    },
    signinUser: ({ dispatch, commit }, payload) => {
      dispatch("clearError");
      commit("setLoading", true);
      localStorage.setItem("token", "");
      ApolloClient.mutate({
        mutation: SIGNIN_USER,
        variables: payload,
      })
        .then(({ data }) => {
          // Get the data from action to state via mutations
          console.log({ signinData: data });
          commit("setLoading", false);
          localStorage.setItem("token", data.signinUser.token);
          router.go();
        })
        .catch((error) => {
          commit("setLoading", false);
          dispatch("setAuthError", {
            name: error.name,
            message: error.message,
          });
        });
    },
    signupUser: ({ dispatch, commit }, payload) => {
      dispatch("clearError");
      commit("setLoading", true);
      localStorage.setItem("token", "");
      ApolloClient.mutate({
        mutation: SIGNUP_USER,
        variables: payload,
      })
        .then(({ data }) => {
          // Get the data from action to state via mutations
          console.log({
            signupResult: data,
          });
          commit("setLoading", false);
          localStorage.setItem("token", data.signupUser.token);
          router.push({ path: "/" });
        })
        .catch((error) => {
          commit("setLoading", false);
          dispatch("setAuthError", {
            name: error.name,
            message: error.message,
          });
        });
    },
    signoutUser: ({ commit }) => {
      commit("setUser", null);

      localStorage.setItem("token", "");
      ApolloClient.clearStore();
      if (router.currentRoute.name !== "Home") {
        router.push({ name: "Home" });
      }
    },
    getPosts: ({ commit }) => {
      // Use ApolloClient to fire getPostsQuery
      ApolloClient.query({
        query: GET_POSTS,
      })
        .then(({ data }) => {
          // Get the data from action to state via mutations
          commit("setPosts", data.getPosts);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getSearchPosts: ({ commit }, payload) => {
      console.log("action getSearchPosts", payload);
      // Use ApolloClient to fire getPostsQuery
      ApolloClient.query({
        query: SEARCH_POSTS,
        variables: payload,
      })
        .then(({ data }) => {
          // Get the data from action to state via mutations
          commit("setSearchPosts", data.searchPosts);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    getUserPosts: ({ commit }, payload) => {
      ApolloClient.query({
        query: USER_POSTS,
        variables: payload,
      })
        .then(({ data }) => {
          // Get the data from action to state via mutations
          commit("setUserPosts", data.userPosts);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    setError: ({ commit }, payload) => {
      commit("setError", payload);
    },
    clearError: ({ commit }) => {
      commit("setError", null);
    },

    setLoading: ({ commit }, payload) => {
      commit("setLoading", payload);
    },
    setAuthError: ({ commit }, payload) => {
      commit("setAuthError", payload);
    },
    addPost: ({ state, dispatch, commit }, payload) => {
      console.log("action addPost", { payload });
      commit("setLoading", true);

      ApolloClient.mutate({
        mutation: ADD_POST,
        variables: payload,
        update(cache, { data: { addPost } }) {
          // update getPosts cached apollo server query
          try {
            // Get the query data
            const data = cache.readQuery({ query: GET_POSTS });
            if (data) {
              // Set the new data to cache
              data.getPosts.unshift(addPost);
              // Update the query with the updated posts
              cache.writeQuery({ query: GET_POSTS, data });
            }
          } catch (error) {
            console.error(error);
          }
        },
        optimisticResponse: {
          __typename: "Mutation",
          addPost: {
            __typename: "Post",
            _id: -1,
            ...payload,
          },
        },
        //TODO use the refetchQueries
        refetchQueries: [
          {
            query: USER_POSTS,
            variables: { userId: payload.creatorId },
          },
          {
            query: GET_POSTS,
          },
        ],
      })
        .then(({ data }) => {
          commit("setLoading", false);

          router.push({ path: "/" });
        })
        .catch((error) => {
          commit("setLoading", false);
          dispatch("setAuthError", {
            name: error.name,
            message: error.message,
          });
        });
    },
    likePost({ commit }, payload) {
      console.log("action likePost", payload);
      // ApolloClient.mutate({
      //   mutation: LIKE_POST,
      //   variables: payload,
      //   update: function(cache, { data: { likePost } }) {
      //     // Update likes number on getPost
      //     const data = cache.readQuery({
      //       query: GET_POST,
      //       variables: { _id: payload.postId },
      //     });
      //   },
      // })
      //   .then(({ data }) => {
      //     console.log(data);
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   });
    },
    unlikePost({ commit }, payload) {
      console.log("action unlikePost", payload);
      // ApolloClient.mutate({
      //   mutation: LIKE_POST,
      //   variables: payload,
      //   update: function(cache, { data: { likePost } }) {
      //     const data = cache.readQuery({ query: GET_POST, variables: {} });
      //   },
      // })
      //   .then(({ data }) => {
      //     console.log(data);
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   });
    },
    clearSearchPosts({ commit }) {
      commit("clearSearchPosts");
    },
    updateUserPost({ state, commit, dispatch }, payload) {
      // console.log("action-updateUserPost", payload);

      ApolloClient.mutate({
        mutation: UPDATE_USER_POST,
        variables: payload,
      })
        .then(({ data: { updateUserPost } }) => {
          commit("setLoading", false);

          const index = state.userPosts.findIndex(function(post) {
            return post._id === updateUserPost._id;
          });

          const userPosts = [
            ...state.userPosts.slice(0, index),
            updateUserPost,
            ...state.userPosts.slice(index + 1),
          ];

          commit("setUserPosts", userPosts);
        })
        .catch((error) => {
          console.error(error);
          commit("setLoading", false);
          dispatch("setAuthError", error);
        });
    },
    deleteUserPost({ state, commit, dispatch }, payload) {
      ApolloClient.mutate({
        mutation: DELETE_USER_POST,
        variables: payload,
      })
        .then(({ data }) => {
          commit("setLoading", false);

          if (
            data.deleteUserPost._id === payload.postId &&
            data.deleteUserPost.createdBy._id === payload.userId
          ) {
            const index = state.userPosts.findIndex(function(post) {
              return post._id === data.deleteUserPost._id;
            });

            const userPosts = [
              ...state.userPosts.slice(0, index),
              ...state.userPosts.slice(index + 1),
            ];
            commit("setUserPosts", userPosts);
          }
        })
        .catch((error) => {
          console.error(error);
          commit("setLoading", false);
          dispatch("setAuthError", error);
        });
    },
  },

  modules: {},
});
