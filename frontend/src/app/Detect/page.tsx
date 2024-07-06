"use client";
import React from "react";
import { useState } from "react";
import styles from "./page.module.css";
import axios from "axios";
//@ts-ignore
import { Dropzone, FileInputButton, FileMosaic } from "@files-ui/react";
//@ts-ignore
import Loading from "@/components/loading";
export default function Page() {
  const [files, setFiles] = useState<any>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const updateFiles = (incommingFiles: any) => {
    setFiles(incommingFiles);
  };

  const uploadFiles = () => {
    const formData = new FormData();
    const file = files[0]?.file;
    if (file) {
      const fileType = file.type;
      setLoading(true);
      if (fileType.startsWith("image/")) {
        formData.append("file", file);
        axios
          .post("https://7t6qwzmb-5000.inc1.devtunnels.ms/detect", formData)
          .then((res) => {
            console.log(res.data);
            setResult(res.data);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      } else {
        formData.append("file", file);
        axios
          .post("https://7t6qwzmb-5000.inc1.devtunnels.ms/detect", formData)
          .then((res) => {
            console.log(res.data);
            setResult(res.data);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    } else {
      console.error("No file selected.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <div className={styles.title}>AI Generated Detection</div>
        <div className={styles.small}>Drop or paste your image or audio below to check for deepfake</div>
      </div>

      <div className={styles.dropContainer}>
        <Dropzone maxFiles={1} className={styles.drop} onChange={updateFiles} value={files}>
          {files.map((file: any) => (
            <FileMosaic {...file} preview />
          ))}
        </Dropzone>
        <div className={styles.buttons}>
          <FileInputButton maxFiles={1} className={styles.uploadButton} onChange={updateFiles} value={files} />
          {result ? (
            <div className={styles.result}>
              <div className={styles.resultTitle}>Result</div>
              <div style={{ color: "white", fontWeight: "600", fontSize: "12px" }} className={styles.resultText}>
                {result}
              </div>
            </div>
          ) : null}
          {files.length == 1 ? (
            <button onClick={() => uploadFiles()} className={styles.sub}>
              {loading ? <Loading /> : "Detect"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}