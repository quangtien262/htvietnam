WHMCS

I. PHÂN TÍCH NGHIỆP VỤ
1. Quản lý Sản phẩm/Dịch vụ
Nhóm sản phẩm:
* Website Design: Template có sẵn, custom design, redesign.
* Hosting: Shared, VPS, Cloud, Dedicated Server.
* Domain: Đăng ký mới, transfer, renewal.
* SSL Certificate: DV, OV, EV, Wildcard.
* Email Hosting: Business email, spam filter.
* Backup & Security: Daily backup, firewall, malware scan.
Thuộc tính cấu hình (Configurable Options):
* Hosting: RAM (2GB/4GB/8GB), Disk (SSD 20GB/50GB/100GB), Bandwidth.
* Website: Số trang, responsive, SEO, maintenance months.
* SSL: Số subdomain, validation level.
Chu kỳ thanh toán:
* Monthly, Quarterly, Semi-Annually, Annually, Biennially.
* Setup fee (một lần) + recurring fee.

2. Provisioning & Automation
Server Module (tự động tạo/quản lý hosting):
* Tích hợp cPanel/Plesk/DirectAdmin API.
* Actions: Create account, Suspend, Unsuspend, Terminate, Change package, Change password.
* SSO từ client area vào cPanel.
Domain Registrar Module:
* Tích hợp API nhà cung cấp (GoDaddy, Namecheap, PA Việt Nam, Mat Bao).
* Actions: Register, Transfer, Renew, Update nameservers, WHOIS privacy, Domain lock.
SSL Module:
* Tích hợp Comodo/DigiCert/Let's Encrypt.
* Auto-install SSL vào hosting account.
* CSR generation, validation email.
Website Deployment:
* Clone template từ repo Git.
* Setup database, config domain/subdomain.
* Deploy via CI/CD (GitHub Actions/GitLab CI).
* Health check sau deploy.

3. Lifecycle Quản lý Dịch vụ
Trạng thái:
















* 
* 
* 
* 
Quy trình:
* Pending: Đơn hàng mới, chờ thanh toán/kích hoạt thủ công.
* Active: Provisioning thành công, dịch vụ hoạt động.
* Suspended: Quá hạn thanh toán > X ngày, tạm khóa.
* Terminated: Quá hạn > Y ngày hoặc hủy bỏ, xóa dữ liệu.
* Cancelled: Khách hàng yêu cầu hủy (giữ data đến hết kỳ).
Automation:
* Invoice tự động tạo trước X ngày hết hạn.
* Email reminder (7 ngày, 3 ngày, 1 ngày, overdue).
* Auto suspend sau N ngày quá hạn.
* Auto terminate sau M ngày suspended.

4. Billing Engine
Hóa đơn:
* Tạo từ order, recurring renewal, upgrade/downgrade.
* Items: Sản phẩm, addon, domain, setup fee, pro-rata.
* Thuế: VAT 10% (VN), tax exempt cho doanh nghiệp.
* Credit balance: Khách nạp trước, auto apply vào invoice.
Thanh toán:
* Gateway: VNPay, MoMo, ZaloPay, Stripe, PayPal, Bank Transfer.
* Auto-capture cho recurring (tokenization).
* Partial payment (trả góp).
* Refund workflow.
Pro-rata:
* Upgrade giữa kỳ: tính tiền chênh lệch số ngày còn lại.
* Sync renewal date (option).

5. Domain Management
Chức năng:
* Bulk search domain (check availability).
* Pricing tiers: Register, Transfer, Renew khác giá.
* Auto-renew toggle.
* WHOIS contact management.
* Nameserver update (custom/default).
* Domain lock/unlock.
* EPP code cho transfer out.
* Expiry sync qua cron (gọi API registrar).
Lifecycle riêng:
* Active → Expiring (30 ngày) → Expired → Grace Period → Redemption → Released.

6. SSL Certificate
Quy trình:
* Chọn loại SSL → nhập CSR hoặc auto-generate → validation (email/DNS/HTTP) → issue → auto-install vào hosting.
* Renewal reminder trước hết hạn.
* Revoke/reissue nếu cần.

