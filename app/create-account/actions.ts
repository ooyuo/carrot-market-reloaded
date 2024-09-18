"use server";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import getSession from "@/lib/session";

const checkUsername = (username: string) => !username.includes("potato");

const checkPasswords = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "Username must be a string",
        required_error: "where is my username?",
      })
      .min(3, "way too short")
      .max(10, "That is too long")
      .trim()
      .refine(checkUsername, "No potatoes allowed"),
    email: z.string().email().toLowerCase(),
    password: z.string().min(PASSWORD_MIN_LENGTH),
    confirm_password: z.string().min(PASSWORD_MIN_LENGTH),
  })
  .superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "This username is already taken",
        path: ["username"],
        fatal: true,
      });
      return z.NEVER;
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "This email is already taken",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER;
    }
  });

export async function createAccount(prevState: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  const result = await formSchema.spa(data);

  if (!result.success) {
    console.log(result.error.flatten());
    return result.error.flatten();
  } else {
    const hashedPasswowrd = await bcrypt.hash(result.data.password, 12);
    const user = await db.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        password: hashedPasswowrd,
      },
      select: {
        id: true,
      },
    });

    const session = await getSession();
    session.id = user.id;
    await session.save();

    redirect("/profile");
  }
}

/*
  refine: 단순한 형식이 아니라 존재 여부인 경우, DB에서 해당 자료를 조회해야함
*/

/*
  formSchema.safeParse: 동기식, 스키마에 동기식 검증만 포함되어있을때 사용, 검증 결과를 즉시반환
  formSchema.safeParseAsync: 비동기, 스키마에 비동기 검증이 포함되어있을때 사용, 결과를 얻으려면 Promise 사용 해야함
    > 스키마에 데이터베이스에서 이메일의 고유성을 확인하거나, API를 호출하는 등 비동기 논리가 포함되어있는 경우 사용
*/

/*
  bcrypt 비밀번호 해시
  - 보안상 데이터가 유출되어도, 원본 비밀번호를 알 수 없어 해킹당하지 않음
  - 정형데이터로 정해진 양식, 정해진 길이로 맞출수 있음
*/

/*
  fatal: true: 오류 발생 시 검증을 즉시 종료하도록 설정
  z.NEVER: 오류 상태를 명확히 하여 검증이 실패했음을 Zod에 알리는 역할 
  (The return value is not used, but we need to return something to satisfy the typing)
*/
