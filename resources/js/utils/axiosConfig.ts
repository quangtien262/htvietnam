// resources/js/utils/axiosConfig.ts
import axios from "axios";

const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
}

// Gửi cookies cùng với request để authenticate
axios.defaults.withCredentials = true;

export default axios;
