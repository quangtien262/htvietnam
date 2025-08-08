<!DOCTYPE html>
<html>

<head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>Kiểm kho</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel='stylesheet' type='text/css' media='screen' href='/admin/css/print.css'>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 14px;
            margin: 40px;
        }
        .text-right {
            text-align: right;
            font-weight: bold
        }

        .invoice {
            width: 700px;
            margin: 0 auto;
        }

        .center {
            text-align: center;
        }

        .header,
        .footer {
            border-top: 1px dotted #000;
            border-bottom: 1px #000 dashed;
            margin: 10px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        table th,
        table td {
            padding: 6px 4px;
            text-align: left;
            border-bottom: 1px dotted #000;
        }

        .right {
            text-align: right;
        }

        .bold {
            font-weight: bold;
        }

        .total {
            margin-top: 20px;
            font-weight: bold;
        }

        .info {
            margin-top: 20px;
        }

        .text-right td {
            font-weight: bold;
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="invoice">
        <div>
            {{-- Chi nhánh: Chi nhánh trung tâm<br> --}}
            {{$info->name}}
            <br/>
            Điện thoại: {{$info->phone01}}
        </div>

        <div class="header"></div>

        <div>Ngày tạo phiếu: {{$data->created_at}}</div>

        <h3 class="center" style="text-transform: uppercase">Phiếu kiểm kho</h3>

        <div class="info">
            Người tạo: {{$nguoiTao->name}}<br>
            Người kiểm kho: {{!empty($nguoiKiem->name) ? $nguoiKiem->name : ''}}<br>
            Trạng thái: {{$data->is_draft == 2 ? 'Đã cân bằng kho' : 'Lưu nháp'}}<br>
            Mã phiếu: {{$data->code}}
        </div>

        <table>
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Mã - Tên Hàng</th>
                    <th>Giá nhập</th>
                    <th>Tồn kho</th>
                    <th>Thực tế</th>
                    <th class="text-center">SL lệch</th>
                    <th>Giá trị lệch</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($dataDetail as $idx => $detail)
                    <tr>
                        <td>{{($idx + 1)}}</td>
                        <td>
                            {{$detail->product_code}}
                            <br/>
                            {{$detail->product_name}}
                        </td>
                        <td>{{number_format($detail->gia_von)}}</td>
                        <td>{{$detail->ton_kho}}</td>
                        <td>{{$detail->thuc_te}}</td>
                        <td  class="text-center">{{$detail->so_luong_lech}}</td>
                        <td>{{number_format($detail->gia_tri_lech)}}</td>
                    </tr>
                @endforeach

                    <tr>
                        <td colspan="5" class="text-right">Tổng lệch tăng:</td>
                        <td class="text-center">{{ number_format($data->so_luong_lech_tang) }}</td>
                        <td>{{ number_format($data->tong_tien_lech_tang) }}</td>
                    </tr>
                    <tr>
                        <td colspan="5" class="text-right">Tổng lệch giảm:</td>
                        <td class="text-center">{{ number_format($data->so_luong_lech_giam) }}</td>
                        <td>{{ number_format($data->tong_tien_lech_giam) }}</td>
                    </tr>
                    <tr>
                        <td colspan="5" class="text-right">Tổng chênh lệch:</td>
                        <td class="text-center">{{ number_format($data->tong_sl_chenh_lech) }}</td>
                        <td>{{ number_format($data->tong_tien_chenh_lech) }}</td>
                    </tr>

            </tbody>
        </table>
    </div>

     <script>
        window.print();
    </script>
</body>

</html>