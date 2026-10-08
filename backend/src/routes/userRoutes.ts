import { Router } from "express";

import { createUserController } from "../controllers/userControllers";

const router = Router()

router.post('/auth/register', createUserController)
// router.post("/auth/login", loginUser)

// router.get("/users", getAllUsers )
// router.get("/users/:id", getUserById)
// router.put("/users/:id", updateUserById)
// router.delete("/users/:id", deleteById)

export default router