import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import * as resolvers from "./resolvers";

const SECRET_KEY = "akukulu";

// Mock user data
const users = [
  {
    id: 1,
    username: "face",
    password: "$2a$10$kE2h.LzD./GOMf3FnJHl3u7Ko9/c.dAxJom72mjqrxI1Dk1slcYbW", // 'password123'
    role: "admin",
  },
];

// GraphQL schema
const schema = buildSchema(`
  type Query {
    login(username: String!, password: String!): String
    getUser: User
  }

  type User {
    id: ID!
    username: String!
    role: String!
  }
`);

// root resolver

// Middleware, authenticate the user by checking the token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const user = jwt.verify(token, SECRET_KEY);
      req.user = user;
    } catch (err) {
      console.error("Token verification failed:", err);
    }
  }
  next();
};

const app = express();
app.use(authenticate);

app.use(
  "/graphql",
  graphqlHTTP((req) => ({
    schema,
    rootValue: resolvers,
    graphiql: true,
    context: { user: req.user },
  }))
);

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000/graphql");
});
