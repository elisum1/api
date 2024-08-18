import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    // Generar un salt para el hash de la contraseña
    const salt = bcrypt.genSaltSync(10);
    // Crear el hash de la contraseña usando el salt
    const hash = bcrypt.hashSync(req.body.password, salt);

    // Crear un nuevo usuario con la contraseña hasheada
    const newUser = new User({
      ...req.body,
      password: hash,
    });

    // Guardar el nuevo usuario en la base de datos
    await newUser.save();
    // Responder con un mensaje de éxito
    res.status(200).send("User has been created.");
  } catch (err) {
    // Manejar errores
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    // Buscar al usuario por nombre de usuario
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "User not found!"));

    // Comparar la contraseña proporcionada con la contraseña hasheada almacenada
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong password or username!"));

    // Crear un token JWT
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );

    // Excluir la contraseña del objeto de usuario antes de enviarlo
    const { password, isAdmin, ...otherDetails } = user._doc;

    // Configuración de la cookie con SameSite y secure
    res
      .cookie("access_token", token, {
        httpOnly: true, // La cookie solo puede ser accedida a través de HTTP(S), no en JavaScript del lado del cliente
        secure: process.env.NODE_ENV === "production", // Solo enviar la cookie sobre HTTPS en producción
        sameSite: "None", // La cookie se enviará en contextos de terceros
      })
      .status(200)
      .json({ details: { ...otherDetails }, isAdmin });
  } catch (err) {
    // Manejar errores
    next(err);
  }
};
