import BookDetail from "@/components/BookDetail";
import FormEdit from "@/components/FormEdit";
import { getBookById, getReviewById } from "@/lib/getter";

export default async function EditPage({ params }) {
  const book = await getBookById(params.id);
  const review = await getReviewById(params.id);

  const read = (review?.read || new Date()).toLocaleDateString("sv-SE");

  return (
    <div id="form">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">책 상세 정보</h2>
        <BookDetail book={book} />
      </div>

      <FormEdit src={{ id: book.id, read, memo: review?.memo }} />
    </div>
  );
}
