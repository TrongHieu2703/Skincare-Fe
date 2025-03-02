import axiosClient from "./axiosClient";

export const getAccountInfo = async () => {
  try {
    const response = await axiosClient.get("/Account");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
