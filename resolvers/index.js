// root resolver
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

    // JWT
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

export default root;
