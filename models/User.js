import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    googleLinkedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export function toSafeUser(user) {
  if (!user) {
    return null;
  }

  const plainUser =
    typeof user.toObject === "function" ? user.toObject() : { ...user };

  delete plainUser.passwordHash;

  return {
    id: String(plainUser._id ?? plainUser.id),
    name: plainUser.name,
    email: plainUser.email,
    googleId: plainUser.googleId ?? null,
    googleLinkedAt: plainUser.googleLinkedAt ?? null,
    createdAt: plainUser.createdAt,
    updatedAt: plainUser.updatedAt,
  };
}

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
