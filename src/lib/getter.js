import prisma from "./prisma";

// API를 통해 얻은 도서 정보에서 필요한 정보만을 객체로 재구성
export function createBook(book) {
  // 안전장치 추가
  if (!book || !book.volumeInfo) {
    return {
      id: book?.id || "unknown",
      title: "정보 없음",
      author: "정보 없음",
      price: 0,
      publisher: "정보 없음",
      published: "정보 없음",
      image: "/vercel.svg",
    };
  }

  const authors = book.volumeInfo.authors;
  const price = book.saleInfo?.listPrice;
  const img = book.volumeInfo.imageLinks;

  return {
    id: book.id || "unknown",
    title: book.volumeInfo.title || "제목 없음",
    author: authors ? authors.join(",") : "저자 정보 없음",
    price: price ? price.amount : 0,
    publisher: book.volumeInfo.publisher || "출판사 정보 없음",
    published: book.volumeInfo.publishedDate || "출판일 정보 없음",
    image: img ? img.smallThumbnail : "/vercel.svg",
  };
}

// 인수 keyword를 키워드로 Google Books API에서 책 검색하기
export async function getBooksByKeyword(keyword) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${keyword}&langRestrict=ko&maxResults=20&printType=books`
  );
  const result = await res.json();
  const books = [];
  // 응답 내용을 객체 배열로 리필
  for (const b of result.items) {
    books.push(createBook(b));
  }
  return books;
}

// id값을 키로 하여 도서 정보를 가져옴
export async function getBookById(id) {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
  const result = await res.json();
  return createBook(result);
}

// id값을 키로 리뷰 정보 가져오기
export async function getReviewById(id) {
  return await prisma.reviews.findUnique({
    where: {
      id: id,
    },
  });
}

export async function getAllReviews() {
  // 읽은 날짜(read) 내림차순으로 검색
  return await prisma.reviews.findMany({
    orderBy: {
      read: "desc",
    },
  });
}

// 키워드로 책 검색 (getBooksByKeyword의 별칭)
export async function getBooksKeyword(keyword) {
  return await getBooksByKeyword(keyword);
}
