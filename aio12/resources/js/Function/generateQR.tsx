import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    InputNumber,
    Space,
    message,
    Divider,
    Row,
    Col,
    Button,
    Card,
    Typography,
    Tooltip,
    Spin
} from 'antd';
import {
    QrcodeOutlined,
    CopyOutlined,
    DownloadOutlined,
    BankOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';

const { Text, Title } = Typography;

// Helper function để format số tiền
export function numberFormat(num: number): string {
    return new Intl.NumberFormat('vi-VN').format(num);
}

// Helper function để download QR as image
const downloadQRCode = (bankName: string) => {
    const svg = document.querySelector('#qr-code-svg') as SVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 300;
    canvas.height = 300;

    img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_${bankName}_${Date.now()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
};

// Component QR Banking chính
export function HTBankingQR(props: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
    amount?: number;
    description?: string;
    template?: string;
}) {
    const [qrData, setQrData] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Danh sách ngân hàng VN với mã BIN
    const bankList = {
        'VCB': { name: 'Vietcombank', bin: '970436' },
        'TCB': { name: 'Techcombank', bin: '970407' },
        'MB': { name: 'MBBank', bin: '970422' },
        'VTB': { name: 'VietinBank', bin: '970415' },
        'BIDV': { name: 'BIDV', bin: '970418' },
        'ACB': { name: 'ACB', bin: '970416' },
        'TPB': { name: 'TPBank', bin: '970423' },
        'STB': { name: 'Sacombank', bin: '970403' },
        'SHB': { name: 'SHB', bin: '970443' },
        'EIB': { name: 'Eximbank', bin: '970431' },
        'MSB': { name: 'MSB', bin: '970426' },
        'CAKE': { name: 'CAKE by VPBank', bin: '970432' },
        'UBANK': { name: 'UBank', bin: '546034' },
        'TIMO': { name: 'Timo', bin: '963388' }
    };

    // Helper function to remove Vietnamese accents
    const removeVietnameseAccents = (str: string): string => {
        const accentsMap = {
            'à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ': 'a',
            'è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ': 'e',
            'ì|í|ị|ỉ|ĩ': 'i',
            'ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ': 'o',
            'ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ': 'u',
            'ỳ|ý|ỵ|ỷ|ỹ': 'y',
            'đ': 'd',
            'À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ': 'A',
            'È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ': 'E',
            'Ì|Í|Ị|Ỉ|Ĩ': 'I',
            'Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ': 'O',
            'Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ': 'U',
            'Ỳ|Ý|Ỵ|Ỷ|Ỹ': 'Y',
            'Đ': 'D'
        };

        let result = str;
        for (const [accents, replacement] of Object.entries(accentsMap)) {
            result = result.replace(new RegExp(accents, 'g'), replacement);
        }

        // Remove other special characters, keep only alphanumeric and spaces
        result = result.replace(/[^a-zA-Z0-9\s]/g, '');
        return result;
    };

    // CRC16-CCITT calculation theo chuẩn ISO/IEC 13239
    const calculateCRC16CCITT = (data: string): number => {
        let crc = 0xFFFF;
        const polynomial = 0x1021;

        for (let i = 0; i < data.length; i++) {
            crc = crc ^ (data.charCodeAt(i) << 8);

            for (let j = 0; j < 8; j++) {
                if ((crc & 0x8000) !== 0) {
                    crc = (crc << 1) ^ polynomial;
                } else {
                    crc = crc << 1;
                }
                crc = crc & 0xFFFF;
            }
        }

        return crc;
    };

    // Generate QR theo chuẩn VietQR - SỬA LẠI HOÀN TOÀN
    const generateQRData = () => {
        const bank = bankList[props.bankCode as keyof typeof bankList];
        if (!bank) return '';

        try {
            let qrString = '';

            // 1. Payload Format Indicator (Tag 00)
            qrString += '000201';

            // 2. Point of Initiation Method (Tag 01) - Static QR = 12 (SỬA: Quay lại 12)
            qrString += '010212';

            // 3. Merchant Account Information - VietQR uses Tag 38
            let merchantAccount = '';
            // GUID for VietQR - NAPAS standard
            merchantAccount += '0010A000000727';
            // Provider ID - SỬA: Dùng QRIBFTTA (8 chars) thay vì QRIBFTTD
            merchantAccount += '0208QRIBFTTA';
            // Acquirer ID (Bank BIN) - SỬA: Dùng tag 02 với length 06
            merchantAccount += '02' + '06' + bank.bin;
            // Beneficiary Account Number - SỬA: Dùng tag 01 thay vì 03
            merchantAccount += '01' + props.accountNumber.length.toString().padStart(2, '0') + props.accountNumber;

            // Add merchant account to main QR string
            qrString += '38' + merchantAccount.length.toString().padStart(2, '0') + merchantAccount;

            // 4. Currency Code (Tag 53) - VND = 704
            qrString += '5303704';

            // 5. Transaction Amount (Tag 54) - Optional
            if (props.amount && props.amount > 0) {
                const amountStr = props.amount.toString();
                qrString += '54' + amountStr.length.toString().padStart(2, '0') + amountStr;
            }

            // 6. Country Code (Tag 58)
            qrString += '5802VN';

            // 7. Merchant Name (Tag 59) - SỬA: Giới hạn 25 chars và format đúng
            if (props.accountName) {
                const nameStr = removeVietnameseAccents(props.accountName.toUpperCase())
                    .replace(/\s+/g, ' ')
                    .trim()
                    .substring(0, 25);
                qrString += '59' + nameStr.length.toString().padStart(2, '0') + nameStr;
            }

            // 8. Merchant City (Tag 60) - SỬA: Dùng "HO CHI MINH" thay vì "Ho Chi Minh"
            const city = 'HO CHI MINH';
            qrString += '60' + city.length.toString().padStart(2, '0') + city;

            // 9. Additional Data Field Template (Tag 62) - Optional
            if (props.description) {
                let additionalData = '';
                // Purpose of Transaction (Sub-tag 08)
                const purpose = removeVietnameseAccents(props.description)
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .trim()
                    .substring(0, 25);
                if (purpose.length > 0) {
                    additionalData += '08' + purpose.length.toString().padStart(2, '0') + purpose;
                    qrString += '62' + additionalData.length.toString().padStart(2, '0') + additionalData;
                }
            }

            // 10. CRC16 (Tag 63) - SỬA: Tính CRC đúng algorithm
            qrString += '6304';
            const crc = calculateCRC16VietQR(qrString);
            const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
            qrString += crcHex;

            console.log('=== VietQR Generation FIXED ===');
            console.log('Bank BIN:', bank.bin);
            console.log('Account:', props.accountNumber);
            console.log('Merchant Account Part:', merchantAccount);
            console.log('Name processed:', removeVietnameseAccents(props.accountName.toUpperCase()).trim().substring(0, 25));
            console.log('CRC Calculated:', crcHex);
            console.log('QR String:', qrString);
            console.log('QR Length:', qrString.length);
            console.log('==================================');

            return qrString;

        } catch (error) {
            console.error('QR Generation Error:', error);
            return '';
        }
    };

    // Generate QR bằng API VietQR chính thức
    const generateQRDataAPI = async () => {
        const bank = bankList[props.bankCode as keyof typeof bankList];
        if (!bank) return '';

        try {
            const apiUrl = `https://api.vietqr.io/v2/generate`;
            const payload = {
                accountNo: props.accountNumber,
                accountName: props.accountName,
                acqId: bank.bin,
                amount: props.amount || 0,
                addInfo: props.description || '',
                format: 'text',
                template: 'compact'
            };

            console.log('=== API Request ===');
            console.log('Payload:', payload);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('=== API Response ===');
                console.log('Full Response:', result);

                if (result.code === '00' && result.data?.qrCode) {
                    console.log('API QR String:', result.data.qrCode);
                    console.log('API QR Length:', result.data.qrCode.length);
                    return result.data.qrCode;
                } else {
                    console.error('API Error:', result.desc || 'Unknown error');
                    return generateQRDataFallback();
                }
            } else {
                console.error('HTTP Error:', response.status, response.statusText);
                return generateQRDataFallback();
            }
        } catch (error) {
            console.error('Network Error:', error);
            return generateQRDataFallback();
        }
    };

    // Fallback: Generate QR bằng service VietQR URL
    const generateQRDataFallback = () => {
        const bank = bankList[props.bankCode as keyof typeof bankList];
        if (!bank) return '';

        try {
            const params = new URLSearchParams({
                bank: bank.bin,
                acc: props.accountNumber,
                name: props.accountName,
                amount: (props.amount || 0).toString(),
                memo: props.description || '',
            });

            const qrUrl = `https://dl.vietqr.io/pay?${params.toString()}`;

            console.log('=== Fallback QR URL ===');
            console.log('QR URL:', qrUrl);
            console.log('========================');

            return qrUrl;

        } catch (error) {
            console.error('Fallback Error:', error);
            return '';
        }
    };

    // Generate QR manual theo chuẩn VietQR (để backup)
    const generateQRDataManual = () => {
        const bank = bankList[props.bankCode as keyof typeof bankList];
        if (!bank) return '';

        try {
            let qrString = '';

            // 1. Payload Format Indicator (Tag 00)
            qrString += '000201';

            // 2. Point of Initiation Method (Tag 01) - Static QR = 12
            qrString += '010212';

            // 3. Merchant Account Information - VietQR uses Tag 38
            let merchantAccount = '';
            merchantAccount += '0010A000000727';
            merchantAccount += '0208QRIBFTTA';
            merchantAccount += '02' + '06' + bank.bin;
            merchantAccount += '01' + props.accountNumber.length.toString().padStart(2, '0') + props.accountNumber;

            qrString += '38' + merchantAccount.length.toString().padStart(2, '0') + merchantAccount;

            // 4. Currency Code (Tag 53) - VND = 704
            qrString += '5303704';

            // 5. Transaction Amount (Tag 54) - Optional
            if (props.amount && props.amount > 0) {
                const amountStr = props.amount.toString();
                qrString += '54' + amountStr.length.toString().padStart(2, '0') + amountStr;
            }

            // 6. Country Code (Tag 58)
            qrString += '5802VN';

            // 7. Merchant Name (Tag 59)
            if (props.accountName) {
                const nameStr = removeVietnameseAccents(props.accountName.toUpperCase())
                    .replace(/\s+/g, ' ')
                    .trim()
                    .substring(0, 25);
                qrString += '59' + nameStr.length.toString().padStart(2, '0') + nameStr;
            }

            // 8. Merchant City (Tag 60)
            const city = 'HO CHI MINH';
            qrString += '60' + city.length.toString().padStart(2, '0') + city;

            // 9. Additional Data Field Template (Tag 62) - Optional
            if (props.description) {
                let additionalData = '';
                const purpose = removeVietnameseAccents(props.description)
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .trim()
                    .substring(0, 25);
                if (purpose.length > 0) {
                    additionalData += '08' + purpose.length.toString().padStart(2, '0') + purpose;
                    qrString += '62' + additionalData.length.toString().padStart(2, '0') + additionalData;
                }
            }

            // 10. CRC16 (Tag 63)
            qrString += '6304';
            const crc = calculateCRC16VietQR(qrString);
            const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
            qrString += crcHex;

            console.log('=== Manual QR Generation ===');
            console.log('QR String:', qrString);
            console.log('QR Length:', qrString.length);
            console.log('=============================');

            return qrString;

        } catch (error) {
            console.error('Manual QR Generation Error:', error);
            return '';
        }
    };

    // CRC16 calculation theo chuẩn VietQR
    const calculateCRC16VietQR = (data: string): number => {
        let crc = 0xFFFF;

        for (let i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i) << 8;

            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc <<= 1;
                }
            }
        }

        return crc & 0xFFFF;
    };

    // Main generate function - ĐỔI TÊN để tránh duplicate
    const generateQRMain = async () => {
        const bank = bankList[props.bankCode as keyof typeof bankList];
        if (!bank) return '';

        console.log('=== Starting QR Generation ===');
        console.log('Bank:', bank.name, '(', bank.bin, ')');
        console.log('Account:', props.accountNumber);
        console.log('Name:', props.accountName);
        console.log('Amount:', props.amount);
        console.log('Description:', props.description);

        // Strategy 1: Thử API trước
        try {
            const apiResult = await Promise.race([
                generateQRDataAPI(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('API timeout')), 3000)
                )
            ]) as string;

            if (apiResult && typeof apiResult === 'string' && apiResult.length > 10 && !apiResult.startsWith('http')) {
                console.log('✅ API Success - Using API QR');
                return apiResult;
            }
        } catch (error: any) {
            console.warn('⚠️ API failed:', error.message);
        }

        // Strategy 2: Fallback to URL method
        console.log('🔄 Using Fallback URL method');
        return generateQRDataFallback();
    };

    // Add caching để giảm API calls
    const generateQRWithCache = async () => {
        const cacheKey = `qr_${props.bankCode}_${props.accountNumber}_${props.amount}_${props.description}`;
        const cached = sessionStorage.getItem(cacheKey);

        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            // Cache 1 hour
            if (Date.now() - timestamp < 3600000) {
                console.log('📦 Using cached QR');
                return data;
            }
        }

        const qrData = await generateQRMain();

        // Cache result
        sessionStorage.setItem(cacheKey, JSON.stringify({
            data: qrData,
            timestamp: Date.now()
        }));

        return qrData;
    };

    // Add monitoring
    const logQRUsage = (method: string) => {
        // Optional: Send analytics về QR method usage
        console.log(`QR Method Used: ${method}`);
        // fetch('/api/analytics/qr-usage', { method: 'POST', ... })
    };

    // Update useEffect để handle async - SỬA TÊN FUNCTION
    useEffect(() => {
        if (props.bankCode && props.accountNumber && props.accountName) {
            setLoading(true);

            const generateAsync = async () => {
                try {
                    const data = await generateQRWithCache(); // ĐỔI TÊN Ở ĐÂY
                    setQrData(data || '');
                } catch (error) {
                    console.error('Generate QR Error:', error);
                    setQrData('');
                } finally {
                    setLoading(false);
                }
            };

            // Delay để UX tốt hơn
            setTimeout(generateAsync, 300);
        }
    }, [props.bankCode, props.accountNumber, props.amount, props.description, props.accountName]);

    const showQR = () => {
        setIsVisible(true);
    };

    const hideQR = () => {
        setIsVisible(false);
    };

    const copyQRData = async () => {
        try {
            await navigator.clipboard.writeText(qrData);
            message.success('Đã copy mã QR vào clipboard!');
        } catch (error) {
            message.error('Không thể copy mã QR!');
        }
    };

    const bankInfo = bankList[props.bankCode as keyof typeof bankList];

    return (
        <Card className="banking-qr-container" size="small">
            <div className="bank-info" style={{ marginBottom: 16 }}>
                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <Text strong><BankOutlined /> Ngân hàng:</Text> {bankInfo?.name || props.bankCode}
                    </Col>
                    <Col span={24}>
                        <Text strong>Số tài khoản:</Text> <Text code>{props.accountNumber}</Text>
                    </Col>
                    <Col span={24}>
                        <Text strong>Chủ tài khoản:</Text> <Text>{props.accountName}</Text>
                    </Col>
                    {props.amount && (
                        <Col span={24}>
                            <Text strong><DollarOutlined /> Số tiền:</Text>
                            <Text style={{ color: '#f5222d', fontWeight: 'bold' }}>
                                {numberFormat(props.amount)} VNĐ
                            </Text>
                        </Col>
                    )}
                    {props.description && (
                        <Col span={24}>
                            <Text strong>Nội dung:</Text> <Text italic>"{props.description}"</Text>
                        </Col>
                    )}
                </Row>
            </div>

            <Space wrap>
                <Button
                    type="primary"
                    icon={<QrcodeOutlined />}
                    onClick={showQR}
                    loading={loading}
                >
                    Tạo mã QR
                </Button>
                <Tooltip title="Tải xuống QR">
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={() => downloadQRCode(bankInfo?.name || props.bankCode)}
                        disabled={!qrData}
                    >
                        Tải xuống
                    </Button>
                </Tooltip>
            </Space>

            <Modal
                title={
                    <div style={{ textAlign: 'center' }}>
                        <QrcodeOutlined style={{ marginRight: 8 }} />
                        Mã QR Chuyển khoản
                    </div>
                }
                open={isVisible}
                onCancel={hideQR}
                footer={[
                    <Button key="copy" icon={<CopyOutlined />} onClick={copyQRData}>
                        Copy mã
                    </Button>,
                    <Button key="download" icon={<DownloadOutlined />} onClick={() => downloadQRCode(bankInfo?.name || props.bankCode)}>
                        Tải xuống
                    </Button>,
                    <Button key="close" type="primary" onClick={hideQR}>
                        Đóng
                    </Button>
                ]}
                centered
                width={400}
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    {loading ? (
                        <Spin size="large" />
                    ) : qrData ? (
                        <>
                            <QRCodeSVG
                                id="qr-code-svg"
                                value={qrData}
                                size={280}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="M"
                                includeMargin={true}
                            />
                            <div style={{ marginTop: 16 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Quét mã QR bằng app ngân hàng để chuyển khoản
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    Compatible với VietQR standard
                                </Text>
                            </div>
                        </>
                    ) : (
                        <Text type="danger">Không thể tạo mã QR</Text>
                    )}
                </div>
            </Modal>
        </Card>
    );
}

// Component form để tạo QR Banking
export function HTBankingQRForm(col: any, langId = 0) {
    const [formData] = Form.useForm();
    const [qrProps, setQrProps] = useState({
        bankCode: '',
        accountNumber: '',
        accountName: '',
        amount: 0,
        description: ''
    });

    const onFormChange = () => {
        const values = formData.getFieldsValue();
        setQrProps({
            bankCode: values.bankCode || '',
            accountNumber: values.accountNumber || '',
            accountName: values.accountName || '',
            amount: values.amount || 0,
            description: values.description || ''
        });
    };

    const bankOptions = [
        { label: '🏛️ Vietcombank', value: 'VCB' },
        { label: '🏛️ Techcombank', value: 'TCB' },
        { label: '🏛️ MBBank', value: 'MB' },
        { label: '🏛️ VietinBank', value: 'VTB' },
        { label: '🏛️ BIDV', value: 'BIDV' },
        { label: '🏛️ ACB', value: 'ACB' },
        { label: '🏛️ TPBank', value: 'TPB' },
        { label: '🏛️ Sacombank', value: 'STB' },
        { label: '🏛️ SHB', value: 'SHB' },
        { label: '🏛️ Eximbank', value: 'EIB' },
        { label: '🏛️ MSB', value: 'MSB' }
    ];

    let name = col.name;
    if (langId > 0) {
        name = 'lang_' + langId + '_' + col.name;
    }

    return (
        <Col key={col.name} xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: col.col || 24 }}>
            <Form.Item label={col.display_name}>
                <Card
                    title={
                        <div>
                            <QrcodeOutlined /> Generator mã QR Banking
                        </div>
                    }
                    size="small"
                >
                    <Form
                        form={formData}
                        layout="vertical"
                        onValuesChange={onFormChange}
                    >
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="bankCode"
                                    label="Ngân hàng"
                                    rules={[{ required: true, message: 'Vui lòng chọn ngân hàng!' }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Chọn ngân hàng"
                                        options={bankOptions}
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="accountNumber"
                                    label="Số tài khoản"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số tài khoản!' },
                                        { pattern: /^\d+$/, message: 'Số tài khoản chỉ chứa số!' }
                                    ]}
                                >
                                    <Input
                                        placeholder="Nhập số tài khoản"
                                        maxLength={20}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item
                                    name="accountName"
                                    label="Tên chủ tài khoản"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản!' }]}
                                >
                                    <Input
                                        placeholder="Nhập tên chủ tài khoản"
                                        maxLength={50}
                                        onChange={(e) => {
                                            const value = e.target.value.toUpperCase();
                                            formData.setFieldValue('accountName', value);
                                            onFormChange();
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item name="amount" label="Số tiền (VNĐ)">
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        placeholder="Nhập số tiền (tùy chọn)"
                                        min={0}
                                        max={999999999}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="description" label="Nội dung chuyển khoản">
                                    <Input placeholder="Nhập nội dung chuyển khoản" maxLength={50} />
                                </Form.Item>
                            </Col>
                        </Row>

                        {qrProps.bankCode && qrProps.accountNumber && qrProps.accountName && (
                            <div style={{ marginTop: 24 }}>
                                <Divider>Mã QR được tạo</Divider>
                                <HTBankingQR {...qrProps} />
                            </div>
                        )}
                    </Form>
                </Card>
            </Form.Item>
        </Col>
    );
}

// Export default cho convenience
export default { HTBankingQR, HTBankingQRForm };



{/* <HTBankingQR
    bankCode="TPB"
    accountNumber="00299941001"
    accountName="LUU QUANG TIEN"
    amount={5000}
    description="2013017"
/> */}
