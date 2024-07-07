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
      const url = "https://api.cortex.cerebrium.ai/v4/p-04c3d2f4/image-prot/predict";

      //@ts-ignore
      const payload = JSON.stringify({ prompt: `${reader?.result?.split("base64,")[1]}` });

      const headers = {
        Authorization:
          "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJwLTA0YzNkMmY0IiwiaWF0IjoxNzIwMjU1NTM4LCJleHAiOjIwMzU4MzE1Mzh9.A0uXE5QLD7T1mZhkbW7hnand4_mb2dTJnXnU8RI0AQBPJ31TxMiqLZk5zp4lG8lvn8LIvw9zEEoGHRZRNw1UjdPq33yhANNW_0OIf0aOBW4QhAwpMg0oCLLk0fz73bNTmKF0N5ilFpwGsUB9svrWpftFrejq_F4hUXkRAfqhD8G_TXqQFTqZiroH_OZFEN2mQTVvgvKmSDn8c1js9pUvNcfAG9f2X3flX3rnnG6QF9urOukbZx9E6brQKrYezVPgalFJNNRJsB29q15dW_Igv5zCj3Lka2716Jhs5P8hFPu3nOAHuyEADyS-dNRki8oNNrnKf5JehE0dHEXjpl9A0A",
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      axios
        .post(url, payload, { headers: headers })
        .then((response: any) => {
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
        .catch((error: any) => {
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
          .then((response: any) => {
            console.log(response);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "file.mp3"); // or any other extension
            document.body.appendChild(link);
            link.click();
            setLoading(false);
          })
          .catch((error: any) => {
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
