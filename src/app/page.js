import { getAllReviews } from "@/lib/getter";
import LinkedBookDetail from "@/components/LinkedBookDetail";

export const dynamic = "force-dynamic";
export default async function Home() {
  const reviews = await getAllReviews();
  console.log("reviews", reviews);
  return (
    <div>
      {reviews.map((review, index) => (
        <LinkedBookDetail key={review.id} index={index} book={review} />
      ))}
    </div>
  );
}
