import LinkedBookDetail from "@/components/LinkedBookDetail";
import { getBooksKeyword } from "@/lib/getter";

export default async function BookResult({ params }) {
  const keyword = params.keyword ? params.keyword.join(" ") : "리액트";
  const books = await getBooksKeyword(keyword);

  return (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">검색 결과: "{keyword}"</h2>
        <p className="text-gray-600">총 {books.length}권의 책을 찾았습니다.</p>
      </div>
      {books.map((b, i) => (
        <LinkedBookDetail key={b.id} index={i + 1} book={b} />
      ))}
    </>
  );
}
