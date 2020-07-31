<template>
  <v-container v-if="homePosts">
    <v-row>
      <v-col>
        <h1 class="carousel__title text-center">Carousel</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col xs12>
        <v-carousel cycle interval="3000">
          <v-carousel-item
            v-for="post in homePosts"
            :key="post._id"
            :src="post.imageUrl"
            class="carousel__item text-center"
            @click.native="gotoPost(post._id)"
          >
            <h1 class="carousel__item__title">{{post.title}}</h1>
          </v-carousel-item>
        </v-carousel>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { gql } from "apollo-boost";
import { mapGetters } from "vuex";

export default {
  name: "Home",
  data() {
    return {
      posts: [],
    };
  },
  computed: {
    ...mapGetters({
      homePosts: "posts",
    }),
  },
  methods: {
    handleGetCarouselPosts() {
      this.$store.dispatch("getPosts");
    },
    gotoPost(postId) {
      this.$router.push(`/posts/${postId}`);
    },
  },
  created() {
    this.handleGetCarouselPosts();
  },
  // apollo: {
  //   getPosts: {
  //     query: gql`
  //       query {
  //         getPosts {
  //           _id
  //           title
  //           imageUrl
  //           description
  //         }
  //       }
  //     `,
  //     result({ data, loading }) {
  //       if (!loading) this.posts = data.getPosts;
  //     }
  //   }
  // }
};
</script>

<style lang="scss" scoped>
.carousel__iten {
  position: relative;
}
.carousel__item__title {
  position: absolute;
  bottom: 50px;
  left: 0;
  right: 0;
}
</style>