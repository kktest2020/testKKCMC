const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createToken = (user, secret, expiresIn) => {
  const { username, email } = user;
  return jwt.sign({ username, email }, secret, { expiresIn });
};

module.exports = {
  Query: {
    getCurrentUser: async (parent, args, { User, currentUser }) => {
      // console.log("resolvers1 ");
      // console.log({ currentUser });
      if (!currentUser) {
        return null;
      }
      const user = await User.findOne({
        username: currentUser.username,
      }).populate({
        path: "favorites",
        model: "Post",
        populate: { path: "createdBy", model: "User" },
      });
      // console.log("user", user);
      return user;
    },
    getUsers: async (parent, args, { User }, info) =>
      await User.find({}).sort({ createdDate: "desc" }),

    getPost: async (parent, { id }, { Post }, info) =>
      await Post.findOne({ _id: id }).populate([
        {
          path: "createdBy",
          model: "User",
        },
        {
          path: "messages.messageUser",
          model: "User",
        },
      ]),
    getPosts: async (parent, args, { Post }, info) =>
      await Post.find({})
        .sort({ createdDate: "desc" })
        .populate({ path: "createdBy", model: "User" }),
    searchPosts: async (parent, { searchText }, { Post }) => {
      const searchPosts = await Post.find(
        // Search on all text indexed fields
        {
          $text: {
            $search: searchText,
            $caseSensitive: false,
            // $diacriticSensitive: true,
          },
        },
        // Search on all text indexed fields
        // {
        //   $regex: searchText,
        //   $options: "i",
        // }
        // Calculate a relativeness score on
        { score: { $meta: "textScore" } }
      )
        .sort({
          score: { $meta: "textScore" },
          likes: "desc",
        })
        .limit(5);

      return searchPosts;
    },
    userPosts: async (parent, { userId }, { Post }, info) =>
      await Post.find({
        createdBy: userId,
      })
        .sort({ createdDate: "desc" })
        .populate({ path: "createdBy", model: "User" }),

    infiniteScrollPosts: async (parent, { pageNum, pageSize }, { Post }) => {
      // console.log("resolver infiniteScrollPosts");
      let posts, hasMore, skipNum, totalPosts;

      if (pageNum === 1) {
        posts = await Post.find({})
          .sort({ createdDate: "DESC" })
          .populate({
            path: "createdBy",
            model: "User",
          })
          .limit(pageSize);
      } else if (pageNum > 1) {
        skipNum = pageSize * (pageNum - 1);

        posts = await Post.find({})
          .populate({
            path: "createdBy",
            model: "User",
          })
          .sort({ createdDate: "DESC" })
          .skip(skipNum)
          .limit(pageSize);

        totalPosts = await Post.countDocuments({});
        foundPosts = pageNum * pageSize;
        hasMore = totalPosts > foundPosts;

        // console.log({ totalPosts, foundPosts, hasMore });
      }
      return {
        posts,
        hasMore,
      };
    },
  },

  Mutation: {
    signinUser: async (parent, { username, password }, { User }) => {
      const user = await User.findOne({ username });

      if (!user) {
        throw new Error("User not found");
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      return { token: createToken(user, process.env.SECRET, "1h") };
    },
    signupUser: async (
      parent,
      { username, email, password }, //args restructured
      { User }, // context from apollo server restructured
      info //
    ) => {
      const user = await User.findOne({ username });

      if (user) {
        throw new Error("User already exists");
      }

      // console.log("r signupUser");
      const newUser = await new User({ username, email, password }).save();

      // console.log({ newUser });

      return { token: createToken(newUser, process.env.SECRET, "1H") };
    },

    addPost: async (
      parent,
      { title, imageUrl, categories, description, creatorId },
      { Post },
      info
    ) => {
      const newPost = await new Post({
        title,
        imageUrl,
        categories,
        description,
        createdBy: creatorId,
      }).save();

      return newPost;
    },

    addPostMessage: async (
      parent,
      { messageBody, userId, postId },
      { Post },
      info
    ) => {
      // console.log("resolver addPostMessage");
      let newMessage = {
        messageBody,
        messageUser: userId,
      };
      const post = await Post.findOneAndUpdate(
        // Find the post
        { _id: postId },
        // Update the messages array on the post
        {
          $push: {
            messages: {
              $each: [newMessage],
              $position: 0,
            },
          },
        },
        // Return the fresh updated
        { new: true }
      ).populate({
        path: "messages.messageUser",
        model: "User",
      });

      return post.messages[0];
    },

    likePost: async (parent, { postId, userId }, { Post, User }, info) => {
      // console.log("likePost");
      const post = await Post.findOneAndUpdate(
        // Find post
        { _id: postId },
        // Pass updates
        { $inc: { likes: 1 } },
        // Pass extra options
        { new: true }
      );

      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { favorites: postId } },
        { new: true }
      ).populate({
        path: "favorites",
        model: "Post",
        populate: { path: "createdBy", model: "User" },
      });

      return {
        likes: post.likes,
        favorites: user.favorites,
      };
    },
    unlikePost: async (parent, { postId, userId }, { Post, User }, info) => {
      // console.log("unlikePost");
      const post = await Post.findOneAndUpdate(
        // Find post
        { _id: postId },
        // Pass updates
        { $inc: { likes: -1 } },
        // Pass extra options
        { new: true }
      );

      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { favorites: postId } },
        { new: true }
      ).populate({
        path: "favorites",
        model: "Post",
        populate: { path: "createdBy", model: "User" },
      });

      return {
        likes: post.likes,
        favorites: user.favorites,
      };
    },
    updateUserPost: async (
      parent,
      { _id, title, imageUrl, categories, description, creatorId },
      { Post },
      info
    ) => {
      const updatedPost = await Post.findOneAndUpdate(
        // Find document conditions
        { _id, createdBy: creatorId },
        // Update data
        { $set: { title, imageUrl, categories, description } },
        // Return new updated document
        { new: true }
      ).populate({
        path: "createdBy",
        model: "User",
      });

      return updatedPost;
    },
    deleteUserPost: async (parent, { postId, userId }, { Post }, info) => {
      console.log("resolver deleteUserPost");
      const post = await Post.findOneAndRemove({
        _id: postId,
        createdBy: userId,
      });

      return post;
    },
  },
};
