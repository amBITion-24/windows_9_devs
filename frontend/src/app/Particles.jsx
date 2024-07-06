"use client";
import React, { useEffect, useRef } from "react";

const Particles = () => {
  const canvasElementRef = useRef(null);
  const canvasContainerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasElementRef.current;
    const canvasContainer = canvasContainerRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;

    class Particle {
      constructor(x, y) {
        this.x = canvas.width + Math.random() * canvas.width; // Start from the right
        this.y = Math.random() * canvas.height;
        this.baseX = x;
        this.baseY = y;
        this.density = Math.random() * 30 + 1;
        this.size = 3;
        this.color =
          Math.random() > 0.5 ? "rgb(148,0,211)" : "rgb(147,112,219, 1)";
        this.startConvergence = false;
        setTimeout(() => (this.startConvergence = true), 1000);
        this.moveToRight = false;
        setTimeout(() => (this.moveToRight = true), 2000);
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        let canvasRect = canvas.getBoundingClientRect();
        let mouseDisturbed = false;

        if (
          mouseX > canvasRect.left &&
          mouseX < canvasRect.right &&
          mouseY > canvasRect.top &&
          mouseY < canvasRect.bottom
        ) {
          //  if mouse is inside canvas
          let dx = mouseX - canvasRect.left - this.x;
          let dy = mouseY - canvasRect.top - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let maxDistance = 70;
          let force = (maxDistance - distance) / maxDistance;
          let directionX = forceDirectionX * force * this.density * 2.5;
          let directionY = forceDirectionY * force * this.density * 2.5;

          if (distance < maxDistance) {
            this.x -= directionX;
            this.y -= directionY;
            mouseDisturbed = true;
          }
        }
        if (!mouseDisturbed && this.startConvergence) {
          if (this.x !== this.baseX) {
            let dxBase = this.x - this.baseX;
            this.x -= dxBase / 45;
          }
          if (this.y !== this.baseY) {
            let dyBase = this.y - this.baseY;
            this.y -= dyBase / 45;
          }
        }

        const randomX = (Math.random() - 0.5) * 0.3;
        const randomY = (Math.random() - 0.5) * 0.3;
        this.x += randomX;
        this.y += randomY;
      }
    }

    function init(img) {
      particles = [];
      const imgCanvas = document.createElement("canvas");
      const imgCtx = imgCanvas.getContext("2d");
      imgCanvas.width = canvas.width;
      imgCanvas.height = canvas.height;
      const scale = 1.5;
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = imgCanvas.width - scaledWidth; // Align to the right
      const offsetY = (imgCanvas.height - scaledHeight) / 2;
      imgCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      const imageData = imgCtx.getImageData(
        0,
        0,
        imgCanvas.width,
        imgCanvas.height
      );
      const data = imageData.data;

      const stepSize = 5;
      const skipProbability = 0.2;

      for (let y = 0; y < canvas.height; y += stepSize) {
        for (let x = offsetX; x < canvas.width; x += stepSize) { // Start from the offsetX
          if (Math.random() > skipProbability) {
            if (data[y * 4 * canvas.width + x * 4 + 3] > 128) {
              let positionX = x;
              let positionY = y;
              particles.push(new Particle(positionX, positionY));
            }
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      requestAnimationFrame(animate);
    }

    function loadImage(url) {
      const img = new Image();
      img.crossOrigin = "";
      img.src = url;
      img.onload = () => {
        init(img);
        animate();
      };
    }

    window.addEventListener("resize", function () {
      canvas.width = canvasContainer.clientWidth;
      canvas.height = canvasContainer.clientHeight;
    });

    window.addEventListener("mousemove", function (event) {
      mouseX = event.x;
      mouseY = event.y;
    });

    loadImage(
    "https://cdn.discordapp.com/attachments/1254005320485703780/1259242983610515590/particlelogo.png?ex=668af8ea&is=6689a76a&hm=5a42a8192ecb5795607443d2fce69178c4d1109ef41334f3796ae6a3ace1ee50&"
    );
  }, []);

  return (
    <div ref={canvasContainerRef} className="h-[100vh] w-1/2">
      <canvas ref={canvasElementRef}></canvas>
    </div>
  );
};

export default Particles;
