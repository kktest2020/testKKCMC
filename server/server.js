// Import ApolloServer and Mongoose
const { ApolloServer, AuthenticationError } = require("apollo-server");
const mongoose = require("mongoose");

// Import Environmental Variables
require("dotenv").config({ path: "variables.env" });

// Import Mongoose Models
const User = require("./models/User");
const Post = require("./models/Post");

// Import typeDefs
const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "typeDefs.gql");

const typeDefs = fs.readFileSync(filePath, "utf-8");

// Import Resolvers
const resolvers = require("./resolvers");
const jwt = require("jsonwebtoken");

// verify jwt passed from the client
const getUser = async (token) => {
  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (error) {
      throw new AuthenticationError(
        "Your session has expired. Please signin again!"
      );
    }
  }
};

//Connect to Remote MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("db connected"))
  .catch((error) => console.error(error));

//Create Apollo/GraphQL Server using typeDefs, resolvers and context object
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError(error) {
    return { name: error.name, message: error.message };
  },
  // Context is where we define Models and other shared states
  context: async ({ req }) => {
    const token = req.headers["authorization"];
    const user = await getUser(token);
    return {
      User,
      Post,
      currentUser: user,
    };
  },
});

// Start Apollo/GraphQL Server by listening to the default port 27017
server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url} `);
  console.log("server");
});
