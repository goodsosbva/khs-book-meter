# Next.js + Prisma + Neon + Vercel 배포 실습 가이드

## 📋 프로젝트 개요

- **프로젝트명**: Reading Recorder (책 기록 앱)
- **기술 스택**: Next.js 15.5.2, Prisma, Neon Database, Vercel
- **배포 URL**: https://khs-book-meter.vercel.app/books

## 🚀 배포 과정 및 문제 해결

### 1. 초기 빌드 오류 해결

#### 문제 상황

```bash
Failed to compile.

./src/app/books/[[...keyword]]/page.js
11:54  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
11:64  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities

./src/components/FormEdit.js
7:10  Warning: 'isPending' is assigned a value but never used.  @typescript-eslint/no-unused-vars

./src/generated/prisma/client.js
4:23  Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
```

#### 해결 방법

**1.1 React unescaped entities 오류 수정**

```javascript
// src/app/books/[[...keyword]]/page.js
// 수정 전
<h2 className="text-lg font-semibold">검색 결과: "{keyword}"</h2>

// 수정 후
<h2 className="text-lg font-semibold">검색 결과: &quot;{keyword}&quot;</h2>
```

**1.2 사용하지 않는 변수 정리**

```javascript
// src/components/FormEdit.js
// 수정 전
const [isPending, startTransition] = useTransition();

// 수정 후
const [, startTransition] = useTransition();
```

**1.3 Prisma 생성 파일 ESLint 제외**

```javascript
// eslint.config.mjs
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/generated/**", // 추가
    ],
  },
];
```

### 2. Vercel 배포 오류 해결

#### 문제 상황

```
Prisma has detected that this project was built on Vercel, which caches dependencies.
This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered.
```

#### 해결 방법

**2.1 빌드 스크립트 수정**

```json
// package.json
{
  "scripts": {
    "build": "prisma generate && next build --turbopack"
  }
}
```

### 3. Neon 데이터베이스 설정

#### 3.1 Neon 프로젝트 생성

- [Neon Console](https://console.neon.tech/)에서 프로젝트 생성
- PostgreSQL 17 버전 선택
- AWS Asia Pacific 1 (Singapore) 리전

#### 3.2 환경변수 설정

```env
# .env.local (로컬 개발용)
POSTGRES_PRISMA_URL="postgresql://username:password@host/database?sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://username:password@host/database?sslmode=require"
```

#### 3.3 Prisma 마이그레이션

```bash
# 데이터베이스 리셋 (개발용)
npx prisma migrate reset --force

# 마이그레이션 실행
npx prisma migrate dev --name init

# Prisma 클라이언트 생성
npx prisma generate
```

### 4. Prisma import 경로 오류 해결

#### 문제 상황

```
Module not found: Can't resolve '../generated/prisma'
```

#### 해결 방법

```javascript
// src/lib/prisma.js
// 수정 전
import { PrismaClient } from "../generated/prisma";

// 수정 후
import { PrismaClient } from "@/generated/prisma";
```

### 5. Vercel 환경변수 설정

#### 5.1 Vercel 대시보드 설정

- Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
- 다음 환경변수 추가:
  - `POSTGRES_PRISMA_URL`
  - `POSTGRES_URL_NON_POOLING`

#### 5.2 브랜치 설정

- Production Branch를 `khs-branch`로 변경

## 📁 프로젝트 구조

```
khs-book-meter/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── books/[[...keyword]]/
│   │   └── edit/[id]/
│   ├── components/
│   ├── lib/
│   │   ├── prisma.js
│   │   ├── actions.js
│   │   └── getter.js
│   └── generated/prisma/
├── .env.local
├── package.json
└── eslint.config.mjs
```

## 🔧 핵심 설정 파일

### Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

model reviews {
  id        String   @id
  title     String
  author    String
  price     Int
  publisher String
  published String
  image     String
  read      DateTime @default(now())
  memo      String
}
```

### Package.json

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "prisma generate && next build --turbopack",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@neondatabase/serverless": "^1.0.1",
    "@prisma/client": "^6.15.0",
    "@vercel/postgres": "^0.10.0",
    "next": "15.5.2",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  }
}
```

## ✅ 최종 결과

### 배포 성공

- **URL**: https://khs-book-meter.vercel.app/books
- **기능**: 책 검색 및 기록 관리
- **데이터베이스**: Neon PostgreSQL
- **상태**: 정상 작동 중

### 주요 기능

1. 책 검색 (예: "리액트" 검색 시 20권의 책 표시)
2. 책 정보 표시 (제목, 저자, 가격, 출판사, 출시일)
3. 읽은 책 기록 관리

## 🎯 학습 포인트

1. **ESLint 오류 해결**: React unescaped entities, unused variables
2. **Prisma 설정**: Neon 데이터베이스 연결 및 마이그레이션
3. **Vercel 배포**: 환경변수 설정 및 빌드 최적화
4. **Import 경로**: 절대 경로 사용으로 모듈 해결
5. **Git 관리**: 브랜치 전략 및 충돌 해결

## 🔗 참고 링크

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [Neon 데이터베이스](https://neon.tech/)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [배포된 앱](https://khs-book-meter.vercel.app/books)
