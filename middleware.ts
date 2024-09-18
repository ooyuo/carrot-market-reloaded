import { NextRequest, NextResponse } from "next/server";
import getSession from "./lib/session";

interface Routes {
  [key: string]: boolean;
}

const publicOnlyUrls: Routes = {
  "/": true,
  "/login": true,
  "/sms": true,
  "/create-account": true,
};

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const exists = publicOnlyUrls[request.nextUrl.pathname];

  if (!session.id) {
    if (!exists) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (exists) {
      return NextResponse.redirect(new URL("/products", request.url));
    }
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

/*
  Middleware 사용 케이스
  1. 인증 및 권한 부여: 특정 페이지나 API 라우트에 대한 액세스 권한을 부여하기 전에 사용자 신원을 확인, 세션 쿠키를 확인할 때 사용
  2. 서버 사이드 리디렉션: 특정 조건에 따라 서버에서 사용자를 리디렉션
  3. Path rewriting: request 속성을 기반으로 API 라우트 또는 페이지에 대한 라우트를 동적으로 재작성 하여, A/B테스트, 기능 출시 또는 레거시 경로 지원
  4. 봇 탐지: 봇 트래픽을 탐지하고 차단하여 리소스 보호
  5. 로깅 및 분석
  6. 기능 플래그 지정
*/

/*
  matcher: matcher에 지정한 특정 경로들에서만 미들웨어가 실행되도록 함
*/
