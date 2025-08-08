<?php

namespace App\Http\Controllers\Admin;

use App\Models\Export;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Illuminate\Support\Facades\DB;
use App\Models\Admin\Table;
use App\Models\Admin\Column;

use function PHPUnit\Framework\isEmpty;

class ExportDB implements FromCollection, WithHeadings
{
    private $ids;
    private $tableId;
    public function __construct($tableIdTemp, $idTmp)
    {
        $this->ids = $idTmp;
        $this->tableId = $tableIdTemp;
    }

    public function collection()
    {
        $result = [];
        $resultTemp = [];
        $table = Table::find($this->tableId);
        $columns = Column::where('table_id',  $this->tableId)->orderBy('sort_order', 'asc')->get();
        if (empty($this->ids)) {
            $datas = DB::table($table->name);
            if (!empty($_GET['search'])) {
                foreach ($_GET['search'] as $key => $search) {
                    $datas = $datas->where($key, $search);
                }
            }
            $datas = $datas->get();
            foreach ($datas as $data) {
                foreach ($columns as $col) {
                    if ($col->edit != 1 || 
                        in_array($col->block_type, ['block_basic', 'tab', 'block_right']) || 
                        in_array($col->type_edit, ['tiny', 'image', 'images', 'image_crop', 'images_crop', 'selects_table'])) {
                        continue;
                    }
                    $resultTemp[$col->display_name] = $data->{$col->name};
                }
                array_push($result, $resultTemp);
            }
            return collect($result);
        } 

        $records = DB::table($table->name)->whereIn('id', $this->ids)->get();
        foreach ($records as $record) {
            foreach ($columns as $col) {
                if ($col->edit != 1 || 
                    in_array($col->block_type, ['block_basic', 'tab', 'block_right']) || 
                    in_array($col->type_edit, ['tiny', 'image', 'images', 'image_crop', 'images_crop', 'selects_table'])) {
                    continue;
                }
                $resultTemp[$col->display_name] = $record->{$col->name};
            }
        }
        // dd($result);
        array_push($result, $resultTemp);
        return collect($result);
    }
    public function headings(): array
    {
        if(empty($this->collection()->first()))
            return [];
        $attributes = array_keys($this->collection()->first());
        return $attributes;
    }
}
