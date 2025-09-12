// 'use server';

// import { redirect } from 'next/navigation';

// import prisma from './prisma';
// import { getBookById } from './getter';

// // 폼에서 입력한 값을 데이터베이스에 등록
// export async function addReview(data) {
//   const book = await getBookById(data.get('id'));
//   const input = {
//     title: book.title,
//     author: book.author,
//     price: Number(book.price),
//     publisher: book.publisher,
//     published: book.published,
//     image: book.image,
//     read: new Date(data.get('read')),
//     memo: data.get('memo')
//   };

//   // 신규 데이터라면 등록, 기존 데이터라면 업데이트
//   await prisma.reviews.upsert({
//     update: input,
//     create: Object.assign({}, input, { id: data.get('id') }),
//     where: {
//       id: data.get('id')
//     }
//   });
//   // 처리 성공 후 홈페이지로 리디렉션
//   redirect('/');
// }

// // 삭제 버튼으로 지정된 리뷰 정보 삭제
// export async function removeReview(data) {
//   await prisma.reviews.delete({
//     where: {
//       id: data.get('id')
//     }
//   });
//   // 처리 성공 후 홈페이지로 리디렉션
//   redirect('/');
// }

"use server";

import { redirect } from "next/navigation";

import prisma from "./prisma";
import { getBookById } from "./getter";

// 폼에서 입력한 값을 데이터베이스에 등록
export async function addReview(data) {
  const book = await getBookById(data.get("id"));
  const input = {
    title: book.title,
    author: book.author,
    price: Number(book.price),
    publisher: book.publisher,
    published: book.published,
    image: book.image,
    read: new Date(data.get("read")),
    memo: data.get("memo"),
  };

  // 신규 데이터라면 등록, 기존 데이터라면 업데이트
  await prisma.reviews.upsert({
    update: input,
    create: Object.assign({}, input, { id: data.get("id") }),
    where: {
      id: data.get("id"),
    },
  });
  redirect("/");
}

// 삭제 버튼으로 지정된 리뷰 정보 삭제
export async function removeReview(data) {
  await prisma.reviews.delete({
    // 직접 id 값을 받기 때문에 수정
    where: {
      id: data,
    },
  });
  redirect("/");
}
