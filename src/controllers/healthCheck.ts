import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@models/response";
import { STATUS_CODES } from "@enums/statusCodes";

exports.get = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = {
            uptime: process.uptime(),
            message: "Ok",
            date: new Date(),
        };
        return sendResponse(res, data);
    } catch (err) {
        return sendResponse(res, { msg: err.message }, STATUS_CODES.SERVER_ERROR, false);
    }
};