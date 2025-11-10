# 📱 WHMCS Phase 3 - Frontend Pages Implementation Guide

## ✅ Shared Components Created (4/4)

Located in: `resources/js/components/whmcs/`

1. **StatCard.tsx** - Card hiển thị metrics với trend
2. **ChartCard.tsx** - Card wrapper cho charts  
3. **FilterBar.tsx** - Filter toolbar với date range, status
4. **ExportButton.tsx** - Export button với dropdown formats

---

## 📋 All 32 Pages Structure

### Module 1: Webhooks (6 pages)

#### ✅ 1.1. WebhookList.tsx (DONE)
**Location:** `resources/js/pages/whmcs/webhooks/WebhookList.tsx`  
**Route:** `/aio/whmcs/webhooks`  
**Features:** List, Toggle active, Test, View logs, Delete

#### 1.2. WebhookCreate.tsx
**Location:** `resources/js/pages/whmcs/webhooks/WebhookCreate.tsx`  
**Route:** `/aio/whmcs/webhooks/create`  
**Code Template:**
```typescript
import React, { useState } from 'react';
import { Form, Input, Checkbox, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ROUTE } from '@/common/route';

const AVAILABLE_EVENTS = [
    { label: 'Invoice Created', value: 'invoice_created' },
    { label: 'Invoice Paid', value: 'invoice_paid' },
    { label: 'Invoice Cancelled', value: 'invoice_cancelled' },
    { label: 'Service Created', value: 'service_created' },
    { label: 'Service Provisioned', value: 'service_provisioned' },
    { label: 'Service Suspended', value: 'service_suspended' },
    { label: 'Service Terminated', value: 'service_terminated' },
    { label: 'Client Created', value: 'client_created' },
    { label: 'Ticket Created', value: 'ticket_created' },
    { label: 'Ticket Replied', value: 'ticket_replied' },
];

const WebhookCreate: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            await axios.post('/aio/api/whmcs/webhooks', values);
            message.success('Tạo webhook thành công!');
            navigate(ROUTE.whmcsWebhooks);
        } catch (error) {
            message.error('Tạo webhook thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Card title="Tạo Webhook Mới">
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="Tên Webhook"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên webhook' }]}
                    >
                        <Input placeholder="VD: Invoice Payment Notification" />
                    </Form.Item>

                    <Form.Item
                        label="URL"
                        name="url"
                        rules={[
                            { required: true, message: 'Vui lòng nhập URL' },
                            { type: 'url', message: 'URL không hợp lệ' }
                        ]}
                    >
                        <Input placeholder="https://your-domain.com/webhook" />
                    </Form.Item>

                    <Form.Item
                        label="Events"
                        name="events"
                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 event' }]}
                    >
                        <Checkbox.Group options={AVAILABLE_EVENTS} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Tạo Webhook
                        </Button>
                        <Button style={{ marginLeft: 8 }} onClick={() => navigate(ROUTE.whmcsWebhooks)}>
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default WebhookCreate;
```

#### 1.3. WebhookEdit.tsx
Similar to WebhookCreate but with edit mode

#### 1.4. WebhookLogs.tsx
Table view of webhook logs with JSON viewer

#### 1.5. WebhookDetail.tsx
Detail view with stats and recent logs

#### 1.6. WebhookSettings.tsx  
Global webhook configuration

---

### Module 2: Analytics (5 pages)

#### 2.1. AnalyticsDashboard.tsx
**Route:** `/aio/whmcs/analytics`
**Components:**
- StatCard grid (4 metrics: Revenue, MRR, ARR, Clients)
- Line chart (Revenue trend)
- Export button

**Code Outline:**
```typescript
import StatCard from '@/components/whmcs/StatCard';
import ChartCard from '@/components/whmcs/ChartCard';
import { Line } from '@ant-design/plots';

// Fetch data from /aio/api/whmcs/analytics/overview
// Display metrics in StatCards
// Display charts in ChartCards
```

#### 2.2. RevenueReport.tsx
Revenue breakdown by period with filters

#### 2.3. ClientAnalytics.tsx
Client metrics and top clients table

#### 2.4. ProductPerformance.tsx
Product sales charts and table

#### 2.5. ChurnAnalysis.tsx
Churn rate analysis

---

### Module 3: Currency (4 pages)

#### 3.1. CurrencyList.tsx
**Route:** `/aio/whmcs/currencies`
**Features:** 
- Table with currencies
- Set default (Radio)
- Enable/Disable (Switch)
- Update rates button

#### 3.2. CurrencyCreate.tsx
Form to add new currency

#### 3.3. CurrencyEdit.tsx
Form to edit currency

#### 3.4. CurrencyConverter.tsx
**Route:** `/aio/whmcs/currencies/converter`
Currency conversion tool

---

### Module 4: Tax (5 pages)

#### 4.1. TaxDashboard.tsx
Tax overview with stats

#### 4.2. TaxRuleList.tsx
Table of tax rules

#### 4.3. TaxRuleCreate.tsx
Form to create tax rule

#### 4.4. TaxExemptions.tsx
Tax exemption management

#### 4.5. TaxReport.tsx
Tax collection report

---

### Module 5: Affiliate (6 pages)

#### 5.1. AffiliateList.tsx
List of affiliates with approve/reject

#### 5.2. AffiliateDetail.tsx
Affiliate detail with tabs (Commissions, Payouts, Referrals)

#### 5.3. AffiliateCreate.tsx
Create affiliate form

