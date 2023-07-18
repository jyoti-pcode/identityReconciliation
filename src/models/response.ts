import { Response } from "express";
// fucntion to return response
export const sendResponse = (
    res: Response,
    data?: Object,
    statusCode?: number,
    success?: boolean
) => {
    return res.status(statusCode ?? 200).json({
        success: success ?? true,
        data: data ?? {},
    });
};