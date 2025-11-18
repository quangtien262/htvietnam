<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Biên bản bàn giao ca - {{ $ca->ma_ca }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 18px;
            margin: 10px 0;
            text-transform: uppercase;
        }
        .header h2 {
            font-size: 14px;
            margin: 5px 0;
        }
        .info-section {
            margin-bottom: 20px;
        }
        .info-row {
            display: flex;
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: bold;
            width: 180px;
        }
        .info-value {
            flex: 1;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        table th {
            background-color: #f4f4f4;
            font-weight: bold;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .total-row {
            background-color: #f9f9f9;
            font-weight: bold;
        }
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            text-align: center;
            width: 45%;
        }
        .signature-box p {
            margin: 5px 0;
        }
        .signature-space {
            height: 80px;
        }
        .note-section {
            margin-top: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border-left: 4px solid #007bff;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>BIÊN BẢN BÀN GIAO CA LÀM VIỆC</h1>
        <h2>{{ $ca->chiNhanh->ten_chi_nhanh ?? 'Chi nhánh' }}</h2>
        <p>Mã ca: <strong>{{ $ca->ma_ca }}</strong></p>
    </div>

    <div class="info-section">
        <h3>I. THÔNG TIN CA LÀM VIỆC</h3>
        <div class="info-row">
            <div class="info-label">Người mở ca:</div>
            <div class="info-value">{{ $ca->nhanVienMoCa->name ?? 'N/A' }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Thời gian mở ca:</div>
            <div class="info-value">{{ \Carbon\Carbon::parse($ca->thoi_gian_bat_dau)->format('d/m/Y H:i:s') }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Người đóng ca:</div>
            <div class="info-value">{{ $ca->nhanVienDongCa->name ?? 'N/A' }}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Thời gian đóng ca:</div>
            <div class="info-value">{{ $ca->thoi_gian_ket_thuc ? \Carbon\Carbon::parse($ca->thoi_gian_ket_thuc)->format('d/m/Y H:i:s') : 'N/A' }}</div>
        </div>
    </div>

    <div class="info-section">
        <h3>II. TÌNH HÌNH DOANH THU</h3>
        <table>
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Nội dung</th>
                    <th class="text-right">Số tiền (VNĐ)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Số hóa đơn</td>
                    <td class="text-right">{{ $ca->so_hoa_don }}</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Doanh thu tiền mặt</td>
                    <td class="text-right">{{ number_format($ca->doanh_thu_tien_mat, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>Doanh thu chuyển khoản</td>
                    <td class="text-right">{{ number_format($ca->doanh_thu_chuyen_khoan, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td>4</td>
                    <td>Doanh thu thẻ</td>
                    <td class="text-right">{{ number_format($ca->doanh_thu_the, 0, ',', '.') }}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="2" class="text-right">Tổng doanh thu</td>
                    <td class="text-right">{{ number_format($ca->tong_doanh_thu, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="info-section">
        <h3>III. TÌNH HÌNH TIỀN MẶT</h3>
        <table>
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Nội dung</th>
                    <th class="text-right">Số tiền (VNĐ)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Tiền mặt đầu ca</td>
                    <td class="text-right">{{ number_format($ca->tien_mat_dau_ca, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Doanh thu tiền mặt trong ca</td>
                    <td class="text-right">{{ number_format($ca->doanh_thu_tien_mat, 0, ',', '.') }}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="2" class="text-right">Tiền mặt cuối ca (lý thuyết)</td>
                    <td class="text-right">{{ number_format($ca->tien_mat_cuoi_ca_ly_thuyet, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td colspan="2" class="text-right">Tiền mặt cuối ca (thực tế)</td>
                    <td class="text-right">{{ number_format($ca->tien_mat_cuoi_ca_thuc_te ?? 0, 0, ',', '.') }}</td>
                </tr>
                <tr style="background-color: {{ $ca->chenh_lech != 0 ? '#fff3cd' : '#d4edda' }};">
                    <td colspan="2" class="text-right">Chênh lệch (Thực tế - Lý thuyết)</td>
                    <td class="text-right">{{ number_format($ca->chenh_lech, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    @if($ca->ghi_chu_mo_ca || $ca->ghi_chu_dong_ca || $ca->giai_trinh_chenh_lech)
    <div class="info-section">
        <h3>IV. GHI CHÚ</h3>
        @if($ca->ghi_chu_mo_ca)
        <div class="note-section">
            <strong>Ghi chú mở ca:</strong>
            <p>{{ $ca->ghi_chu_mo_ca }}</p>
        </div>
        @endif

        @if($ca->ghi_chu_dong_ca)
        <div class="note-section">
            <strong>Ghi chú đóng ca:</strong>
            <p>{{ $ca->ghi_chu_dong_ca }}</p>
        </div>
        @endif

        @if($ca->giai_trinh_chenh_lech)
        <div class="note-section">
            <strong>Giải trình chênh lệch:</strong>
            <p>{{ $ca->giai_trinh_chenh_lech }}</p>
        </div>
        @endif
    </div>
    @endif

    <div class="signature-section">
        <div class="signature-box">
            <p><strong>Người bàn giao</strong></p>
            <p>({{ $ca->nhanVienMoCa->name ?? 'N/A' }})</p>
            <div class="signature-space"></div>
            <p>___________________</p>
        </div>
        <div class="signature-box">
            <p><strong>Người nhận bàn giao</strong></p>
            <p>({{ $ca->nhanVienDongCa->name ?? 'N/A' }})</p>
            <div class="signature-space"></div>
            <p>___________________</p>
        </div>
    </div>

    <div class="footer">
        <p>Biên bản được in lúc: {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</p>
        <p>Hệ thống quản lý Spa</p>
    </div>
</body>
</html>
