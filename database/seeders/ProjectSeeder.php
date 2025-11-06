<?php

namespace Database\Seeders;

use App\Models\Admin\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProjectSeeder extends Seeder
{

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        DB::table('tasks')->truncate();
        DB::table('meeting_status')->truncate();
        DB::table('projects')->truncate();
        DB::table('task_status')->truncate();

        $statusOrder = 1;
        DB::table('meeting_status')->insert([
            ['name' => 'Chờ họp', 'parent_name' => 'projects', 'color' => '#ffffff', 'background' => '#c1a207', 'icon' => 'ExclamationCircleFilled', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Đang phân tích', 'parent_name' => 'projects', 'color' => '#ffffff', 'background' => '#0072ff', 'icon' => 'SyncOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Đã hoàn thành', 'parent_name' => 'projects', 'color' => '#ffffff', 'background' => '#08b14e', 'icon' => 'CheckCircleFilled', 'sort_order' => $statusOrder++, 'is_default' => 0],
        ]);

        //////////// tạo sẵn 1 project mặc định để liên kết với task chung mà ko thuộc project nào

        DB::table('task_priority')->truncate();
        $idx = 1;
        DB::table('task_priority')->insert([
            ['name' => 'Urgent', 'color' => '#d30000ff', 'parent_name' => 'all', 'sort_order' => $idx++],
            ['name' => 'High', 'color' => '#d3c500ff', 'parent_name' => 'all', 'sort_order' => $idx++],
            ['name' => 'Medium', 'color' => '#0072ff', 'parent_name' => 'all', 'sort_order' => $idx++],
            ['name' => 'Low', 'color' => '#07a2adff', 'parent_name' => 'all', 'sort_order' => $idx++],
        ]);
        // status cho nhóm projects chung
        DB::table('project_status')->truncate();
        DB::table('project_status')->insert([
            ['name' => 'Chuẩn bị', 'parent_name' => 'all', 'color' => '#ffffff', 'background' => '#c2c205ff', 'icon' => 'EyeFilled', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Đang triển khai', 'parent_name' => 'all', 'color' => '#ffffff', 'background' => '#0072ff', 'icon' => 'SyncOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Đã hoàn thành', 'parent_name' => 'all', 'color' => '#ffffff', 'background' => '#079c48ff', 'icon' => 'CheckCircleFilled', 'sort_order' => $statusOrder++, 'is_default' => 0],
            ['name' => 'Hủy/Dừng', 'parent_name' => 'all', 'color' => '#ffffff', 'background' => '#64748b', 'icon' => 'CloseCircleOutlined', 'sort_order' => $statusOrder++, 'is_default' => 0],
        ]);
        $dangTrienKhai = DB::table('project_status')->where('name', 'Đang triển khai')->where('parent_name', 'all')->first();
        $project = new Project();
        $project->name = 'Công việc chung';
        $project->description = 'Các công việc chung không thuộc dự án nào';
        $project->project_status_id = $dangTrienKhai->id;
        $project->project_manager = 1;
        $project->sort_order = 1;
        $project->create_by = 1;
        $project->parent_name = 'all';
        $project->save();
        // status task chung
        $idx = 1;
        $statusTaskOther = [
            ['name' => 'Chưa xử lý', 'color' => '#fff', 'background' => '#f60505ff', 'icon' => 'ExclamationCircleFilled', 'sort_order' => $idx++, 'parent_name' => 'all', 'project_id' => $project->id, 'is_default' => 1],
            ['name' => 'Đang thực hiện', 'color' => '#fff', 'background' => '#0072ff', 'icon' => 'SyncOutlined', 'sort_order' => $idx++, 'parent_name' => 'all', 'project_id' => $project->id, 'is_default' => 1],
            ['name' => 'Hoàn thành', 'color' => '#fff', 'background' => '#0dc65aff', 'icon' => 'CheckCircleOutlined', 'sort_order' => $idx++, 'parent_name' => 'all', 'project_id' => $project->id, 'is_default' => 0],
            ['name' => 'Hủy/Dừng', 'color' => '#fff', 'background' => '#5c5a5aff', 'icon' => 'CloseCircleOutlined', 'sort_order' => $idx++, 'parent_name' => 'all', 'project_id' => $project->id, 'is_default' => 0],
        ];
        DB::table('task_status')->insert($statusTaskOther);
        //////////////////////// end project chung

        /////////////// tạo task demo cho project aitilen
        $status = DB::table('task_status')->where('name', 'Chưa xử lý')->where('parent_name', 'all')->first();

        // project aitilen:

        // priority cho tasks aitilen
        DB::table('task_priority')->truncate();
        $idx = 1;
        DB::table('task_priority')->insert([
            ['name' => 'Urgent', 'color' => '#d30000ff', 'parent_name' => 'aitilen', 'sort_order' => $idx++],
            ['name' => 'High', 'color' => '#d3c500ff', 'parent_name' => 'aitilen', 'sort_order' => $idx++],
            ['name' => 'Medium', 'color' => '#0072ff', 'parent_name' => 'aitilen', 'sort_order' => $idx++],
            ['name' => 'Low', 'color' => '#07a2adff', 'parent_name' => 'aitilen', 'sort_order' => $idx++],
        ]);
        // status cho nhóm projects chung
        DB::table('project_status')->truncate();
        DB::table('project_status')->insert([
            ['name' => 'Chuẩn bị', 'parent_name' => 'aitilen', 'color' => '#ffffff', 'background' => '#c2c205ff', 'icon' => 'EyeFilled', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Đang triển khai', 'parent_name' => 'aitilen', 'color' => '#ffffff', 'background' => '#0072ff', 'icon' => 'SyncOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Đã hoàn thành', 'parent_name' => 'aitilen', 'color' => '#ffffff', 'background' => '#079c48ff', 'icon' => 'CheckCircleFilled', 'sort_order' => $statusOrder++, 'is_default' => 0],
            ['name' => 'Hủy/Dừng', 'parent_name' => 'aitilen', 'color' => '#ffffff', 'background' => '#64748b', 'icon' => 'CloseCircleOutlined', 'sort_order' => $statusOrder++, 'is_default' => 0],
        ]);
        $dangTrienKhai = DB::table('project_status')->where('name', 'Đang triển khai')->where('parent_name', 'aitilen')->first();
        $project = new Project();
        $project->name = 'Công việc chung';
        $project->description = 'Các công việc chung không thuộc dự án nào';
        $project->project_status_id = $dangTrienKhai->id;
        $project->project_manager = 1;
        $project->sort_order = 1;
        $project->create_by = 1;
        $project->parent_name = 'aitilen';
        $project->save();
        // status task chung
        $idx = 1;
        $statusTaskOther = [
            ['name' => 'Chưa xử lý', 'color' => '#fff', 'background' => '#f60505ff', 'icon' => 'ExclamationCircleFilled', 'sort_order' => $idx++, 'parent_name' => 'aitilen', 'project_id' => $project->id, 'is_default' => 1],
            ['name' => 'Đang thực hiện', 'color' => '#fff', 'background' => '#0072ff', 'icon' => 'SyncOutlined', 'sort_order' => $idx++, 'parent_name' => 'aitilen', 'project_id' => $project->id, 'is_default' => 1],
            ['name' => 'Hoàn thành', 'color' => '#fff', 'background' => '#0dc65aff', 'icon' => 'CheckCircleOutlined', 'sort_order' => $idx++, 'parent_name' => 'aitilen', 'project_id' => $project->id, 'is_default' => 0],
            ['name' => 'Hủy/Dừng', 'color' => '#fff', 'background' => '#5c5a5aff', 'icon' => 'CloseCircleOutlined', 'sort_order' => $idx++, 'parent_name' => 'aitilen', 'project_id' => $project->id, 'is_default' => 0],
        ];
        DB::table('task_status')->insert($statusTaskOther);
        //////////////////////// end project chung

        /////////////// tạo task demo cho project aitilen

        $status = DB::table('task_status')->where('name', 'Chưa xử lý')->where('parent_name', 'aitilen')->first();

        $categorysAitilen = [
            ['name' => 'Bảo trì/Sửa chữa', 'color' => '#b39e00', 'icon' => 'SettingOutlined', 'sort_order' => $idx++, 'parent_name' => 'aitilen', 'project_id' => $project->id, 'is_default' => 1],
           ['name' => 'Hỏi đáp/góp ý', 'color' => '#088ddb', 'icon' => 'QuestionCircleOutlined', 'sort_order' => $idx++, 'parent_name' => 'aitilen', 'project_id' => $project->id, 'is_default' => 0],
            ['name' => 'Khẩn cấp', 'color' => '#e70707', 'icon' => 'RiseOutlined', 'sort_order' => $idx++, 'parent_name' => 'aitilen', 'project_id' => $project->id, 'is_default' => 0],
            ['name' => 'Khác', 'color' => '#5908d9', 'icon' => 'SmallDashOutlined', 'sort_order' => $idx++, 'parent_name' => 'aitilen', 'project_id' => $project->id, 'is_default' => 0],
        ];
        DB::table('task_category')->insert($categorysAitilen);

        DB::table('tasks')->insert([
            [
                'name' => 'Điều tra và tham khảo các làm từ các bên khác về vấn đề VAT',
                'description' => 'Tham khảo bên tingtong hoặc 1 vài bên khác xem nếu mình thuê cho nv công ty thì vấn đề VAT, thuế họ tính thế nào?',
                'project_id' => $project->id,
                'task_status_id' => $status->id,
                'nguoi_thuc_hien' => 3,
                'create_by' => 1,
                'sort_order' => 1,
                'parent_name' => 'aitilen',
            ],
            [
                'name' => 'Mua thùng rác cho nhà 25b. chuyển từ ĐC sang cũng được',
                'description' => '',
                'project_id' => $project->id,
                'task_status_id' => $status->id,
                'nguoi_thuc_hien' => 4,
                'create_by' => 1,
                'sort_order' => 1,
                'parent_name' => 'aitilen',
            ],
            [
                'name' => 'Chụp ảnh phòng 101 của nhà 127',
                'description' => '',
                'project_id' => $project->id,
                'task_status_id' => $status->id,
                'nguoi_thuc_hien' => 4,
                'create_by' => 1,
                'sort_order' => 1,
                'parent_name' => 'aitilen',
            ],
            [
                'name' => 'Ký hợp đồng với khách nhà 25B',
                'description' => '',
                'project_id' => $project->id,
                'task_status_id' => $status->id,
                'nguoi_thuc_hien' => 3,
                'create_by' => 1,
                'sort_order' => 1,
                'parent_name' => 'aitilen',
            ],
            [
                'name' => 'Lắp camera cho nhà 40',
                'description' => '',
                'project_id' => $project->id,
                'task_status_id' => $status->id,
                'nguoi_thuc_hien' => 4,
                'create_by' => 1,
                'sort_order' => 1,
                'parent_name' => 'aitilen',
            ],
            [
                'name' => 'Chỉnh lại vị trí camera nhà 127 cho dễ nhìn hơn',
                'description' => '',
                'project_id' => $project->id,
                'task_status_id' => $status->id,
                'nguoi_thuc_hien' => 4,
                'create_by' => 1,
                'sort_order' => 1,
                'parent_name' => 'aitilen',
            ],
        ]);
        /////////////////////// end tạo task demo cho project aitilen


        //////////////////////// tạo sẵn 1 project SALE: quy trình sale của HTVietNam
        // status cho nhóm projects SALE
        DB::table('project_status')->insert([
            ['name' => 'Đang triển khai', 'parent_name' => 'sales', 'color' => '#ffffff', 'background' => '#0072ff', 'icon' => 'SyncOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1],
        ]);
        $dangTrienKhai = DB::table('project_status')->where('name', 'Đang triển khai')->where('parent_name', 'sales')->first();
        $sale = new Project();
        $sale->name = 'Dự án SALE';
        $sale->description = 'Các công việc chung của SALES';
        $sale->project_status_id = $dangTrienKhai->id;
        $sale->project_manager = 1;
        $sale->sort_order = 1;
        $sale->create_by = 1;
        $sale->parent_name = 'sales';
        $sale->save();
        // status cuar task sale
        $statusTaskSale = [
            ['name' => 'Chưa liên hệ', 'color' => '#fff', 'background' => '#f60505ff', 'icon' => 'ExclamationCircleFilled', 'sort_order' => $idx++, 'parent_name' => 'sales', 'project_id' => $sale->id, 'is_default' => 1],
            ['name' => 'Đang CSKH', 'color' => '#fff', 'background' => '#0072ff', 'icon' => 'SyncOutlined', 'sort_order' => $idx++, 'parent_name' => 'sales', 'project_id' => $sale->id, 'is_default' => 1],
            ['name' => 'Chốt đơn', 'color' => '#fff', 'background' => '#0dc65aff', 'icon' => 'CheckCircleOutlined', 'sort_order' => $idx++, 'parent_name' => 'sales', 'project_id' => $sale->id, 'is_default' => 0],
            ['name' => 'Tạm dừng', 'color' => '#fff', 'background' => '#5c5a5aff', 'icon' => 'CloseCircleOutlined', 'sort_order' => $idx++, 'parent_name' => 'sales', 'project_id' => $sale->id, 'is_default' => 0],
        ];
        DB::table('task_status')->insert($statusTaskSale);

        $idx = 1;
        DB::table('task_priority')->insert([
            ['name' => 'Urgent', 'color' => '#d30000ff', 'parent_name' => 'sales', 'sort_order' => $idx++],
            ['name' => 'High', 'color' => '#d3c500ff', 'parent_name' => 'sales', 'sort_order' => $idx++],
            ['name' => 'Medium', 'color' => '#0072ff', 'parent_name' => 'sales', 'sort_order' => $idx++],
            ['name' => 'Low', 'color' => '#07a2adff', 'parent_name' => 'sales', 'sort_order' => $idx++],
        ]);
        /////////////////////// end tạo project sale HTVietNam

        //////////////////////// tạo sẵn 1 project SALE: quy trình đẩy phòng của Aitilen
        // status cho nhóm projects đẩy phòng Aitilen
        $statusOrder = 1;
        $dangTrienKhai = DB::table('project_status')->insertGetId([
            'name' => 'Đang triển khai', 'parent_name' => 'day-phong', 'color' => '#ffffff', 'background' => '#0072ff', 'icon' => 'SyncOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1,
        ]);
        $AitilenSale = new Project();
        $AitilenSale->name = 'Đẩy phòng';
        $AitilenSale->description = 'Danh sách các phòng trống cần đẩy của Aitilen';
        $AitilenSale->project_status_id = $dangTrienKhai;
        $AitilenSale->project_manager = 1;
        $AitilenSale->sort_order = 1;
        $AitilenSale->create_by = 1;
        $AitilenSale->parent_name = 'day-phong';
        $AitilenSale->save();
        // status của task đẩy phòng Aitilen
        $idx = 1;
        $statusTaskSale = [
            ['name' => 'Phòng sắp trống', 'color' => '#fff', 'background' => '#D78306', 'icon' => 'ExclamationCircleFilled', 'sort_order' => $idx++, 'parent_name' => 'day-phong', 'project_id' => $AitilenSale->id, 'is_default' => 1],
            ['name' => 'Phòng đang trống', 'color' => '#fff', 'background' => '#f60505ff', 'icon' => 'SyncOutlined', 'sort_order' => $idx++, 'parent_name' => 'day-phong', 'project_id' => $AitilenSale->id, 'is_default' => 1],
            ['name' => 'Đã cọc', 'color' => '#fff', 'background' => '#0dc65aff', 'icon' => 'CheckCircleOutlined', 'sort_order' => $idx++, 'parent_name' => 'day-phong', 'project_id' => $AitilenSale->id, 'is_default' => 0],
            ['name' => 'Done', 'color' => '#fff', 'background' => '#0072ff', 'icon' => 'CloseCircleOutlined', 'sort_order' => $idx++, 'parent_name' => 'day-phong', 'project_id' => $AitilenSale->id, 'is_default' => 0],
        ];
        DB::table('task_status')->insert($statusTaskSale);

        $idx = 1;
        DB::table('task_priority')->insert([
            ['name' => 'Urgent', 'color' => '#d30000ff', 'parent_name' => 'day-phong', 'sort_order' => $idx++],
            ['name' => 'High', 'color' => '#d3c500ff', 'parent_name' => 'day-phong', 'sort_order' => $idx++],
            ['name' => 'Medium', 'color' => '#0072ff', 'parent_name' => 'day-phong', 'sort_order' => $idx++],
            ['name' => 'Low', 'color' => '#07a2adff', 'parent_name' => 'day-phong', 'sort_order' => $idx++],
        ]);
        /////////////////////// end tạo project đẩy phòng Aitilen

        //////////////////////// tạo sẵn 1 project SALE: quy trình sale của Aitilen
        // status cho nhóm projects SALE Aitilen
        $statusOrder = 1;
        $dangTrienKhai = DB::table('project_status')->insertGetId([
            'name' => 'Đang triển khai', 'parent_name' => 'aitilen-sales', 'color' => '#ffffff', 'background' => '#0072ff', 'icon' => 'SyncOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1,
        ]);
        $AitilenSale = new Project();
        $AitilenSale->name = 'Khách xem phòng';
        $AitilenSale->description = 'Danh sách các khách hàng xem phòng tại Aitilen';
        $AitilenSale->project_status_id = $dangTrienKhai;
        $AitilenSale->project_manager = 1;
        $AitilenSale->sort_order = 1;
        $AitilenSale->create_by = 1;
        $AitilenSale->parent_name = 'aitilen-sales';
        $AitilenSale->save();
        // status cuar task sale Aitilen
        $idx = 1;
        $statusTaskSale = [
            ['name' => 'Chưa liên hệ', 'color' => '#fff', 'background' => '#f60505ff', 'icon' => 'ExclamationCircleFilled', 'sort_order' => $idx++, 'parent_name' => 'aitilen-sales', 'project_id' => $AitilenSale->id, 'is_default' => 1, 'width' => 185],
            ['name' => 'Đang xem phòng', 'color' => '#fff', 'background' => '#0072ff', 'icon' => 'SyncOutlined', 'sort_order' => $idx++, 'parent_name' => 'aitilen-sales', 'project_id' => $AitilenSale->id, 'is_default' => 1, 'width' => 185],
            ['name' => 'Chờ confirm', 'color' => '#fff', 'background' => '#05489b', 'icon' => 'Spin', 'sort_order' => $idx++, 'parent_name' => 'aitilen-sales', 'project_id' => $AitilenSale->id, 'is_default' => 0, 'width' => 185],
            ['name' => 'Đã cọc', 'color' => '#fff', 'background' => '#057634', 'icon' => 'CheckCircleOutlined', 'sort_order' => $idx++, 'parent_name' => 'aitilen-sales', 'project_id' => $AitilenSale->id, 'is_default' => 0, 'width' => 185],
            ['name' => 'Đã ký hợp đồng', 'color' => '#fff', 'background' => '#06b14d', 'icon' => 'CheckSquareOutlined', 'sort_order' => $idx++, 'parent_name' => 'aitilen-sales', 'project_id' => $AitilenSale->id, 'is_default' => 0, 'width' => 185],
            ['name' => 'Đã hủy', 'color' => '#fff', 'background' => '#5c5a5aff', 'icon' => 'CloseCircleOutlined', 'sort_order' => $idx++, 'parent_name' => 'aitilen-sales', 'project_id' => $AitilenSale->id, 'is_default' => 0, 'width' => 185],
        ];
        DB::table('task_status')->insert($statusTaskSale);

        $idx = 1;
        DB::table('task_priority')->insert([
            ['name' => 'Urgent', 'color' => '#d30000ff', 'parent_name' => 'aitilen-sales', 'sort_order' => $idx++],
            ['name' => 'High', 'color' => '#d3c500ff', 'parent_name' => 'aitilen-sales', 'sort_order' => $idx++],
            ['name' => 'Medium', 'color' => '#0072ff', 'parent_name' => 'aitilen-sales', 'sort_order' => $idx++],
            ['name' => 'Low', 'color' => '#07a2adff', 'parent_name' => 'aitilen-sales', 'sort_order' => $idx++],
        ]);
        /////////////////////// end tạo project sale Aitilen



        ///////////// config cho PROJECTS
        // status cho tasks của PROJECTS
        $statusOrder = 1;
        DB::table('task_status')->insert([
            ['name' => 'Chờ xử lý', 'parent_name' => 'projects', 'color' => '#ffffff', 'background' => '#64748b', 'icon' => 'ExclamationCircleFilled', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Đang xử lý', 'parent_name' => 'projects', 'color' => '#ffffff', 'background' => '#0072ff', 'icon' => 'SyncOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Chờ review', 'parent_name' => 'projects', 'color' => '#ffffff', 'background' => '#057734', 'icon' => 'EyeFilled', 'sort_order' => $statusOrder++, 'is_default' => 0],
            ['name' => 'Đã hoàn thành', 'parent_name' => 'projects', 'color' => '#ffffff', 'background' => '#08b14e', 'icon' => 'CheckCircleFilled', 'sort_order' => $statusOrder++, 'is_default' => 0],
            ['name' => 'Hủy/Dừng', 'parent_name' => 'projects', 'color' => '#ffffff', 'background' => '#64748b', 'icon' => 'CloseCircleOutlined', 'sort_order' => $statusOrder++, 'is_default' => 0],
        ]);
        // status  của PROJECTS
        $statusOrder = 1;
        DB::table('project_status')->insert([
            ['name' => 'Chuẩn bị', 'parent_name' => 'projects', 'color' => '#ffffff', 'background' => '#c2c205ff', 'icon' => 'EyeFilled', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Đang triển khai', 'parent_name' => 'projects', 'color' => '#ffffff', 'background' => '#0072ff', 'icon' => 'SyncOutlined', 'sort_order' => $statusOrder++, 'is_default' => 1],
            ['name' => 'Đã hoàn thành', 'parent_name' => 'projects', 'color' => '#ffffff', 'background' => '#079c48ff', 'icon' => 'CheckCircleFilled', 'sort_order' => $statusOrder++, 'is_default' => 0],
            ['name' => 'Hủy/Dừng', 'parent_name' => 'projects', 'color' => '#ffffff', 'background' => '#64748b', 'icon' => 'CloseCircleOutlined', 'sort_order' => $statusOrder++, 'is_default' => 0],
        ]);
        //loại dự án: PROJECTS
        $idx = 1;
        DB::table('project_type')->truncate();
        $statusTaskOther = [
            ['name' => 'Dự án phầm mềm', 'color' => '#0072ff', 'icon' => 'StepForwardOutlined', 'sort_order' => $idx++, 'parent_name' => 'projects'],
            ['name' => 'Dự án BĐS', 'color' => '#0dc65aff', 'icon' => 'ForwardOutlined', 'sort_order' => $idx++, 'parent_name' => 'projects'],
        ];
        DB::table('project_type')->insert($statusTaskOther);
        $idx = 1;
        DB::table('task_priority')->insert([
            ['name' => 'Urgent', 'color' => '#d30000ff', 'parent_name' => 'projects', 'sort_order' => $idx++],
            ['name' => 'High', 'color' => '#d3c500ff', 'parent_name' => 'projects', 'sort_order' => $idx++],
            ['name' => 'Medium', 'color' => '#0072ff', 'parent_name' => 'projects', 'sort_order' => $idx++],
            ['name' => 'Low', 'color' => '#07a2adff', 'parent_name' => 'projects', 'sort_order' => $idx++],
        ]);

        ////////////////////// end config cho PROJECTS


        DB::table('task_type')->truncate();
        DB::table('task_type')->insert([
            ['name' => 'Hàng ngày', 'color' => '#079106', 'parent_name' => 'task'],
            ['name' => 'Dự án', 'color' => '#920303ff', 'parent_name' => 'task'],
            ['name' => 'Sale', 'color' => '#680586ff', 'parent_name' => 'task'],
            ['name' => 'CSKH', 'color' => '#041f96ff', 'parent_name' => 'task'],
        ]);
    }
}
