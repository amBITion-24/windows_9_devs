'use client'
import React from "react";
import { useState } from "react";
import Particles from "./Particles";
import Link from "next/link";
import styles from "./globals.module.css";

export default function Home() {

  const [answer, setAnswer] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imgs = [
    { src: '/images/image1.jpg', alt: 'Game Image1', answer: 'Real' },
    { src: '/images/image2.jpg', alt: 'Game Image2', answer: 'Fake' },
    { src: '/images/image3.jpg', alt: 'Game Image3', answer: 'Fake' },
    { src: '/images/image4.jpg', alt: 'Game Image4', answer: 'Real' },
    { src: '/images/image6.png', alt: 'Game Image6', answer: 'Real' },
    { src: '/images/image7.png', alt: 'Game Image7', answer: 'Fake' },
    { src: '/images/image12.jpg', alt: 'Game Image12', answer: 'Fake' },
    { src: '/images/image14.png', alt: 'Game Image14', answer: 'Fake' },
    { src: '/images/image19.png', alt: 'Game Image19', answer: 'Real' },


  ]

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imgs.length);
    setAnswer('');
  };

  const handleSelect = (selectedAnswer:string) => {
    setAnswer(selectedAnswer);
    if (selectedAnswer === imgs[currentImageIndex].answer) {
      alert('Correct!');
    } else {
      alert('Incorrect!');
    }
  }


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
      <section className="">
        <div className="flex flex-col justify-center items-center h-96 bg-black">
          <h5 className="p-4 font-bold text-5xl text-white">Real or Fake?</h5>
          <div className="p-4 w-1/2 h-full bg-slate-800 border-2 border-slate-600 rounded-lg flex justify-center items-center">
            <img src={imgs[currentImageIndex].src} className="w-32 h-32" alt={imgs[currentImageIndex].alt} />
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-700"
              onClick={() => handleSelect('Real')}
            >
              Real
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-700"
              onClick={() => handleSelect('Fake')}
            >
              Fake
            </button>
          </div>
          <div className="mt-4">
            <p id="answerPrompt" className="text-xl text-white">{answer && `You selected: ${answer}`}</p>
          </div>
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-700"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
