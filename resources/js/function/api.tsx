import axios from 'axios';

const API = axios.create({
    baseURL: '',
});

// task
export const getTasks = () => API.get('/adm/tasks');
export const createTask = (data: any) => API.post(route('task.add'), data);
export const updateTask = (id: number, data: any) => API.put(route('task.updateSortOrder', id), data);
export const deleteTask = (id: number) => API.delete(route('task.delete', id));

//
export const callApi = (url:string) => API.post(url);