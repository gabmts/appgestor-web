module.exports = {
  async me(req, res) {
    // req.user vem do authMiddleware
    const { id, email, role } = req.user;

    return res.json({
      id,
      email,
      role
    });
  }
};
