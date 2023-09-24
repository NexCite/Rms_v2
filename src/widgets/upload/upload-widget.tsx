"use client";
import { Prisma } from "@prisma/client";
import { Button } from "@rms/components/ui/button";
import {
  deleteMedia,
  removeMedia,
  uploadMedia,
} from "@rms/service/media-service";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { FileUploader } from "react-drag-drop-files";
import PDFUploader from "@rms/components/ui/pdf-uploader";
import Image from "next/image";

type Props = {
  path?: string;
  onSave?: (e?: string) => void;
  isPdf?: boolean;
};

export default function UploadWidget(props: Props) {
  const [images, setImages] = useState<ImageListType>([]);
  const [path, setPath] = useState<string>();
  const [isPadding, setTransition] = useTransition();
  const maxNumber = 1;

  const onChange = (imageList: ImageListType, addUpdateIndex: any) => {
    setImages(imageList);
    if (imageList.length > 0) {
      const formData = new FormData();
      formData.append("file", imageList[0].file as any);

      setTransition(async () => {
        var result = await uploadMedia(formData);
        if (props.onSave) {
          setPath(result.result);
          props.onSave(result.result);
        }
      });
    }
  };
  return (
    <div className="flex justify-center mt-8">
      <div className="w-full rounded-lg  bg-gray-50">
        <div className="bg-white">
          {props.isPdf ? (
            <>
              {path ? (
                <div>
                  <Button
                    disabled={isPadding}
                    onClick={() => {
                      setPath(undefined);

                      setTransition(async () => {
                        if (path) {
                          await removeMedia(path);
                          if (props.onSave) {
                            props.onSave();
                          }
                        }
                      });
                    }}
                    type="button"
                    size={"sm"}
                  >
                    {isPadding && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Remove
                  </Button>
                  <iframe
                    className="w-full h-[500px] bg-white mt-5"
                    src={`/api/media/${path}`}
                  ></iframe>
                </div>
              ) : (
                <PDFUploader
                  onUpload={(e) => {
                    setTransition(async () => {
                      const formData = new FormData();
                      formData.append("file", e);
                      setTransition(async () => {
                        await uploadMedia(formData).then((res) => {
                          setPath(res.result);
                          props.onSave(res.result);
                        });
                      });
                    });
                  }}
                />
              )}
            </>
          ) : (
            <ImageUploading
              acceptType={["pdf", "jpg", "jpeg", "svg", "png"]}
              value={images}
              onChange={onChange as any}
              maxNumber={maxNumber}
              dataURLKey="data_url"
            >
              {({ onImageRemove, imageList, errors, onImageUpload }) =>
                imageList.length > 0 ? (
                  <div>
                    <Button
                      disabled={isPadding}
                      onClick={() => {
                        onImageRemove(0);

                        setTransition(async () => {
                          if (path) {
                            await removeMedia(path);
                            if (props.onSave) {
                              props.onSave();
                            }
                          }
                        });
                      }}
                      type="button"
                      size={"sm"}
                    >
                      {isPadding && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Remove
                    </Button>
                    <Image
                      alt={imageList[0].file?.name}
                      className="mt-3"
                      src={URL.createObjectURL(imageList[0].file as any)}
                    ></Image>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col w-full h-32 border-2 border-gray-300 border-dashed hover:bg-gray-100 hover:border-gray-300">
                      <div className="flex flex-col items-center justify-center pt-7">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                          Attach a file
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onImageUpload}
                        className="opacity-0"
                      />
                    </label>
                  </div>
                )
              }
            </ImageUploading>
          )}
        </div>
        <div className="flex justify-center p-2"></div>
      </div>
    </div>
  );
}
