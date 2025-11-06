
const BASE_API_URL = "/user/api/";
export const API_USER = {
    AitilenDashboard: `${BASE_API_URL}aitilen/dashboard`,

    contractIndex: `${BASE_API_URL}aitilen/contract`,
    invoiceIndex: `${BASE_API_URL}aitilen/invoice`,

    supportIndex: `${BASE_API_URL}aitilen/support`,
    createSupportTask: `${BASE_API_URL}aitilen/support/create`,
    getTaskInfo: `${BASE_API_URL}aitilen/task/info`,
    editTaskComment: `${BASE_API_URL}aitilen/task/edit-comment`,

    profileIndex: `${BASE_API_URL}aitilen/profile`,
    updateUserProfile: `${BASE_API_URL}aitilen/profile/update`,
    changePassword: `${BASE_API_URL}profile/change-password`,

    // invoice aitilen
    aitilen_invoiceIndexApi: `${BASE_API_URL}aitilen/invoice/index-api`,
    aitilen_searchInvoice: `${BASE_API_URL}aitilen/invoice/search`,


};

export default API_USER;
