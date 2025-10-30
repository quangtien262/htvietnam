// resources/js/utils/axiosConfig.ts
import axios from "axios";

const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
}

export default axios;