#### 5.4. CommissionList.tsx
Commissions table

#### 5.5. PayoutList.tsx
Payouts management

#### 5.6. AffiliatePerformance.tsx
Performance dashboard

---

### Module 6: Knowledge Base (6 pages)

#### 6.1. KBDashboard.tsx
KB overview stats

#### 6.2. KBCategoryList.tsx
Tree view of categories

#### 6.3. KBCategoryForm.tsx
Create/Edit category

#### 6.4. KBArticleList.tsx
Articles table with search

#### 6.5. KBArticleEditor.tsx
**Important:** Uses SunEditor (already installed)
Rich text article editor

#### 6.6. KBArticleView.tsx
Article preview

---

## 🎨 Common Patterns

### API Call Pattern
```typescript
import axios from 'axios';

const fetchData = async () => {
    try {
        const response = await axios.get('/aio/api/whmcs/MODULE/ENDPOINT');
        setData(response.data.data);
    } catch (error) {
        message.error('Không thể tải dữ liệu');
    }
};
```

### Form Pattern
```typescript
const [form] = Form.useForm();
const [loading, setLoading] = useState(false);

const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
        await axios.post('/aio/api/...', values);
        message.success('Thành công!');
        navigate(ROUTE.backTo);
    } catch (error) {
        message.error('Thất bại!');
    } finally {
        setLoading(false);
    }
};
```

### Table Pattern
```typescript
const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Actions', key: 'actions', render: (_, record) => (
        <Space>
            <Button onClick={() => handleEdit(record.id)}>Edit</Button>
            <Popconfirm title="Delete?" onConfirm={() => handleDelete(record.id)}>
                <Button danger>Delete</Button>
            </Popconfirm>
        </Space>
    )}
];

<Table columns={columns} dataSource={data} rowKey="id" />
```

---

## 📦 File Organization

```
resources/js/
├── components/
│   └── whmcs/
│       ├── StatCard.tsx       ✅
│       ├── ChartCard.tsx      ✅
│       ├── FilterBar.tsx      ✅
│       └── ExportButton.tsx   ✅
├── pages/
│   └── whmcs/
│       ├── webhooks/
│       │   ├── WebhookList.tsx        ✅
│       │   ├── WebhookCreate.tsx      ⏳
│       │   ├── WebhookEdit.tsx        ⏳
│       │   ├── WebhookLogs.tsx        ⏳
│       │   ├── WebhookDetail.tsx      ⏳
│       │   └── WebhookSettings.tsx    ⏳
│       ├── analytics/
│       │   ├── AnalyticsDashboard.tsx ⏳
│       │   ├── RevenueReport.tsx      ⏳
│       │   ├── ClientAnalytics.tsx    ⏳
│       │   ├── ProductPerformance.tsx ⏳
│       │   └── ChurnAnalysis.tsx      ⏳
│       ├── currencies/
│       │   ├── CurrencyList.tsx       ⏳
│       │   ├── CurrencyCreate.tsx     ⏳
│       │   ├── CurrencyEdit.tsx       ⏳
│       │   └── CurrencyConverter.tsx  ⏳
│       ├── tax/
│       │   ├── TaxDashboard.tsx       ⏳
│       │   ├── TaxRuleList.tsx        ⏳
│       │   ├── TaxRuleCreate.tsx      ⏳
│       │   ├── TaxExemptions.tsx      ⏳
│       │   └── TaxReport.tsx          ⏳
│       ├── affiliates/
│       │   ├── AffiliateList.tsx      ⏳
│       │   ├── AffiliateDetail.tsx    ⏳
│       │   ├── AffiliateCreate.tsx    ⏳
│       │   ├── CommissionList.tsx     ⏳
│       │   ├── PayoutList.tsx         ⏳
│       │   └── AffiliatePerformance.tsx ⏳
│       └── kb/
│           ├── KBDashboard.tsx        ⏳
│           ├── KBCategoryList.tsx     ⏳
│           ├── KBCategoryForm.tsx     ⏳
│           ├── KBArticleList.tsx      ⏳
│           ├── KBArticleEditor.tsx    ⏳
│           └── KBArticleView.tsx      ⏳
```

**Progress:** 5/37 files (13.5%)

---

## 🚀 Implementation Strategy

### Option A: Manual Creation (Current)
Create each file one by one with full code

**Time:** ~40-50 hours  
**Quality:** High, customized

### Option B: Template Generator
Create a script to generate all pages from templates

**Time:** ~10 hours setup + customization  
**Quality:** Medium, needs refinement

### Option C: Incremental
Create priority pages first (Analytics, Webhooks), others as needed

**Time:** ~15-20 hours  
**Quality:** High for important pages

---

## 💡 Recommendation

Vì có 32 pages và mỗi page cần 1-2 giờ để code đầy đủ, em đề xuất:

**Hybrid Approach:**
1. ✅ **Done:** Shared components (4 files)
2. **Next:** Create full code for TOP 10 priority pages:
   - AnalyticsDashboard
   - WebhookCreate/Edit/Logs
   - CurrencyList
   - TaxRuleList
   - AffiliateList
   - KBArticleEditor

3. **Then:** Create skeleton/template for remaining 22 pages

Anh muốn em làm theo cách nào ạ?
- A: Tạo từng file đầy đủ (50 giờ)
- B: Tạo script generator (10 giờ)
- C: Tạo 10 pages priority + 22 skeletons (15 giờ)

