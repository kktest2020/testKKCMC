import { gql } from "apollo-boost";

// Posts Queries
export const GET_POSTS = gql`
  query {
    getPosts {
      _id
      title
      imageUrl
    }
  }
`;

export const SEARCH_POSTS = gql`
  query($searchText: String) {
    searchPosts(searchText: $searchText) {
      _id
      title
      description
      imageUrl
      likes
    }
  }
`;

export const USER_POSTS = gql`
  query($userId: ID!) {
    userPosts(userId: $userId) {
      _id
      title
      description
      categories
      imageUrl
      likes
    }
  }
`;

export const GET_POST = gql`
  query($id: ID!) {
    getPost(id: $id) {
      _id
      title
      imageUrl
      categories
      description
      likes
      comments
      createdDate
      createdBy {
        _id
        username
        avatar
        email
      }
      messages {
        _id
        messageBody
        messageDate
        messageUser {
          _id
          username
          avatar
          email
        }
      }
    }
  }
`;

export const INFINITE_SCROLL_POSTS = gql`
  query($pageNum: Int!, $pageSize: Int!) {
    infiniteScrollPosts(pageNum: $pageNum, pageSize: $pageSize) {
      posts {
        _id
        title
        imageUrl
        categories
        description
        likes
        comments
        createdDate
        # messages {
        #   _id
        # }
        createdBy {
          _id
          username
          avatar
          email
        }
      }
      hasMore
    }
  }
`;

// Users Queries
export const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      _id
      username
      password
      email
      avatar
      joinDate
      favorites {
        _id
        title
        imageUrl
        createdDate
      }
    }
  }
`;

// Posts Mutations
export const ADD_POST = gql`
  mutation(
    $title: String!
    $imageUrl: String!
    $categories: [String]!
    $description: String!
    $creatorId: ID!
  ) {
    addPost(
      title: $title
      imageUrl: $imageUrl
      categories: $categories
      description: $description
      creatorId: $creatorId
    ) {
      _id
      title
      imageUrl
      categories
      description
    }
  }
`;
export const UPDATE_USER_POST = gql`
  mutation(
    $_id: ID!
    $title: String!
    $imageUrl: String!
    $categories: [String]!
    $description: String!
    $creatorId: ID!
  ) {
    updateUserPost(
      _id: $_id
      title: $title
      imageUrl: $imageUrl
      categories: $categories
      description: $description
      creatorId: $creatorId
    ) {
      _id
      title
      imageUrl
      categories
      description
      createdBy {
        _id
        username
        email
        avatar
      }
    }
  }
`;

export const DELETE_USER_POST = gql`
  mutation($postId: ID!, $userId: ID!) {
    deleteUserPost(postId: $postId, userId: $userId) {
      _id
      createdBy {
        _id
      }
    }
  }
`;

export const ADD_POST_MESSAGE = gql`
  mutation($messageBody: String!, $userId: ID!, $postId: ID!) {
    addPostMessage(
      messageBody: $messageBody
      userId: $userId
      postId: $postId
    ) {
      _id
      messageBody
      messageDate
      messageUser {
        _id
        username
        email
        avatar
      }
    }
  }
`;

export const LIKE_POST = gql`
  mutation($postId: ID!, $userId: ID!) {
    likePost(postId: $postId, userId: $userId) {
      likes
      favorites {
        _id
        title
        imageUrl
        createdBy {
          _id
          username
          email
          avatar
        }
      }
    }
  }
`;
export const UNLIKE_POST = gql`
  mutation($postId: ID!, $userId: ID!) {
    unlikePost(postId: $postId, userId: $userId) {
      likes
      favorites {
        _id
        title
        imageUrl
        createdBy {
          _id
          username
          email
          avatar
        }
      }
    }
  }
`;

//Users Mutations

export const SIGNIN_USER = gql`
  mutation($username: String!, $password: String!) {
    signinUser(username: $username, password: $password) {
      token
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation($username: String!, $email: String!, $password: String!) {
    signupUser(username: $username, email: $email, password: $password) {
      token
    }
  }
`;