7. Website Builder Integration
Flow:
* Client chọn template từ gallery.
* Chọn domain (mới hoặc existing).
* Chọn gói hosting (nếu chưa có).
* Provisioning:
    * Tạo hosting account.
    * Clone template code.
    * Setup DB, config .env.
    * Deploy, run migration/seed.
    * Point domain.
* Client login vào admin panel riêng (nếu dùng CMS).

8. Addon Services
* Backup: Daily/weekly, retention policy.
* CDN: Cloudflare integration.
* Email: Business email accounts.
* SEO: On-page audit, keyword tracking.
* Maintenance: Monthly updates, security patch.
Mỗi addon có giá riêng, có thể mua kèm hoặc sau.

9. Upgrade/Downgrade
Quy trình:
* Client request từ portal.
* Tính pro-rata (nếu upgrade), hoặc credit (downgrade).
* Tạo invoice bổ sung.
* Sau thanh toán, gọi API server module change package.
* Ghi log, email thông báo.

10. Support Desk
Ticket System:
* Department: Sales, Technical, Billing.
* Priority: Low, Medium, High, Critical.
* Status: Open, Awaiting Reply, In Progress, Resolved, Closed.
* Attachment, internal notes.
* SLA tracking (response time).
* Email piping (reply qua email → update ticket).
Knowledge Base:
* Category: Hosting, Domain, SSL, Website.
* Search, tag, view count.
* Public/private articles.

11. Client Portal
Chức năng:
* Dashboard: dịch vụ active, invoice unpaid, tickets open.
* Quản lý services: view details, renew, upgrade, cancel request.
* Domain management: nameservers, WHOIS, auto-renew.
* Invoices: view, download PDF, pay.
* Tickets: create, reply, view history.
* Profile: update info, change password, 2FA.
* Payment methods: lưu card token (Stripe).

12. Admin Panel
Quản lý:
* Orders: approve pending, cancel.
* Services: manual provision/suspend/terminate, edit config.
* Invoices: create manual, apply credit, refund.
* Clients: view activity, login as client (debug).
* Domains: sync status, manual renew.
* Products: pricing, module assignment, stock (nếu VPS limited).
* Tickets: assign, reply, merge, close.
* Reports: revenue, MRR, churn, overdue aging.
* Settings: currency, tax, email templates, cron log.

13. Automation Cron
Daily Job (php artisan whmcs:daily):
* Tạo invoice cho renewal (X ngày trước hết hạn).
* Gửi email reminder.
* Auto-capture payment (recurring).
* Suspend services quá hạn.
* Terminate services quá hạn lâu.
* Domain sync (expiry date, status).
* Affiliate commission calculate.

14. Discount & Promotion
Coupon:
* Code, % hoặc fixed amount.
* Áp dụng cho: sản phẩm cụ thể, toàn bộ order, recurring hay one-time.
* Số lần sử dụng tối đa, hết hạn.
* Minimum order value.
Affiliate:
* Tracking link với ref code.
* Commission: % doanh thu, fixed per sale, recurring.
* Payout: pending → approved → paid.
* Dashboard cho affiliate: clicks, conversions, balance.

15. Email & Notification
Template:
* Order confirmation, invoice created, payment received.
* Service welcome (login info).
* Renewal reminder (7d, 3d, 1d).
* Overdue notice.
* Suspension warning, termination notice.
* Domain expiry reminder.
* Ticket update.
Merge fields: {client_name}, {service_domain}, {invoice_total}, {due_date}.

16. Multi-currency & Tax
* Hỗ trợ VND, USD.
* Tỷ giá auto-update (API hoặc manual).
* Tax rule theo quốc gia/tỉnh.
* VAT validation (business code).
* Inclusive/exclusive pricing.

17. Reports & Analytics
* Revenue: Daily, monthly, yearly; theo sản phẩm.
* MRR (Monthly Recurring Revenue).
* Churn rate: Services terminated vs active.
* Overdue aging: 0-30, 30-60, 60-90, 90+ days.
* Product performance: bán chạy nhất.
* Affiliate performance.
* Gateway success rate.

