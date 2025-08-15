import {Router} from 'express'
import ProtectRoute from '../Middleware/Auth.js';
import { DeleteMessage, GetMessages, GetUserForSidebar, MarkMessageAsSeen, SendMessage } from '../Controller/MessageController.js';


const MessageRouter = Router();

MessageRouter.get("/users", ProtectRoute, GetUserForSidebar);
MessageRouter.get("/:id", ProtectRoute, GetMessages);
MessageRouter.put("/mark/:id", ProtectRoute, MarkMessageAsSeen);
MessageRouter.post("/send/:id", ProtectRoute, SendMessage);
MessageRouter.delete("/delete/:id", ProtectRoute, DeleteMessage);


export default MessageRouter;
