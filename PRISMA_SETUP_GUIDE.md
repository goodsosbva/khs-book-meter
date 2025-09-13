# Prisma 설정 완전 가이드

## 📋 목차

1. [Prisma란 무엇인가?](#prisma란-무엇인가)
2. [JavaScript용 클라이언트 생성](#javascript용-클라이언트-생성)
3. [생성될 폴더 위치](#생성될-폴더-위치)
4. [연결 주소 설정](#연결-주소-설정)
5. [직접 연결 주소 설정](#직접-연결-주소-설정)
6. [전체 설정 흐름](#전체-설정-흐름)
7. [실제 사용 예시](#실제-사용-예시)

---

## Prisma란 무엇인가?

### 문제 상황

```javascript
// JavaScript에서 데이터베이스 사용하려면?
const query = "SELECT * FROM reviews WHERE title LIKE ?";
const result = await db.query(query, [`%${keyword}%`]);
```

**문제점:**

- SQL을 직접 작성해야 함
- 데이터베이스마다 문법이 다름
- 타입 안전성 없음
- 실수하기 쉬움

### Prisma의 해결책

```javascript
// Prisma 클라이언트 사용하면?
const books = await prisma.reviews.findMany({
  where: { title: { contains: keyword } },
});
```

**장점:**

- SQL을 몰라도 됨
- 자동 완성 지원
- 타입 안전성 보장
- 데이터베이스 독립적

---

## JavaScript용 클라이언트 생성

### 왜 필요한가?

Prisma는 **데이터베이스와 JavaScript를 연결하는 번역기**입니다.

```prisma
generator client {
  provider = "prisma-client-js"  // JavaScript용 클라이언트
  output   = "../src/generated/prisma"
}
```

### 다른 언어도 지원

- `prisma-client-js`: JavaScript/TypeScript
- `prisma-client-python`: Python
- `prisma-client-go`: Go
- `prisma-client-rust`: Rust

### 동작 과정

```
schema.prisma 읽기
    ↓
JavaScript 코드 생성
    ↓
src/generated/prisma/ 폴더에 저장
```

---

## 생성될 폴더 위치

### 경로 설정

```prisma
generator client {
  output = "../src/generated/prisma"  // 상대 경로
}
```

**경로 해석:**

```
prisma/schema.prisma (현재 위치)
    ↓
../ (한 단계 위로)
    ↓
src/generated/prisma (최종 위치)
```

### 실제 폴더 구조

```
khs-book-meter/
├── prisma/
│   └── schema.prisma
└── src/
    └── generated/
        └── prisma/          ← 여기에 생성됨
            ├── index.js
            ├── index.d.ts
            ├── edge.js
            ├── client.js
            └── default.js
```

### 생성되는 파일들의 역할

#### 1. `index.js` - 메인 클라이언트

**왜 생성되는가?**

Prisma는 **설계도만으로는 실제로 사용할 수 없습니다**. 마치 건축 설계도만으로는 집을 살 수 없는 것처럼요.

```
schema.prisma (설계도) → index.js (실제 집) → 사용 가능
```

**더 직관적인 비유:**

1. **설계도 (schema.prisma)**: "이런 테이블을 만들어줘"라고 명령
2. **건축업체 (Prisma)**: 설계도를 보고 실제 집을 짓는 역할
3. **완성된 집 (index.js)**: 실제로 살 수 있는 집

**실제 상황:**

- `schema.prisma`: "reviews 테이블에 findMany, create, upsert 메서드를 만들어줘"
- `index.js`: 실제로 사용할 수 있는 JavaScript 클래스와 메서드들

**구체적인 생성 과정:**

1. **설계도 읽기**: `schema.prisma`에서 `model reviews` 발견
2. **클래스 생성**: `ReviewsDelegate` 클래스 자동 생성
3. **메서드 생성**: `findMany`, `create`, `upsert` 등 메서드 자동 생성
4. **SQL 변환 로직**: JavaScript 코드를 SQL로 변환하는 로직 내장

**실제 생성되는 코드:**

```javascript
export class PrismaClient {
  constructor() {
    // 데이터베이스 연결 설정
    this._engine = new QueryEngine();
  }

  get reviews() {
    return new ReviewsDelegate(this);
  }
}

class ReviewsDelegate {
  constructor(prisma) {
    this._prisma = prisma;
  }

  async findMany(options) {
    // 1. JavaScript 옵션을 SQL로 변환
    const sql = this._buildSelectQuery(options);

    // 2. 데이터베이스에 쿼리 실행
    const result = await this._prisma._engine.query(sql);

    // 3. 결과를 JavaScript 객체로 변환
    return this._formatResult(result);
  }

  async create(data) {
    // 1. JavaScript 객체를 SQL INSERT로 변환
    const sql = this._buildInsertQuery(data);

    // 2. 데이터베이스에 실행
    const result = await this._prisma._engine.query(sql);

    // 3. 결과 반환
    return this._formatResult(result);
  }

  async upsert(options) {
    // 1. JavaScript 옵션을 SQL UPSERT로 변환
    const sql = this._buildUpsertQuery(options);

    // 2. 데이터베이스에 실행
    const result = await this._prisma._engine.query(sql);

    // 3. 결과 반환
    return this._formatResult(result);
  }

  // 내부 메서드들 (실제 SQL 생성 로직)
  _buildSelectQuery(options) {
    // WHERE, ORDER BY, LIMIT 등을 SQL로 변환
    return `SELECT * FROM reviews WHERE ...`;
  }

  _buildInsertQuery(data) {
    // JavaScript 객체를 INSERT 문으로 변환
    return `INSERT INTO reviews (id, title, author...) VALUES (...)`;
  }

  _buildUpsertQuery(options) {
    // JavaScript 옵션을 UPSERT 문으로 변환
    return `INSERT INTO reviews (...) VALUES (...) ON CONFLICT (id) DO UPDATE SET ...`;
  }
}
```

**핵심 포인트:**

- **자동 생성**: `schema.prisma`를 읽어서 자동으로 생성
- **SQL 변환**: JavaScript 코드를 SQL로 변환하는 로직 내장
- **타입 안전성**: TypeScript 타입 정의와 함께 생성
- **최적화**: 데이터베이스별로 최적화된 쿼리 생성

**실제 사용 예시:**

```javascript
// 1. 생성된 클라이언트 import
import { PrismaClient } from "@/generated/prisma";

// 2. 클라이언트 인스턴스 생성
const prisma = new PrismaClient();

// 3. 실제 사용 (이때 index.js의 메서드들이 실행됨)
const books = await prisma.reviews.findMany({
  where: { title: { contains: "리액트" } },
});

// 4. 내부적으로 일어나는 일:
// - findMany() 메서드 호출
// - JavaScript 옵션을 SQL로 변환
// - 데이터베이스에 쿼리 실행
// - 결과를 JavaScript 객체로 변환하여 반환
```

**왜 이렇게 복잡한가?**

1. **타입 안전성**: 잘못된 필드명 사용 시 컴파일 오류
2. **자동 완성**: IDE에서 사용 가능한 메서드 자동 제안
3. **SQL 최적화**: 데이터베이스별로 최적화된 쿼리 생성
4. **에러 처리**: 데이터베이스 오류를 JavaScript 예외로 변환

#### 2. `index.d.ts` - TypeScript 타입 정의

```typescript
export interface PrismaClient {
  reviews: ReviewsDelegate;
}

export interface ReviewsDelegate {
  findMany(args?: FindManyArgs): Promise<Review[]>;
  create(args: CreateArgs): Promise<Review>;
  upsert(args: UpsertArgs): Promise<Review>;
}

export interface Review {
  id: string;
  title: string;
  author: string;
  price: number;
  publisher: string;
  published: string;
  image: string;
  read: Date;
  memo: string;
}
```

#### 3. `edge.js` - Edge Runtime용 클라이언트

- Vercel Edge Functions에서 사용
- 더 가벼운 버전

#### 4. `client.js` - 클라이언트 사이드용

- 브라우저에서 사용할 수 있는 클라이언트

#### 5. `default.js` - 기본 내보내기

- 기본 설정으로 PrismaClient 내보내기

---

## 연결 주소 설정

### `POSTGRES_PRISMA_URL` - 연결 풀링

#### 연결 풀링이란?

```
애플리케이션 ←→ 연결 풀 ←→ 데이터베이스
```

**장점:**

- 여러 요청을 효율적으로 처리
- 연결 생성/해제 비용 절약
- 동시 접속자 수 제한

#### URL 예시

```env
POSTGRES_PRISMA_URL="postgresql://사용자명:비밀번호@호스트:포트/데이터베이스명?connect_timeout=15&sslmode=require"
```

**URL 구성 요소:**

- `postgresql://`: 프로토콜
- `사용자명:비밀번호`: 인증 정보
- `@호스트:포트`: 서버 주소
- `/데이터베이스명`: 데이터베이스 이름
- `?옵션`: 연결 옵션

#### 언제 사용하는가?

- 일반적인 데이터베이스 작업
- CRUD 작업 (Create, Read, Update, Delete)
- 리뷰 저장, 조회 등

---

## 직접 연결 주소 설정

### `POSTGRES_URL_NON_POOLING` - 직접 연결

#### 직접 연결이란?

```
애플리케이션 ←→ 데이터베이스 (직접 연결)
```

**특징:**

- 연결 풀을 거치지 않음
- 일대일 연결
- 더 안정적

#### URL 예시

```env
POSTGRES_URL_NON_POOLING="postgresql://사용자명:비밀번호@호스트:포트/데이터베이스명?sslmode=require"
```

**차이점:**

- `connect_timeout=15` 없음 (풀링 옵션 제거)
- 더 간단한 URL

#### 언제 사용하는가?

- **마이그레이션** 실행 시
- **스키마 변경** 작업
- **관리자 작업**

---

## 전체 설정 흐름

### 1. `schema.prisma` 파일 작성

```prisma
// 1. Prisma 클라이언트 생성 설정
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

// 2. 데이터베이스 연결 설정
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

// 3. 데이터베이스 테이블 설계
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

### 2. 환경변수 설정

```env
# .env.local 파일
POSTGRES_PRISMA_URL="postgresql://사용자명:비밀번호@호스트:포트/데이터베이스명?connect_timeout=15&sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://사용자명:비밀번호@호스트:포트/데이터베이스명?sslmode=require"
```

### 3. Prisma 클라이언트 생성

```bash
npx prisma generate
```

**동작 과정:**

```
1. schema.prisma 읽기
   ↓
2. generator client 설정 확인
   ↓
3. JavaScript 코드 생성
   ↓
4. src/generated/prisma/ 폴더에 저장
```

### 4. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name init
```

**동작 과정:**

```
1. schema.prisma 읽기
   ↓
2. SQL 쿼리 생성
   ↓
3. migrations/ 폴더에 SQL 파일 저장
   ↓
4. PostgreSQL에 실제 테이블 생성
```

### 5. Prisma 클라이언트 설정

```javascript
// src/lib/prisma.js
import { PrismaClient } from "@/generated/prisma";

const prisma = global.prisma ?? new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
```

---

## 실제 사용 예시

### 일반 작업 (연결 풀링 사용)

```javascript
// src/lib/actions.js
import prisma from "./prisma";

export async function addReview(data) {
  const input = {
    id: data.get("id"),
    title: book.title,
    author: book.author,
    price: Number(book.price),
    publisher: book.publisher,
    published: book.published,
    image: book.image,
    read: new Date(data.get("read")),
    memo: data.get("memo"),
  };

  // POSTGRES_PRISMA_URL 사용 (연결 풀링)
  await prisma.reviews.upsert({
    update: input,
    create: input,
    where: { id: data.get("id") },
  });
}
```

### 마이그레이션 작업 (직접 연결 사용)

```bash
# npx prisma migrate dev 실행 시
# POSTGRES_URL_NON_POOLING 사용 (직접 연결)
npx prisma migrate dev --name init
```

### 데이터 조회

```javascript
// src/lib/getter.js
export async function getAllReviews() {
  return await prisma.reviews.findMany({
    orderBy: {
      read: "desc",
    },
  });
}

export async function getReviewById(id) {
  return await prisma.reviews.findUnique({
    where: {
      id: id,
    },
  });
}
```

---

## 설정 순서 요약

```
1. schema.prisma 작성 (generator, datasource, model 정의)
   ↓
2. .env.local 작성 (데이터베이스 연결 정보)
   ↓
3. npx prisma generate (JavaScript 코드 생성)
   ↓
4. npx prisma migrate dev (데이터베이스에 테이블 생성)
   ↓
5. src/lib/prisma.js 작성 (Prisma 클라이언트 설정)
   ↓
6. 코드에서 사용 (prisma.reviews.findMany() 등)
```

---

## 파일들의 역할

### 필수 파일

- **`schema.prisma`**: 전체 Prisma 설정 (generator + datasource + model)
- **`.env.local`**: 데이터베이스 연결 정보
- **`migrations/`**: 데이터베이스 스키마 변경 이력

### 자동 생성 파일

- **`src/generated/prisma/`**: Prisma가 생성한 JavaScript 코드
- **`migrations/*/migration.sql`**: Prisma가 생성한 SQL 쿼리

### 설정 파일

- **`src/lib/prisma.js`**: Prisma 클라이언트 관리

---

## 주의사항

1. **ID 필드**: `id` 필드에 `@default(cuid())`가 없어서 **수동으로 ID 지정**해야 함
2. **필수 필드**: 모든 필드가 **필수**이므로 null 값 허용 안됨
3. **자동 생성 파일**: `src/generated/prisma/` 폴더의 파일들은 **수정하면 안됨**
4. **환경변수**: `.env.local` 파일은 **Git에 포함되지 않음** (보안)

---

## 결론

Prisma는 데이터베이스와 JavaScript를 연결하는 강력한 도구입니다.

- **설계**: `schema.prisma`로 데이터베이스 구조 정의
- **생성**: `npx prisma generate`로 JavaScript 코드 생성
- **마이그레이션**: `npx prisma migrate dev`로 데이터베이스에 테이블 생성
- **사용**: 생성된 클라이언트로 데이터베이스 조작

이 과정을 통해 SQL을 몰라도 안전하고 효율적으로 데이터베이스를 사용할 수 있습니다.
