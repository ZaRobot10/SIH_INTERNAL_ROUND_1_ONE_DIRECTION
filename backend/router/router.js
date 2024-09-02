import { Router } from "express";
import {save,login,signup} from "../controller/save.js";
import { jwtAuth } from "../controller/middleware.js";
const router = Router();

router.post("/save", save);
router.post("/login",login);
router.post("/signup",signup);
router.post("/protectroute", jwtAuth);
export default router;
