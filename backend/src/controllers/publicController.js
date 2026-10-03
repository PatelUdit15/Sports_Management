/**
 * Public & Member Controller
 */

import { PublicService } from "../services/publicService.js";
import { successResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../config/constants.js";

export class PublicController {
  /**
   * GET /api/public/clubs
   */
  static async getClubs(req, res, next) {
    try {
      const clubs = await PublicService.getClubs();
      return successResponse(res, HTTP_STATUS.OK, "Sports clubs retrieved successfully", clubs);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/public/member/register
   */
  static async registerMember(req, res, next) {
    try {
      const { fullName, email, password, phone, age, birthday, gender } = req.body;
      const result = await PublicService.registerMember({
        fullName,
        email,
        password,
        phone,
        age,
        birthday,
        gender,
      });
      return successResponse(res, HTTP_STATUS.CREATED, result.message, result.user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/public/member/login
   */
  static async loginMember(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await PublicService.loginMember({ email, password });
      return successResponse(res, HTTP_STATUS.OK, result.message, result.user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/public/member/confirm-payment
   */
  static async confirmPayment(req, res, next) {
    try {
      const result = await PublicService.confirmPayment(req.body);
      return successResponse(res, HTTP_STATUS.CREATED, result.message, result.membership);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/public/member/pass/:memberId
   */
  static async getMemberPass(req, res, next) {
    try {
      const { memberId } = req.params;
      const pass = await PublicService.getMemberPass(memberId);
      return successResponse(res, HTTP_STATUS.OK, "Member pass retrieved", pass);
    } catch (error) {
      next(error);
    }
  }
}
