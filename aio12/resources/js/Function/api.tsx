import axios from 'axios';

const API = axios.create({
    baseURL: '',
});

// task
export const getTasks = () => API.get('/adm/tasks');
export const createTask = (data) => API.post(route('task.add'), data);
export const updateTask = (id, data) => API.put(route('task.updateSortOrder', id), data);
export const deleteTask = (id) => API.delete(route('task.delete', id));

//
export const callApi = (url) => API.post(url);