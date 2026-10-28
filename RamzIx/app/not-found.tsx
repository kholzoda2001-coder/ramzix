import Link from "next/link";
import { T } from "@/components/Lang";

export default function NotFound() {
  return (
    <main className="empty" style={{ marginTop: 80 }}>
      <b><T>Саҳифа ёфт нашуд</T></b>
      <span><T>Шояд маҳсулот дигар дастрас нест.</T></span>
      <Link href="/" className="btn btn-orange" style={{ marginTop: 12 }}><T>Ба саҳифаи асосӣ</T></Link>
    </main>
  );
}
