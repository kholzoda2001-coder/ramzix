import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import { T } from "@/components/Lang";

export default function NotFound() {
  return (
    <>
      <main className="nf">
        <span className="nf-ic"><Icon name="box" size={34} stroke={1.5} /></span>
        <b><T>Саҳифа ёфт нашуд</T></b>
        <span><T>Шояд маҳсулот дигар дастрас нест.</T></span>
        <Link href="/" className="btn btn-orange"><T>Ба саҳифаи асосӣ</T></Link>
      </main>
      <BottomNav />
    </>
  );
}
