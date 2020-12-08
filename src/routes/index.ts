import {Router} from "express";
import authorizationController from "../controller/authorizationController";
import userController from "../controller/userController";

import authorization from "../middlewares/authorization";

const router = Router();

router.get("/", (req, res) => {res.send({message: "Hello World!"})})

router.post("/authorize", authorization, authorizationController.authorize);
router.post("/oauth/token", authorizationController.token);

router.post("/user", userController.create);
router.get("/user/:email", userController.get);
router.delete("/user/:email", userController.delete);

router.post("/client/get-user", userController.getWithAuthToken);

export default router;