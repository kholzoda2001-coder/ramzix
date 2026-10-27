import Link from "next/link";

export default function NotFound() {
  return (
    <main className="empty" style={{ marginTop: 80 }}>
      <b>Саҳифа ёфт нашуд</b>
      <span>Шояд маҳсулот дигар дастрас нест.</span>
      <Link href="/" className="btn btn-orange" style={{ marginTop: 12 }}>Ба саҳифаи асосӣ</Link>
    </main>
  );
}
