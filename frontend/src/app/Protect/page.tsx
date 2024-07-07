"use client";
import React from "react";
import { useState } from "react";
import styles from "./page.module.css";
//@ts-ignore
import axios from "axios";
//@ts-ignore
import { Dropzone, FileInputButton, FileMosaic } from "@files-ui/react";
//@ts-ignore
import Loading from "@/components/loading";
export default function Page() {
  
  const convertToBase64 = (selectedFile: any) => {
    const reader = new FileReader();

    reader.readAsDataURL(selectedFile);

    reader.onload = () => {
      console.log("called: ", reader);
      const url = "https://api.cortex.cerebrium.ai/v4/p-574cb281/image-protection/predict";

      //@ts-ignore
      const payload = JSON.stringify({ prompt: `${reader?.result?.split("base64,")[1]}` });

      const headers = {
        Authorization:
          "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJwLTU3NGNiMjgxIiwiaWF0IjoxNzE5MjIzOTMxLCJleHAiOjIwMzQ3OTk5MzF9.hzbpNocushgQE7n0w__0FlpLqTpIG2Lv8Iz_rd7R8Sk03KOAKWzTWaaJZXgPFP3lIQWwkSfK-8QC6_dlVXEFx1D5MK-R58B05KzfhF5q3JjC1AoDw-Bds474VtBjXQO_ntbUUUtLEocKoYgdLvH13GP4G82InGNLHsvIYDqvpyq-eyyf7-XeU0dlcwB4DumKADrWQh9D0ZfZbXDLg6GdbcesmRSctvqvVNJxwD_R-94NHVj02G-98PbAiw1EiMUgzxk5iPLy9-JEGboDS7xkE8_yOSO9wXNbvseZjuYgGktrTQBnw4Dn29fRiyc0-ThGkRrJ0-uyw-W3r-jExGc-UQ",
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      axios
        .post(url, payload, { headers: headers })
        .then((response) => {
          console.log(response.data);
          console.log(response.data?.result);
          var image = new Image();
          image.src = "data:image/png;base64," + response.data?.result;
          const link = document.createElement("a");
          link.href = image.src;
          link.setAttribute("download", "protected_image.png");
          document.body.appendChild(link);
          link.click();
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
        });
    };
  };

  const [files, setFiles] = useState<any>([]);
  const [base64Image, setBase64IMG] = useState<any>(null);
  const updateFiles = (incommingFiles: any) => {
    setFiles(incommingFiles);
  };
  const [loading, setLoading] = useState(false);

  const uploadFiles = async () => {
    const formData = new FormData();
    const file = files[0]?.file;
    console.log(`${base64Image?.split("base64,")[1]}`);
    if (file) {
      setLoading(true);
      const fileType = file.type;
      if (fileType.startsWith("image/")) {
        await convertToBase64(file);
      } else {
        formData.append("file", file);
        console.log("audio");
        axios({
          url: "https://7t6qwzmb-5000.inc1.devtunnels.ms/protect_audio", // replace with your Flask server URL and endpoint
          method: "POST", // replace with the correct HTTP method if not GET
          responseType: "blob", // important
          data: formData,
        })
          .then((response) => {
            console.log(response);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "file.mp3"); // or any other extension
            document.body.appendChild(link);
            link.click();
            setLoading(false);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } else {
      console.error("No file selected.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <div className={styles.title}>AI Protection</div>
        <div className={styles.small}>Drop or paste your image or audio below to protect from deepfake</div>
      </div>

      <div className={styles.dropContainer}>
        <Dropzone maxFiles={1} className={styles.drop} onChange={updateFiles} value={files}>
          {files.map((file: any, idx: any) => (
            <FileMosaic key={idx} {...file} preview />
          ))}
        </Dropzone>
        <div className={styles.buttons}>
          <FileInputButton maxFiles={1} className={styles.uploadButton} onChange={updateFiles} value={files} />
          {files.length == 1 ? (
            <button onClick={() => uploadFiles()} className={styles.sub}>
              {loading ? <Loading /> : "Protect"}
            </button>
          ) : null}
        </div>
      </div>
    </div>

  );
}