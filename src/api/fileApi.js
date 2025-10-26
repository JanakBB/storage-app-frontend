import { axiosWithCreds } from "./axiosInstances";

export const deleteFile = async (id) => {
  const { data } = await axiosWithCreds.delete(`/file/${id}`);
  return data;
};

export const renameFile = async (id, newFilename) => {
  const { data } = await axiosWithCreds.patch(`/file/${id}`, {
    newFilename,
  });
  return data;
};

export const uploadInitiated = async (fileData) => {
  const { data } = await axiosWithCreds.post(
    "/file/upload/initiated",
    fileData
  );
  return data;
};

export const uploadComplete = async (fileId) => {
  const { data } = await axiosWithCreds.post("/file/upload/complete", {
    fileId,
  });
  return data;
};
