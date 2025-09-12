# Next.js + Prisma + Neon + Vercel 완전 개발 가이드

## 🎯 프로젝트 개요
- **프로젝트명**: Reading Recorder (책 기록 앱)
- **기능**: 책 검색, 읽은 책 기록 관리
- **배포 URL**: https://khs-book-meter.vercel.app/books
- **기술 스택**: Next.js 15.5.2, Prisma, Neon Database, Vercel

---

## 📚 1단계: 프로젝트 초기 설정

### 1.1 Next.js 프로젝트 생성
```bash
npx create-next-app@latest khs-book-meter
cd khs-book-meter
```

### 1.2 필요한 패키지 설치
```bash
npm install @prisma/client prisma
npm install @neondatabase/serverless @vercel/postgres
```

### 1.3 Prisma 초기화
```bash
npx prisma init
```

---

## 🗄️ 2단계: 데이터베이스 설계

### 2.1 Prisma Schema 작성
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

### 2.2 Neon 데이터베이스 설정
1. [Neon Console](https://console.neon.tech/)에서 프로젝트 생성
2. PostgreSQL 17, AWS Asia Pacific 1 (Singapore) 선택
3. 연결 문자열 복사

### 2.3 환경변수 설정
```env
# .env.local
POSTGRES_PRISMA_URL="postgresql://username:password@host/database?sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://username:password@host/database?sslmode=require"
```

---

## 🏗️ 3단계: 애플리케이션 개발

### 3.1 Prisma 클라이언트 설정
```javascript
// src/lib/prisma.js
import { PrismaClient } from "@/generated/prisma";

const prisma = global.prisma ?? new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
```

### 3.2 데이터 가져오기 함수
```javascript
// src/lib/getter.js
import prisma from "./prisma";

export async function getBooksKeyword(keyword) {
  try {
    const books = await prisma.reviews.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { author: { contains: keyword } }
        ]
      },
      orderBy: { read: 'desc' }
    });
    return books;
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}
```

### 3.3 서버 액션
```javascript
// src/lib/actions.js
"use server";

import prisma from "./prisma";
import { revalidatePath } from "next/cache";

export async function addReview(formData) {
  const id = formData.get("id");
  const read = formData.get("read");
  const memo = formData.get("memo");

  await prisma.reviews.update({
    where: { id },
    data: { read: new Date(read), memo }
  });

  revalidatePath("/");
}

export async function removeReview(id) {
  await prisma.reviews.delete({ where: { id } });
  revalidatePath("/");
}
```

### 3.4 페이지 컴포넌트
```javascript
// src/app/page.js
import { getBooksKeyword } from "@/lib/getter";
import BookDetail from "@/components/BookDetail";

export default async function Home() {
  const books = await getBooksKeyword("리액트");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reading Recorder</h1>
      <div className="grid gap-4">
        {books.map((book, index) => (
          <BookDetail key={book.id} index={index + 1} book={book} />
        ))}
      </div>
    </div>
  );
}
```

### 3.5 검색 페이지
```javascript
// src/app/books/[[...keyword]]/page.js
import LinkedBookDetail from "@/components/LinkedBookDetail";
import { getBooksKeyword } from "@/lib/getter";

export default async function BookResult({ params }) {
  const keyword = params.keyword ? params.keyword.join(" ") : "리액트";
  const books = await getBooksKeyword(keyword);

  return (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">검색 결과: &quot;{keyword}&quot;</h2>
        <p className="text-gray-600">총 {books.length}권의 책을 찾았습니다.</p>
      </div>
      {books.map((b, i) => (
        <LinkedBookDetail key={b.id} index={i + 1} book={b} />
      ))}
    </>
  );
}
```

### 3.6 컴포넌트들
```javascript
// src/components/BookDetail.js
import Link from "next/link";

export default function BookDetail({ index, book }) {
  return (
    <div className="border p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{book.title}</h3>
          <p className="text-gray-600">{book.author}</p>
          <p className="text-sm text-gray-500">{book.publisher}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">{book.price}원</p>
          <Link 
            href={`/edit/${book.id}`}
            className="text-blue-500 hover:underline"
          >
            수정
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## 🐛 4단계: 오류 해결 과정

### 4.1 초기 빌드 오류들

#### 문제 1: React unescaped entities
```bash
Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
```

**해결책:**
```javascript
// 수정 전
<h2>검색 결과: "{keyword}"</h2>

// 수정 후
<h2>검색 결과: &quot;{keyword}&quot;</h2>
```

#### 문제 2: 사용하지 않는 변수
```bash
Warning: 'isPending' is assigned a value but never used.  @typescript-eslint/no-unused-vars
```

**해결책:**
```javascript
// 수정 전
const [isPending, startTransition] = useTransition();

// 수정 후
const [, startTransition] = useTransition();
```

#### 문제 3: Prisma 생성 파일 ESLint 오류
```bash
Error: A `require()` style import is forbidden.  @typescript-eslint/no-require-imports
```

**해결책:**
```javascript
// eslint.config.mjs
{
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**", // 추가
  ],
}
```

### 4.2 Vercel 배포 오류

#### 문제: Prisma Client 생성 실패
```bash
Prisma has detected that this project was built on Vercel, which caches dependencies.
This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered.
```

**해결책:**
```json
// package.json
{
  "scripts": {
    "build": "prisma generate && next build --turbopack"
  }
}
```

### 4.3 Prisma import 경로 오류

#### 문제: 모듈을 찾을 수 없음
```bash
Module not found: Can't resolve '../generated/prisma'
```

**해결책:**
```javascript
// src/lib/prisma.js
// 수정 전
import { PrismaClient } from "../generated/prisma";

