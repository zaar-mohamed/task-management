const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Inscription
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
});

// Connexion
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    if (user.isBlocked) return res.status(403).json({ message: "Utilisateur bloqué" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
});

// Récupérer les utilisateurs
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
});
// Récupérer un utilisateur par ID
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
  }
});


// Mettre à jour un utilisateur
router.put("/users/:id", async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { username, email, role }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
  }
});

// Supprimer un utilisateur
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
  }
});

// Bloquer un utilisateur
router.put("/users/:id/block", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
    res.json({ message: "Utilisateur bloqué", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du blocage de l'utilisateur" });
  }
});

// Débloquer un utilisateur
router.put("/users/:id/unblock", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
    res.json({ message: "Utilisateur débloqué", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du déblocage de l'utilisateur" });
  }
});

router.get("/users/search", async (req, res) => {
    const { name, email, role } = req.query;
    const filter = {};
  
    if (name) filter.username = { $regex: name, $options: "i" };
    if (email) filter.email = { $regex: email, $options: "i" };
    if (role) filter.role = role;
  
    const users = await User.find(filter);
    res.json(users);
  });

module.exports = router;
