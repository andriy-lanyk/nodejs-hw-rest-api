const jwt = require('jsonwebtoken');
// const fs = require('fs/promises');
const path = require('path');
const mkdirp = require('mkdirp');
const Users = require('../repository/users');
const UploadService = require('../services/file-upload');
// const UploadService = require('../services/cloud-upload');
const { CustomError } = require('../helpers/customError');
const { HttpCode } = require('../config/constants');
const EmailService = require('../services/email/service');
const {
  CreateSenderSendGrid,
  CreateSenderNodemailer,
} = require('../services/email/sender');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET_KEY;

const registration = async (req, res, next) => {
  const { email, password, subscription } = req.body;
  const user = await Users.findByEmail(email);
  if (user) {
    return res.status(HttpCode.CONFLICT).json({
      status: 'error',
      code: HttpCode.CONFLICT,
      message: 'Email is already exist',
    });
  }
  try {
    const newUser = await Users.create({ email, password, subscription });
    console.log('newUser: ', newUser);
    const emailService = new EmailService(
      process.env.NODE_ENV,
      new CreateSenderSendGrid()
    );
    const statusEmail = await emailService.sendVerifyEmail(
      newUser.email,
      newUser.verifyToken
    );
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      code: HttpCode.CREATED,
      data: {
        id: newUser.id,
        email: newUser.email,
        subscription: newUser.subscription,
        avatar: newUser.avatar,
        successEmail: statusEmail,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, _next) => {
  const { email, password } = req.body;
  const user = await Users.findByEmail(email);
  const isValidPassword = await user?.isValidPassword(password);
  if (!user || !isValidPassword) {
    //Should be else ||!user?.verify
    return res.status(HttpCode.UNAUTHORIZED).json({
      status: 'error',
      code: HttpCode.UNAUTHORIZED,
      message: 'Invalid credentials',
    });
  }
  const id = user._id;
  const payload = { id };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
  await Users.updateToken(id, token);
  return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    date: {
      token,
    },
  });
};

const logout = async (req, res, _next) => {
  const id = req.user._id;
  console.log('id: ', id);
  await Users.updateToken(id, null);
  return res.status(HttpCode.NO_CONTENT).json({ test: 'test' });
};

const currentUser = async (req, res, _next) => {
  try {
    const { email, subscription, _id } = req.user;
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        id: _id,
        email: email,
        subscription: subscription,
      },
    });
  } catch (error) {
    return res.status(HttpCode.UNAUTORIZED).json({
      status: 'error',
      code: HttpCode.UNAUTORIZED,
      message: 'Not autorizated',
    });
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await Users.updateUserSubscription(userId, req.body);
    if (user) {
      return res.status(HttpCode.OK).json({
        status: 'success',
        code: HttpCode.OK,
        user: {
          id: user.userId,
          email: user.email,
          subscription: user.subscription,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, _next) => {
  const id = String(req.user._id);
  const file = req.file;
  const AVATAR_OF_USERS = process.env.AVATAR_OF_USERS;
  const destination = path.join(AVATAR_OF_USERS, id);
  await mkdirp(destination);

  const uploadService = new UploadService(destination);
  const avatarUrl = await uploadService.save(file, id);
  await Users.updateAvatar(id, avatarUrl);

  return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    data: {
      avatar: avatarUrl,
    },
  });
};

const verifyUser = async (req, res, _next) => {
  const user = await Users.findUserByVerifyToken(req.params.verifyToken);
  if (user) {
    await Users.updateTokenVerify(user._id, true, null);
    return res.status(HttpCode.OK).json({
      status: 'success',
      code: HttpCode.OK,
      data: {
        message: 'Success',
      },
    });
  }
  throw new CustomError(HttpCode.BAD_REQUEST, 'Invalid token');
};

const repeatEmailForVerifyUser = async (req, res, _next) => {
  const { email } = req.body;
  const user = await Users.findByEmail(email);
  if (user) {
    const { email, verifyToken } = user;
    const emailService = new EmailService(
      process.env.NODE_ENV,
      new CreateSenderNodemailer()
    );
    const statusEmail = await emailService.sendVerifyEmail(email, verifyToken);
    console.log('statusEmail: ', statusEmail);
  }
  return res.status(HttpCode.OK).json({
    status: 'success',
    code: HttpCode.OK,
    data: {
      message: 'Success',
    },
  });
};

// Cloud storage
// const uploadAvatar = async (req, res, next) => {
//   const { id, idUserCloud } = req.user
//   const file = req.file

//   const destination = 'Avatars'
//   const uploadService = new UploadService(destination)
//   const { avatarUrl, returnIdUserCloud } = await uploadService.save(
//     file.path,
//     idUserCloud,
//   )

//   await Users.updateAvatar(id, avatarUrl, returnIdUserCloud)
//   try {
//     await fs.unlink(file.path)
//   } catch (error) {
//     console.log(error.message)
//   }
//   return res.status(HttpCode.OK).json({
//     status: 'success',
//     code: HttpCode.OK,
//     date: {
//       avatar: avatarUrl,
//     },
//   })
// }

module.exports = {
  registration,
  login,
  logout,
  currentUser,
  updateSubscription,
  uploadAvatar,
  verifyUser,
  repeatEmailForVerifyUser,
};
