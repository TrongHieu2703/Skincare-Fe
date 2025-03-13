// blogService.js
import axiosClient from "./axiosClient";

const API_URL = '/Blog'; // Vì axiosClient đã có baseURL

export const getBlogs = async () => {
    try {
        const res = await axiosClient.get(API_URL);
        return res.data?.data || [];
    } catch (error) {
        console.error('Lỗi khi lấy blog:', error);
        return [];
    }
};

export const getBlogById = async (id) => {
    try {
        const res = await axiosClient.get(`${API_URL}/${id}`);
        return res.data?.data;
    } catch (error) {
        console.error(`Lỗi khi lấy blog id=${id}:`, error);
        return null;
    }
};

export const createBlog = async (blog) => {
    try {
        const res = await axiosClient.post(API_URL, blog);
        return res.data;
    } catch (error) {
        console.error('Lỗi khi tạo blog:', error);
        return null;
    }
};

export const updateBlog = async (id, blog) => {
    try {
        const res = await axiosClient.put(`${API_URL}/${id}`, blog);
        return res.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật blog:', error);
        return null;
    }
};

export const deleteBlog = async (id) => {
    try {
        const res = await axiosClient.delete(`${API_URL}/${id}`);
        return res.data;
    } catch (error) {
        console.error('Lỗi khi xoá blog:', error);
        return null;
    }
};
