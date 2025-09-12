import Image from "next/image";

export default function BookDetail({ index, book }) {
  return (
    <div className="flex w-full mb-4">
      <div>
        <Image src={book.image} alt="" width={140} height={180} />
      </div>
      <div>
        <ul className="list-none text-black ml-4">
          <li>{index && index + "."}</li>
          <li>
            {book.title}({book.price}원)
          </li>
          <li>{book.author} 지음</li>
          <li>{book.publisher} 출판</li>
          <li>{book.published} 출시</li>
        </ul>
      </div>
    </div>
  );
}
