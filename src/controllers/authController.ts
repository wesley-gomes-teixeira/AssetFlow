const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
import type { AuthenticatedUser, RequestLike, ResponseLike } from "../types";

function buildToken(user: AuthenticatedUser): string {
  const secret = process.env.JWT_SECRET || "assetflow-secret";

  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: "8h" }
  );
}

async function register(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Os campos name, email e password sao obrigatorios."
      });
    }

    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        message: "Esse email ja esta registrado."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      role: "analyst"
    });

    const token = buildToken(user);
    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao registrar usuario.",
      details: error instanceof Error ? error.message : "Erro inesperado"
    });
  }
}

async function login(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Os campos email e password sao obrigatorios."
      });
    }

    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        message: "Email ou senha incorretos."
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Email ou senha incorretos."
      });
    }

    const token = buildToken({ id: user.id, name: user.name, email: user.email, role: user.role });
    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao fazer login.",
      details: error instanceof Error ? error.message : "Erro inesperado"
    });
  }
}

module.exports = {
  register,
  login
};