18. Security & Compliance
* 2FA cho admin và client.
* API key per client (nếu cung cấp API).
* Rate limit đăng nhập.
* IP whitelist cho admin.
* Fraud check (MaxMind) cho order mới.
* Audit log: admin actions, client login, config changes.
* GDPR: export data, delete account request.

19. Hooks & Events
Hook Points:
* PreOrderCreate, AfterOrderAccept
* PreInvoiceGenerate, AfterInvoiceCreated
* AfterPaymentCaptured
* PreModuleCreate, AfterModuleCreate
* BeforeServiceSuspend, AfterServiceTerminate
* TicketOpen, TicketReply
Use case: Gửi webhook sang hệ thống CRM, ghi log custom, tích hợp chat (Zalo, Telegram).

20. API cho Third-party
Endpoints:
* POST /api/clients - Tạo khách hàng.
* POST /api/orders - Đặt hàng tự động.
* GET /api/services/{id} - Thông tin dịch vụ.
* POST /api/invoices/{id}/pay - Thanh toán.
* POST /api/tickets - Mở ticket.
* Auth: API key + signature hoặc OAuth2.


III. ROADMAP TRIỂN KHAI
Phase 1: Core Billing (2 tuần)
*  Model: Client, Product, Service, Invoice, Transaction.
*  BillingService: createInvoice, applyCredit, markPaid.
*  Gateway adapter: VNPay, Bank Transfer.
*  Admin CRUD invoices.
*  Client view invoices, pay.
Phase 2: Provisioning (2 tuần)
*  ProvisioningService: module registry.
*  cPanel module (create/suspend/terminate).
*  Service lifecycle automation.
*  Hook system (Event/Listener).
Phase 3: Domain & SSL (1.5 tuần)
*  DomainService + registrar module (PA VN hoặc Namecheap).
*  SSLService + provider (Let's Encrypt/Comodo).
*  Domain sync cron.
Phase 4: Website Builder Integration (1.5 tuần)
*  Template selection flow.
*  Deploy pipeline (Git clone + DB setup).
*  Health check + rollback.
Phase 5: Support Desk (1 tuần)
*  Ticket CRUD, department, priority.
*  Email piping (optional).
*  Knowledge base.
Phase 6: Automation & Cron (1 tuần)
*  WhmcsDailyCron: invoice gen, reminder, suspend/terminate.
*  Affiliate commission calc.
Phase 7: Client Portal React SPA (1.5 tuần)
*  Dashboard, My Services, Billing, Tickets.
*  Route config theo resources/common/route.tsx.
Phase 8: Reports & Admin Tools (1 tuần)
*  Revenue, MRR, overdue aging.
*  Export CSV/PDF.


V. TÓM TẮT CHECKLIST
Backend (Laravel):
*  Models: Client, Product, Service, Invoice, Domain, SSL, Ticket, Order, Transaction.
*  Services: Billing, Provisioning, Domain, SSL, Cron, Gateway adapters.
*  Controllers: Admin (Order, Service, Invoice, Ticket), Client (Dashboard, Service, Billing, Ticket), API.
*  Middleware: RBAC, rate limit, fraud check.
*  Events/Listeners: InvoiceCreated, PaymentReceived, ServiceProvisioned.
*  Commands: whmcs:daily-cron, whmcs:sync-domains.
*  Routes: routes/whmcs_admin.php, routes/whmcs_client.php, routes/whmcs_api.php.
Frontend (React SPA):
*  Admin: Orders, Services, Invoices, Tickets, Reports.
*  Client Portal: Dashboard, My Services, Billing, Tickets, Profile.
*  Route config theo resources/common/route.tsx.
*  State management: React Query cho API calls.
*  Form validation: React Hook Form + Zod.
Database:
*  Migration cho tất cả bảng.
*  Seeder: demo products, pricing, gateways.
Testing:
*  Feature test: order flow, invoice payment, provisioning.
*  Unit test: BillingService, ProvisioningService.
Docs:
*  API documentation (Swagger/Postman).
*  Admin guide: cách setup product, module config.
*  Client guide: đặt hàng, thanh toán, quản lý dịch vụ.
