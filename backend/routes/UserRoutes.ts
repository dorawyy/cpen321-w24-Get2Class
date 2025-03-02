import { query, body } from "express-validator";
import { UserController } from "../controllers/UserController";

const controller = new UserController();

export const UserRoutes = [
    {
        method: "post",
        route: "/tokensignin",
        action: controller.tokenSignIn,
        validation: [
            body("idToken").exists().isString(),
            body("audience").exists().isString()
        ]
    },
    {
        method: "get",
        route: "/user",
        action: controller.findUser,
        validation: [
            query("sub").exists().isString()
        ]
    },
    {
        method: "post",
        route: "/user",
        action: controller.createUser,
        validation: [
            body("email").isString(),
            body("sub").exists().isString(),
            body("name").isString()
        ]
    },
    {
        method: "get",
        route: "/notification_settings",
        action: controller.getNotifications,
        validation: [
            query("sub").exists().isString()
        ]
    },
    {
        method: "put",
        route: "/notification_settings",
        action: controller.updateNotifications,
        validation: [
            body("sub").exists().isString(),
            body("notificationsEnabled").isBoolean(),
            body("notificationTime").toInt()
        ]
    },
    {
        method: "put",
        route: "/karma",
        action: controller.updateKarma,
        validation: [
            body("sub").exists().isString(),
            body("karma").isInt()
        ]
    }
];