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

        <h3 class="center" style="text-transform: uppercase">Phiếu xuất kho</h3>

        <div class="info">
            <ul>
                <li>Mã xuất kho: {{ $data->code }}</li>
                <li>Nhân viên hủy: {{$data->nhan_vien}}</li>
                <li>Chi nhánh: {{$data->chi_nhanh}}</li>
                <li>Người tạo: {{!empty($nguoiTao->name) ? $nguoiTao->name : 'Chưa xác định'}}</li>
                <li>Lý do hủy: {{ $data->lydo}}</li>
                <li>Trạng thái: {{ $data->is_draft == 2 ? 'Đã hủy':'Lưu nháp'}}</li>
            </ul>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Hàng hóa</th>
                    <th class="text-center">SL trước hủy</th>
                    <th class="text-center">SL hủy</th>
                    <th class="text-center">SL sau hủy</th>
                    <th>Giá vốn</th>
                    <th>Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($dataDetail as $idx => $detail)
                    <tr>
                        <td class="text-center">{{($idx + 1)}}</td>
                        <td>
                            {{$detail->product_code}}
                            <br/>
                            {{$detail->product_name}}
                        </td>
                        <td class="text-center">{{$detail->ton_kho_truoc_khi_huy}}</td>
                        <td class="text-center">{{$detail->ton_kho_sau_khi_huy}}</td>
                        <td>{{number_format($detail->gia_von)}}<sup>đ</sup></td>
                        <td>{{number_format($detail->gia_tri_huy)}}<sup>đ</sup></td>
                    </tr>
                @endforeach

                    <tr>
                        <td colspan="5" class="text-right">Tổng số lượng hủy: </td>
                        <td>{{ number_format($data->so_luong_huy) }}</td>
                    </tr>
                    <tr>
                        <td colspan="5" class="text-right">Tổng giá trị hủy:</td>
                        <td>{{ number_format($data->gia_tri_huy) }}<sup>đ</sup></td>
                    </tr>

            </tbody>
        </table>
    </div>

     <script>
        // window.print();
    </script>
</body>

</html>