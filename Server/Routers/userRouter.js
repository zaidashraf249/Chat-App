// // Routes/UserRoutes.js
// import { Router } from 'express';
// import { checkAuth, logIn, SignUp, updateProfile } from '../Controller/UserController.js';
// import ProtectRoute from '../Middleware/Auth.js';

// const UserRouter = Router();

// UserRouter.post("/signup", SignUp);
// UserRouter.post("/login", logIn);
// UserRouter.put("/update-profile", ProtectRoute, updateProfile);
// UserRouter.get("/check", ProtectRoute, checkAuth);

// export default UserRouter;


import { Router } from 'express';
import { SignUp, logIn, checkAuth, updateProfile } from '../Controller/UserController.js';
import ProtectRoute from '../Middleware/Auth.js';

const UserRouter = Router();

UserRouter.put("/update-profile/:id", ProtectRoute, updateProfile);
UserRouter.get("/check", ProtectRoute, checkAuth);
UserRouter.post("/signup", SignUp);
UserRouter.post("/login", logIn);

export default UserRouter;
