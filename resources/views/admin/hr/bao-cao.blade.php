<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo nhân sự - Dashboard HR</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f7fa;
            padding: 20px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }

        .filter-bar {
            background: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .filter-bar label {
            font-weight: 600;
            margin-right: 8px;
        }

        .filter-bar select {
            padding: 8px 15px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1em;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .stat-card .icon {
            font-size: 2.5em;
            margin-bottom: 15px;
        }

        .stat-card .label {
            color: #6b7280;
            font-size: 0.9em;
            margin-bottom: 8px;
            font-weight: 500;
        }

        .stat-card .value {
            font-size: 2em;
            font-weight: 700;
            color: #1f2937;
        }

        .stat-card.primary { border-left: 5px solid #667eea; }
        .stat-card.success { border-left: 5px solid #10b981; }
        .stat-card.warning { border-left: 5px solid #f59e0b; }
        .stat-card.danger { border-left: 5px solid #ef4444; }
        .stat-card.info { border-left: 5px solid #3b82f6; }

        .chart-section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .chart-section h2 {
            margin-bottom: 20px;
            color: #1f2937;
            font-size: 1.5em;
        }

        .detail-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .detail-table th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }

        .detail-table td {
            padding: 15px;
            border-bottom: 1px solid #f3f4f6;
        }

        .detail-table tr:hover {
            background: #f9fafb;
        }

        .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }

        .badge.success { background: #d1fae5; color: #065f46; }
        .badge.warning { background: #fef3c7; color: #92400e; }
        .badge.danger { background: #fee2e2; color: #991b1b; }
        .badge.info { background: #dbeafe; color: #1e3a8a; }

        .back-btn {
            display: inline-block;
            background: white;
            color: #667eea;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }

        .back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            .filter-bar {
                flex-direction: column;
                align-items: stretch;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="{{ url('/') }}" class="back-btn">← Quay lại</a>
            <h1>📊 Báo cáo & Thống kê Nhân sự</h1>
            <p>Tháng {{ $thang }}/{{ $nam }}</p>
        </div>

        <div class="filter-bar">
            <form method="GET" action="{{ route('hr.bao-cao.dashboard') }}" style="display: flex; gap: 15px; width: 100%;">
                <div>
                    <label>Tháng:</label>
                    <select name="thang" onchange="this.form.submit()">
                        @for($i = 1; $i <= 12; $i++)
                            <option value="{{ $i }}" {{ $thang == $i ? 'selected' : '' }}>{{ $i }}</option>
                        @endfor
                    </select>
                </div>
                <div>
                    <label>Năm:</label>
                    <select name="nam" onchange="this.form.submit()">
                        @for($i = 2023; $i <= 2026; $i++)
                            <option value="{{ $i }}" {{ $nam == $i ? 'selected' : '' }}>{{ $i }}</option>
                        @endfor
                    </select>
                </div>
            </form>
        </div>

        <!-- THỐNG KÊ TỔNG QUAN -->
        <div class="stats-grid">
            <div class="stat-card primary">
                <div class="icon">👥</div>
                <div class="label">Tổng nhân viên</div>
                <div class="value">{{ number_format($tongNhanVien) }}</div>
            </div>

            <div class="stat-card success">
                <div class="icon">✅</div>
                <div class="label">Nhân viên mới</div>
                <div class="value">{{ number_format($nhanVienMoi) }}</div>
            </div>

            <div class="stat-card danger">
                <div class="icon">👋</div>
                <div class="label">Nghỉ việc</div>
                <div class="value">{{ number_format($nhanVienNghiViec) }}</div>
            </div>

            <div class="stat-card warning">
                <div class="icon">💰</div>
                <div class="label">Tổng lương tháng</div>
                <div class="value">{{ number_format($tongLuong / 1000000, 1) }}M</div>
            </div>
        </div>

        <!-- CHẤM CÔNG -->
        <div class="chart-section">
            <h2>⏰ Thống kê chấm công</h2>
            <div class="stats-grid">
                <div class="stat-card info">
                    <div class="label">Số nhân viên chấm công</div>
                    <div class="value">{{ $chamCongStats->so_nhan_vien ?? 0 }}</div>
                </div>
                <div class="stat-card success">
                    <div class="label">Đi làm</div>
                    <div class="value">{{ $chamCongStats->di_lam ?? 0 }}</div>
                </div>
                <div class="stat-card info">
                    <div class="label">Nghỉ phép</div>
                    <div class="value">{{ $chamCongStats->nghi_phep ?? 0 }}</div>
                </div>
                <div class="stat-card warning">
                    <div class="label">Nghỉ không phép</div>
                    <div class="value">{{ $chamCongStats->nghi_ko_phep ?? 0 }}</div>
                </div>
                <div class="stat-card danger">
                    <div class="label">Đi muộn/Về sớm</div>
                    <div class="value">{{ $chamCongStats->di_muon ?? 0 }}</div>
                </div>
            </div>
        </div>

        <!-- NGHỈ PHÉP -->
        <div class="chart-section">
            <h2>📋 Thống kê nghỉ phép</h2>
            <table class="detail-table">
                <thead>
                    <tr>
                        <th>Chỉ tiêu</th>
                        <th>Số lượng</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Tổng đơn nghỉ phép</td>
                        <td><strong>{{ $nghiPhepStats->tong_don ?? 0 }}</strong></td>
                        <td><span class="badge info">Tổng hợp</span></td>
                    </tr>
                    <tr>
                        <td>Đơn chờ duyệt</td>
                        <td><strong>{{ $nghiPhepStats->cho_duyet ?? 0 }}</strong></td>
                        <td><span class="badge warning">Pending</span></td>
                    </tr>
                    <tr>
                        <td>Đơn đã duyệt</td>
                        <td><strong>{{ $nghiPhepStats->da_duyet ?? 0 }}</strong></td>
                        <td><span class="badge success">Approved</span></td>
                    </tr>
                    <tr>
                        <td>Đơn từ chối</td>
                        <td><strong>{{ $nghiPhepStats->tu_choi ?? 0 }}</strong></td>
                        <td><span class="badge danger">Rejected</span></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- HƯỚNG DẪN -->
        <div class="chart-section">
            <h2>📖 Hướng dẫn sử dụng báo cáo</h2>
            <ul style="line-height: 2; color: #4b5563;">
                <li>📅 Chọn <strong>Tháng/Năm</strong> ở phía trên để xem báo cáo theo kỳ</li>
                <li>👥 <strong>Tổng nhân viên</strong>: Số nhân viên đang làm việc (trạng thái active)</li>
                <li>✅ <strong>Nhân viên mới</strong>: Số nhân viên vào làm trong tháng được chọn</li>
                <li>👋 <strong>Nghỉ việc</strong>: Số nhân viên nghỉ việc trong tháng</li>
                <li>💰 <strong>Tổng lương</strong>: Tổng lương thực nhận của tất cả nhân viên</li>
                <li>⏰ <strong>Chấm công</strong>: Thống kê tình hình đi làm, nghỉ phép, đi muộn</li>
                <li>📋 <strong>Nghỉ phép</strong>: Tổng hợp đơn xin nghỉ và trạng thái duyệt</li>
            </ul>
        </div>

        <!-- QUICK LINKS -->
        <div class="chart-section">
            <h2>🔗 Truy cập nhanh</h2>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                <a href="{{ url('/hr/cham-cong') }}" style="padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    ⏰ Chấm công
                </a>
                <a href="{{ url('/hr/bang-luong') }}" style="padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    💰 Bảng lương
                </a>
                <a href="{{ url('/hr/nghi-phep') }}" style="padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    📋 Nghỉ phép
                </a>
                <a href="{{ url('/hr/huong-dan') }}" style="padding: 12px 24px; background: #6b7280; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    📖 Hướng dẫn
                </a>
            </div>
        </div>
    </div>
</body>
</html>
