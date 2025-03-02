// src/api/transactionApi.js
import axiosClient from './axiosClient';

export const getTransactionsByOrderId = async (orderId) => {
  const response = await axiosClient.get(`/transaction/${orderId}`);
  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await axiosClient.post('/transaction', transactionData);
  return response.data;
};

export const updateTransaction = async (id, transactionData) => {
  const response = await axiosClient.put(`/transaction/${id}`, transactionData);
  return response.data;
};

export const deleteTransaction = async (id) => {
  await axiosClient.delete(`/transaction/${id}`);
};
