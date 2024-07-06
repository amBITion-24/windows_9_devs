import Particles from "./Particles";
import Link from "next/link";
import styles from "./globals.module.css";

export default function Home() {
  return (
    <>
      <section>
        <nav className="fixed top-0 w-full z-10 bg-transparent p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/">
              <img src="/images/Logo.png" className="h-12"></img>
            </Link>
            <div className="flex space-x-12">
              <Link
                href="#"
                className="text-slate-400 text-xl font-semibold hover:bg-gradient-to-r from-[#055ad9] to-[#F907FC] bg-clip-text hover:text-transparent transition-all duration-500 transform hover:scale-110"
              >
                Home
              </Link>
              <Link
                href="#"
                className="text-slate-400 text-xl font-semibold hover:bg-gradient-to-r from-[#055ad9] to-[#F907FC] bg-clip-text hover:text-transparent transition-all duration-500 transform hover:scale-110"
              >
                About
              </Link>
              <Link
                href="#"
                className="text-slate-400 text-xl font-semibold hover:bg-gradient-to-r from-[#055ad9] to-[#F907FC] bg-clip-text hover:text-transparent transition-all duration-500 transform hover:scale-110"
              >
                Contact
              </Link>
            </div>
          </div>
          <hr className="border-slate-400 mt-2" />
        </nav>

        <div className="flex pt-20">
          <div className="w-1/2 p-8 flex flex-col items-center justify-center">
            <h3 className="font-extrabold ml-10 text-8xl bg-gradient-to-r from-[#055ad9] to-[#F907FC] bg-clip-text text-transparent">
              fence.ai
            </h3>
            <h1 className="text-4xl ml-10 mt-1">Welcome to our website!</h1>
            <p className="text-xl mt-4 ml-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod justo id nunc ultrices, id aliquam nisl tincidunt. Nullam auctor, nunc id aliquet lacinia, nisl nunc tincidunt urna, a tincidunt nunc nunc id nunc.
            </p>
            <div className="flex space-x-4 mt-4">
              <Link href="/Protect" className="ext-btn">Protect</Link>
              <Link href="/Detect" className="ext-btn">Detect</Link>
            </div>
            <div className="flex p-4 items-center justify-center">
              <button className="ext-btn">Download!</button>
            </div>
          </div>

          <Particles />
        </div>
      </section>
      <section></section>
    </>
  );
}
