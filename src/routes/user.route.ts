import { Router } from "express";
import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";
import { ResponseStatus } from "./statusCodes.js";
import jwt from "jsonwebtoken";
import { loginValidation } from "../Auth/loginValidation.js";
import { userAuth } from "../Auth/userAuth.js";
import contentModel from "../models/content.model.js";
import { z } from "zod";
import "../types.js";
import { createHash } from "./createHash.js";
import { linkModel } from "../models/link.model.js";

const userRouter = Router();

userRouter.post("/signup", loginValidation, async (req, res) => {
  // get the user name and password
  const { username, password } = req.body;
  let foundUser;

  try {
    // check if the useralready exists
    foundUser = await userModel.findOne({
      username,
    });

    if (foundUser) {
      res.status(ResponseStatus.AuthorizationError).json({
        error: "user already exists",
      });
    }
  } catch (err) {
    res.status(ResponseStatus.ServerError).json({
      message: "server error",
    });
  }

  // hash the pssword
  const hashedPassword = await bcrypt.hash(password, 6);

  try {
    const newUser = await userModel.create({
      username,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        userId: newUser?._id.toString(),
      },
      process.env.USER_JWT_SECRET ?? ""
    );

    res.status(ResponseStatus.Success).json({
      msg: "Signed Up successfully",
      token: `Bearer ${token}`,
    });
  } catch (err) {
    res.status(ResponseStatus.ServerError).json({
      message: "error creating the user",
    });
  }
});

//signin

userRouter.post("/signin", loginValidation, async (req, res) => {
  const { username, password } = req.body;

  let foundUser;

  try {
    // check if username exists or not
    foundUser = await userModel.findOne({ username });
    if (!foundUser) {
      res.status(ResponseStatus.AuthorizationError).json({
        error: "user not found",
      });
    }
  } catch (err) {
    res.status(ResponseStatus.ServerError).json({
      error: "Server error",
    });
  }

  // compare the passwords
  const matchedPassword = await bcrypt.compare(
    password,
    foundUser?.password ?? ""
  );

  if (!matchedPassword) {
    res.status(ResponseStatus.AuthorizationError).json({
      error: "Incorrect Password",
    });
  } else {
    //create a token and return it
    try {
      const token = jwt.sign(
        {
          userId: foundUser?._id.toString(),
        },
        process.env.USER_JWT_SECRET ?? ""
      );

      res.status(ResponseStatus.Success).json({
        msg: "Signed In successfully",
        token: `Bearer ${token}`,
      });
    } catch (err) {
      res.status(ResponseStatus.ServerError).json({
        error: "Error creating token session",
      });
    }
  }
});

userRouter.post("/content", userAuth, async (req, res) => {
  const { type, link, title, tags } = req.body;
  // body validation
  const bodySchema = z.object({
    type: z.string(),
    title: z.string(),
    link: z.string(),
    tags: z.array(z.string()),
  });

  const parsedBody = bodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(ResponseStatus.InputError).json({
      error: parsedBody.error,
    });
  } else {
    try {
      await contentModel.create({
        type,
        title,
        link,
        // tags,
        userId: req.userId,
      });

      res.status(200).json({
        msg: "content created successfully",
      });
    } catch (err) {
      res.status(ResponseStatus.ServerError).json({
        errror: err,
      });
    }
  }
});

userRouter.get("/content", userAuth, async (req, res) => {
  try {
    const { type } = req.query;

    const filter: {
      userId: string | undefined;
      type?: string | undefined;
    } = {
      userId: req.userId,
    };

    if (type) {
      filter.type = type.toString();
    }

    const data = await contentModel.find(filter).populate("userId", "username");

    if (data.length <= 0) {
      return res.status(ResponseStatus.NotFound).json({
        msg: "content not found",
      });
    }

    res.status(ResponseStatus.Success).json({
      contents: data,
    });
  } catch (err) {
    res.status(ResponseStatus.ServerError).json({
      error: err,
    });
  }
});

userRouter.delete("/content", userAuth, async (req, res) => {
  try {
    const { contentId } = req.body;

    await contentModel.deleteOne({
      userId: req.userId,
      _id: contentId,
    });

    res.status(ResponseStatus.Success).json({
      msg: "content deleted successfully",
    });
  } catch (err) {
    res.status(ResponseStatus.ServerError).json({
      error: err,
    });
  }
});

userRouter.post("/brain/share", userAuth, async (req, res) => {
  const { share } = req.body;

  if (share) {
    const hash = createHash(12);
    // search for the user if the user already exists or not
    const link = await linkModel.findOne({
      userId: req.userId,
    });

    if (link) {
      res.status(ResponseStatus.Success).json({
        hash: link.hash,
      });
      return;
    }

    await linkModel.create({
      hash,
      userId: req.userId,
    });

    res.status(ResponseStatus.Success).json({
      hash,
    });
  } else {
    // delete teh link
    await linkModel.deleteOne({
      userId: req.userId,
    });
    res.status(ResponseStatus.Success).json({
      msg: "deleted successfully",
    });
  }
});

userRouter.get("/brain/:shareLink", async (req, res) => {
  const sharedHash = req.params.shareLink;

  try {
    const foundLink = await linkModel
      .findOne({
        hash: sharedHash,
      })
      .populate<{ userId: { username: string; _id: string } }>(
        "userId",
        "username"
      );

    if (!foundLink) {
      res.status(ResponseStatus.AuthorizationError).json({
        error: "Incorrect share Link",
      });
      return;
    }

    const contents = await contentModel.find({
      userId: foundLink.userId?._id,
    });

    res.status(ResponseStatus.Success).json({
      username: foundLink.userId?.username,
      contents,
    });
  } catch (err) {
    res.status(ResponseStatus.ServerError).json({
      error: err,
    });
  }
});

export default userRouter;
