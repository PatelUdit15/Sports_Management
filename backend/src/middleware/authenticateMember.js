import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS, ERROR_CODES } from "../config/constants.js";
import prisma from "../config/database.js";

export const authenticateMember = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError(
        "Not authenticated. Please login as member.",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const decoded = verifyToken(token);

    // Get member from database
    const lookupId = decoded.memberId || decoded.userId;
    let member = null;

    if (lookupId) {
      member = await prisma.member.findUnique({
        where: { memberId: lookupId },
        include: {
          club: {
            include: {
              moduleConfiguration: true,
            },
          },
        },
      });
    }

    if (!member && decoded.email) {
      member = await prisma.member.findFirst({
        where: { email: decoded.email.trim().toLowerCase() },
        include: {
          club: {
            include: {
              moduleConfiguration: true,
            },
          },
        },
      });
    }

    if (!member) {
      throw new AppError(
        "Member not found or has been deleted",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    if (member.status === "INACTIVE" || member.status === "SUSPENDED" || member.status === "CANCELLED") {
      throw new AppError(
        "Member account is inactive or suspended",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    // Attach member and club to request
    req.member = member;
    req.clubId = member.clubId;
    req.modules = member.club?.moduleConfiguration || {
      courtBooking: true,
      shop: true,
      bar: true,
      membership: true,
      hr: true,
      accounting: true,
    };

    next();
  } catch (error) {
    next(error);
  }
};

