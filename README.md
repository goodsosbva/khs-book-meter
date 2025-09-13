# 📚 Reading Recorder

> Next.js + Prisma + Neon + Vercel로 구축한 책 기록 관리 애플리케이션

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https://khs-book-meter.vercel.app/books-green)](https://khs-book-meter.vercel.app/books)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.15.0-2D3748)](https://prisma.io/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00D4AA)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000)](https://vercel.com/)

## 🎯 프로젝트 개요

Reading Recorder는 책을 검색하고 읽은 책을 기록할 수 있는 웹 애플리케이션입니다. Next.js 15의 최신 기능과 Prisma ORM, Neon 데이터베이스를 활용하여 구축되었습니다.

### ✨ 주요 기능

- 🔍 **책 검색**: 키워드로 책 검색 (예: "리액트" 검색 시 20권의 책 표시)
- 📖 **책 정보 표시**: 제목, 저자, 가격, 출판사, 출시일 등 상세 정보
- ✏️ **읽은 책 기록**: 읽은 날짜와 소감 기록
- 🗑️ **기록 관리**: 읽은 책 수정 및 삭제 기능

### 🛠️ 기술 스택

- **Frontend**: Next.js 15.5.2, React 19.1.0, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Neon PostgreSQL
- **ORM**: Prisma 6.15.0
- **Deployment**: Vercel
- **Package Manager**: npm

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/goodsosbva/khs-book-meter.git
cd khs-book-meter
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
POSTGRES_PRISMA_URL="your_postgres_prisma_url"
POSTGRES_URL_NON_POOLING="your_postgres_url_non_pooling"
```

### 4. 데이터베이스 설정

```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev --name init

# Prisma 클라이언트 생성
npx prisma generate
```

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조

```
khs-book-meter/
├── prisma/
│   ├── schema.prisma          # 데이터베이스 스키마
│   └── migrations/            # 마이그레이션 파일들
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── books/            # 책 검색 페이지
│   │   ├── edit/             # 책 수정 페이지
│   │   └── page.js           # 홈페이지
│   ├── components/           # React 컴포넌트들
│   ├── lib/                  # 유틸리티 함수들
│   │   ├── prisma.js         # Prisma 클라이언트
│   │   ├── actions.js        # Server Actions
│   │   └── getter.js         # 데이터 가져오기 함수
│   └── generated/            # Prisma 생성 파일들
├── .env.local               # 환경변수 (로컬)
├── package.json
└── README.md
```

## 🗄️ 데이터베이스 스키마

```prisma
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

## 🚀 배포

### Vercel 배포

1. Vercel 계정에 GitHub 저장소 연결
2. 환경변수 설정:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
3. 자동 배포 완료

### 환경변수 설정

Vercel 대시보드에서 다음 환경변수들을 설정하세요:

- `POSTGRES_PRISMA_URL`: Neon 데이터베이스 연결 URL (Prisma용)
- `POSTGRES_URL_NON_POOLING`: Neon 데이터베이스 연결 URL (직접 연결용)

## 📚 상세 가이드

### 🔧 개발 가이드

전체 개발 과정과 문제 해결 방법은 다음 문서를 참고하세요:

- **[완전 개발 가이드](./COMPLETE_DEVELOPMENT_GUIDE.md)** - 처음부터 끝까지의 전체 개발 과정
- **[배포 가이드](./DEPLOYMENT_GUIDE.md)** - 배포 과정 및 문제 해결
- **[Prisma 설정 가이드](./PRISMA_SETUP_GUIDE.md)** - Prisma 설정 및 동작 원리 상세 설명

### 🐛 문제 해결

자주 발생하는 문제들과 해결 방법:

1. **Prisma import 오류**

   ```javascript
   // ❌ 잘못된 경로
   import { PrismaClient } from "../generated/prisma";

   // ✅ 올바른 경로
   import { PrismaClient } from "@/generated/prisma";
   ```

2. **React unescaped entities 오류**

   ```javascript
   // ❌ 잘못된 방법
   <h2>검색 결과: "{keyword}"</h2>

   // ✅ 올바른 방법
   <h2>검색 결과: &quot;{keyword}&quot;</h2>
   ```

3. **Vercel 배포 오류**
   ```json
   // package.json에 prisma generate 추가
   {
     "scripts": {
       "build": "prisma generate && next build --turbopack"
     }
   }
   ```

## 🎓 학습 포인트

이 프로젝트를 통해 다음을 학습할 수 있습니다:

- **Next.js 15**: App Router, Server Components, Server Actions
- **Prisma**: ORM 설정, 마이그레이션, 쿼리 작성
- **Neon**: PostgreSQL 클라우드 데이터베이스 사용
- **Vercel**: 배포, 환경변수 설정, 자동 배포
- **문제 해결**: ESLint 오류, 빌드 오류, 배포 오류 해결

## 🔗 관련 링크

- [Live Demo](https://khs-book-meter.vercel.app/books)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [Neon 데이터베이스](https://neon.tech/)
- [Vercel 배포 가이드](https://vercel.com/docs)

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

---

**개발자**: 권현성
**기술 스택**: Next.js + Prisma + Neon + Vercel  
**배포 상태**: ✅ 정상 작동 중
