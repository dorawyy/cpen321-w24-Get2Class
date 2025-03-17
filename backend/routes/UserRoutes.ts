import { query, body } from "express-validator";
import { UserController } from "../controllers/UserController";

const controller = new UserController();

export const UserRoutes = [
    {
        method: "post",
        route: "/tokensignin",
        action: controller.tokenSignIn.bind(controller),
        validation: [
            body("idToken").exists().isString(),
            body("audience").exists().isString()
        ]
    },
    {
        method: "get",
        route: "/user",
        action: controller.findUser.bind(controller),
        validation: [
            query("sub").exists().isAlphanumeric()
        ]
    },
    {
        method: "post",
        route: "/user",
        action: controller.createUser.bind(controller),
        validation: [
            body("email").isString(),
            body("sub").exists().isAlphanumeric(),
            body("name").isString()
        ]
    },
    {
        method: "get",
        route: "/notification_settings",
        action: controller.getNotifications.bind(controller),
        validation: [
            query("sub").exists().isAlphanumeric()
        ]
    },
    {
        method: "put",
        route: "/notification_settings",
        action: controller.updateNotifications.bind(controller),
        validation: [
            body("sub").exists().isAlphanumeric(),
            body("notificationsEnabled").isBoolean(),
            body("notificationTime").toInt()
        ]
    },
    {
        method: "put",
        route: "/karma",
        action: controller.updateKarma.bind(controller),
        validation: [
            body("sub").exists().isAlphanumeric(),
            body("karma").isInt()
        ]
    }
];