// 수정 후
import { PrismaClient } from "@/generated/prisma";
```

---

## 🚀 5단계: 배포 과정

### 5.1 데이터베이스 마이그레이션
```bash
# 데이터베이스 리셋 (개발용)
npx prisma migrate reset --force

# 마이그레이션 실행
npx prisma migrate dev --name init

# Prisma 클라이언트 생성
npx prisma generate
```

### 5.2 Git 관리
```bash
# 브랜치 생성
git checkout -b khs-branch

# 변경사항 커밋
git add .
git commit -m "Fix Prisma import path"
git push origin khs-branch
```

### 5.3 Vercel 설정
1. **환경변수 설정**:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

2. **브랜치 설정**:
   - Production Branch를 `khs-branch`로 변경

3. **자동 배포**:
   - GitHub 푸시 시 자동 배포

---

## 📁 6단계: 최종 프로젝트 구조

```
khs-book-meter/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       └── 20250912100738_init/
├── src/
│   ├── app/
│   │   ├── books/
│   │   │   └── [[...keyword]]/
│   │   │       └── page.js
│   │   ├── edit/
│   │   │   └── [id]/
│   │   │       └── page.js
│   │   ├── layout.js
│   │   └── page.js
│   ├── components/
│   │   ├── BookDetail.js
│   │   ├── FormEdit.js
│   │   └── LinkedBookDetail.js
│   ├── lib/
│   │   ├── prisma.js
│   │   ├── actions.js
│   │   └── getter.js
│   └── generated/
│       └── prisma/
├── .env.local
├── .env
├── package.json
├── eslint.config.mjs
└── DEPLOYMENT_GUIDE.md
```

---

## ✅ 7단계: 최종 결과

### 7.1 배포 성공
- **URL**: https://khs-book-meter.vercel.app/books
- **상태**: 정상 작동 중
- **기능**: 책 검색 및 기록 관리

### 7.2 주요 기능 확인
1. **책 검색**: "리액트" 검색 시 20권의 책 표시
2. **책 정보**: 제목, 저자, 가격, 출판사, 출시일 표시
3. **기록 관리**: 읽은 책 수정 및 삭제 기능

### 7.3 성능 지표
- **빌드 시간**: 약 7-14초
- **페이지 로드**: 200-500ms
- **데이터베이스 연결**: 정상

---

## 🎓 8단계: 학습 포인트

### 8.1 기술적 학습
1. **Next.js 15**: App Router, Server Components
2. **Prisma**: ORM 설정, 마이그레이션, 쿼리
3. **Neon**: PostgreSQL 클라우드 데이터베이스
4. **Vercel**: 배포, 환경변수, 자동 배포

### 8.2 문제 해결 학습
1. **ESLint 오류**: React 규칙, TypeScript 규칙
2. **빌드 오류**: 의존성, 경로, 환경변수
3. **배포 오류**: 데이터베이스 연결, Prisma 설정
4. **Git 관리**: 브랜치, 충돌 해결

### 8.3 개발 워크플로우
1. **로컬 개발** → **오류 해결** → **테스트** → **배포**
2. **데이터베이스 설계** → **API 개발** → **UI 구현** → **배포**
3. **버전 관리** → **브랜치 전략** → **자동 배포**

---

## 🔗 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [Neon 데이터베이스](https://neon.tech/)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [배포된 앱](https://khs-book-meter.vercel.app/books)

---

## 📝 결론

이 프로젝트를 통해 **현대적인 웹 개발 스택**을 사용하여 **완전한 풀스택 애플리케이션**을 개발하고 배포하는 전체 과정을 경험했습니다. 

**주요 성과:**
- ✅ Next.js 15 + Prisma + Neon + Vercel 스택 완성
- ✅ 실제 오류 해결 과정 경험
- ✅ 프로덕션 배포 성공
- ✅ 완전한 개발 가이드 문서화

**다음 단계:**
- 사용자 인증 추가
- 더 많은 책 데이터 수집
- UI/UX 개선
- 성능 최적화
