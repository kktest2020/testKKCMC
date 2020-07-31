<template>
  <v-container fluid v-if="infiniteScrollPosts">
    <v-row>
      <v-col :cols="12" :sm="6" v-for="post of infiniteScrollPosts.posts" :key="post._id">
        <v-card>
          <v-img :src="post.imageUrl" height="30vh" @click="gotoPost(post._id)">
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
              </v-row>
            </template>
          </v-img>

          <v-row justify="space-between" align="center">
            <v-col :cols="10">
              <v-card-title @click="gotoPost(post._id)">{{post.title}}</v-card-title>
              <v-card-subtitle>{{post.likes}} likes - {{post.comments}} comments</v-card-subtitle>
            </v-col>
            <v-col :cols="2">
              <v-btn icon @click="show = !show">
                <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <v-expand-transition>
            <v-list v-show="show">
              <v-divider></v-divider>
              <v-list-item>
                <v-list-item-avatar>
                  <v-img :src="post.createdBy.avatar"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-text="post.createdBy.username"></v-list-item-title>
                  <v-list-item-subtitle v-text="formatDate(post.createdDate)"></v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-icon>
                  <v-icon color="grey">info</v-icon>
                </v-list-item-icon>
              </v-list-item>
            </v-list>
          </v-expand-transition>
          <!-- <v-expand-transition>
            <div v-show="show">
              <v-divider></v-divider>

              <v-card-text>{{post.description}}</v-card-text>
            </div>
          </v-expand-transition>-->
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="justify-center d-flex">
        <v-btn v-if="showMoreEnabled" @click="showMorePosts">Show more</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { INFINITE_SCROLL_POSTS } from "../../queries";

const pageSize = 2;

export default {
  name: "Posts",
  created() {
    console.log(this.infiniteScrollPosts);
  },
  data() {
    return {
      pageNum: 1,
      showMoreEnabled: true,
      infiniteScrollPosts: {},
      show: false
    };
  },
  methods: {
    gotoPost(postId) {
      this.$router.push(`/posts/${postId}`);
    },
    formatDate(timestamp) {
      console.log({ timestamp });
      let date = new Date(+timestamp);
      return date.toDateString();
    },
    showMorePosts() {
      this.pageNum += 1;

      this.$apollo.queries.infiniteScrollPosts.fetchMore({
        variables: {
          pageNum: this.pageNum,
          pageSize
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          let newPosts, oldPosts, typeName, hasMore;

          oldPosts = prevResult.infiniteScrollPosts.posts;
          newPosts = fetchMoreResult.infiniteScrollPosts.posts;
          typeName = prevResult.infiniteScrollPosts.__typename;

          this.showMoreEnabled = fetchMoreResult.infiniteScrollPosts.hasMore;

          return {
            infiniteScrollPosts: {
              __typename: typeName,
              posts: [...oldPosts, ...newPosts],
              hasMore
            }
          };
        }
      });
    }
  },
  apollo: {
    infiniteScrollPosts: {
      query: INFINITE_SCROLL_POSTS,
      variables: {
        pageNum: 1,
        pageSize: pageSize
      }
    }
  }
};
</script>

<style scopped>
img {
  height: 150px;
  cursor: pointer;
}
.v-card__title,
.v-image {
  cursor: pointer;
}
</style>