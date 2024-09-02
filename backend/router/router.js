import { Router } from "express";
import {save} from "../controller/save.js";
const router = Router();

router.post("/save", save);


export default router;
