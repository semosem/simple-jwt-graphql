import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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

// GraphQL root resolver
const root = {
  login: async ({ username, password }) => {
    const user = users.find((u) => u.username === username);
    if (!user) {
      throw new Error("User not found");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("Invalid password");
    }

    // Generate a JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });
    return token;
  },

  getUser: (args, { user }) => {
    if (!user) {
      throw new Error("Not authenticated");
    }

    return users.find((u) => u.id === user.userId);
  },
};

// Middleware to authenticate the user by checking the token
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
    rootValue: root,
    graphiql: true,
    context: { user: req.user },
  }))
);

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000/graphql");
});
