
const BASE_API_URL = "/spa/";
export const API_SPA = {
    // Shift (Ca làm việc)
    spaShiftCurrent: BASE_API_URL + 'shifts/current',

    // Services (Dịch vụ)
    spaServiceList: BASE_API_URL + 'services',
    spaServiceCategoryList: BASE_API_URL + 'service-categories',

    // Products (Sản phẩm)
    spaProductList: BASE_API_URL + 'products',
    spaProductCategoryList: BASE_API_URL + 'product-categories',

    // Service Packages (Gói dịch vụ)
    spaServicePackageList: BASE_API_URL + 'service-packages',

    // Branches (Chi nhánh)
    spaBranchList: BASE_API_URL + 'branches',

    // Gift Cards (Thẻ giá trị)
    spaGiftCardList: BASE_API_URL + 'gift-cards',

    // Wallet (Ví khách hàng)
    spaWalletGet: (customerId: number) => BASE_API_URL + `wallet/${customerId}`,
    spaWalletWithdraw: BASE_API_URL + 'wallet/withdraw',
    spaWalletDeposit: BASE_API_URL + 'wallet/deposit',
    spaWalletApplyCode: BASE_API_URL + 'wallet/apply-code',

    // Vouchers
    spaVoucherVerify: BASE_API_URL + 'vouchers/verify',
    spaVoucherApply: BASE_API_URL + 'vouchers/apply',

    // Customer Packages (Gói khách hàng đã mua)
    spaCustomerPackageList: BASE_API_URL + 'customer-packages/list',
    spaCustomerPackagePurchase: BASE_API_URL + 'customer-packages/purchase',
    spaCustomerPackageUse: BASE_API_URL + 'customer-packages/use',

    // POS - Invoice (Hóa đơn)
    spaPOSCreateInvoice: BASE_API_URL + 'pos/invoices',

    // User/Customer (from main API - not spa specific)
    userSelect: '/aio/api/user/select-data',
    userAdd: '/aio/api/customer/add',
    userGet: (userId: number) => `/aio/api/user/${userId}`,

    // Analytics (Thống kê & Báo cáo)
    spaAnalyticsDashboard: BASE_API_URL + 'analytics/dashboard',
    spaAnalyticsExport: BASE_API_URL + 'analytics/export',

    // Customers
    spaCustomerList: '/aio/api/spa/customers',
    spaCustomerCreateOrUpdate: BASE_API_URL + 'customers/create-or-update',

    // Services
    spaServicesList: BASE_API_URL + 'services/list',

    // Bookings (Lịch hẹn)
    spaBookingShow: (bookingId: string | number) => BASE_API_URL + `bookings/${bookingId}/show`,
    spaBookingCreateOrUpdate: BASE_API_URL + 'bookings/create-or-update',
    spaBookingAvailableSlots: BASE_API_URL + 'bookings/available-slots',
    spaBookingAvailableStaff: BASE_API_URL + 'bookings/available-staff',

    // Rooms (Phòng)
    spaRoomList: BASE_API_URL + 'rooms/list',

    // Staff (Nhân viên)
    spaStaffList: BASE_API_URL + 'staff/list',
    spaStaffCreateOrUpdate: BASE_API_URL + 'staff/create-or-update',
    spaStaffDelete: BASE_API_URL + 'staff/delete',

    // Staff Schedules (Lịch làm việc nhân viên)
    spaStaffScheduleList: BASE_API_URL + 'staff-schedules/list',
    spaStaffScheduleCreateOrUpdate: BASE_API_URL + 'staff-schedules/create-or-update',
    spaStaffScheduleDelete: BASE_API_URL + 'staff-schedules/delete',

    // Vouchers (Mã giảm giá)
    spaVoucherList: BASE_API_URL + 'vouchers/list',
    spaVoucherCreateOrUpdate: BASE_API_URL + 'vouchers/create-or-update',
    spaVoucherDelete: BASE_API_URL + 'vouchers/delete',

    // Marketing Campaigns (Chiến dịch Marketing)
    spaCampaignList: BASE_API_URL + 'campaigns/list',
    spaCampaignCreateOrUpdate: BASE_API_URL + 'campaigns/create-or-update',
    spaCampaignDelete: BASE_API_URL + 'campaigns/delete',
    spaCampaignSend: BASE_API_URL + 'campaigns/send',
    spaCampaignCountTarget: BASE_API_URL + 'campaigns/count-target',

    // Commissions (Hoa hồng)
    spaCommissionList: BASE_API_URL + 'commissions/list',
    spaCommissionUpdateStatus: BASE_API_URL + 'commissions/update-status',
    spaCommissionExport: BASE_API_URL + 'commissions/export',

    // Customer Profile (Hồ sơ khách hàng)
    spaCustomerProfile: (customerId: string | number) => BASE_API_URL + `customers/${customerId}/profile`,
    spaCustomerHealthProfile: (customerId: string | number) => BASE_API_URL + `customers/${customerId}/health-profile`,
    spaCustomerSkinProfile: (customerId: string | number) => BASE_API_URL + `customers/${customerId}/skin-profile`,
    spaCustomerUploadPhoto: BASE_API_URL + 'customers/upload-photo',
    spaCustomersListPost: BASE_API_URL + 'customers/list',

    // Loyalty Program (Chương trình khách hàng thân thiết)
    spaLoyaltyRuleList: BASE_API_URL + 'loyalty-rules/list',
    spaLoyaltyRuleCreateOrUpdate: BASE_API_URL + 'loyalty-rules/create-or-update',
    spaLoyaltyRuleDelete: BASE_API_URL + 'loyalty-rules/delete',
    spaLoyaltyTransactionList: BASE_API_URL + 'loyalty-transactions/list',
    spaLoyaltyRewardList: BASE_API_URL + 'loyalty-rewards/list',
    spaLoyaltyRewardCreateOrUpdate: BASE_API_URL + 'loyalty-rewards/create-or-update',
    spaLoyaltyRewardDelete: BASE_API_URL + 'loyalty-rewards/delete',

    // Reports (Báo cáo)
    spaReportRevenue: BASE_API_URL + 'reports/revenue',
    spaReportTransactions: BASE_API_URL + 'reports/transactions',
    spaReportStaff: BASE_API_URL + 'reports/staff',
    spaReportInventory: BASE_API_URL + 'reports/inventory',
    spaReportExport: BASE_API_URL + 'reports/export',

    // Shift Management (Quản lý ca làm việc)
    spaShiftList: BASE_API_URL + 'ca-lam-viec',
    spaShiftCurrentGet: BASE_API_URL + 'ca-lam-viec/current',
    spaShiftOpen: BASE_API_URL + 'ca-lam-viec/open',
    spaShiftClose: (shiftId: string | number) => BASE_API_URL + `ca-lam-viec/${shiftId}/close`,
    spaShiftPrint: (shiftId: string | number) => BASE_API_URL + `ca-lam-viec/${shiftId}/print`,

    // Inventory (Kiểm kho)
    spaInventoryCountApprove: (countId: string | number) => BASE_API_URL + `kiem-kho/${countId}/approve`,

    // Common Upload
    spaUploadImage: BASE_API_URL + 'upload-image',

    // Schedules (Lịch trình)
    spaSchedules: BASE_API_URL + 'schedules',
};

export default API_SPA;
