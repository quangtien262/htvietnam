<?php
namespace App\Http\Controllers\Admin;
use App\Models\User;
use Maatwebsite\Excel\Concerns\ToModel;

use App\Models\Export;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\Tocollection;
use App\Models\Admin\Table;
use App\Models\Admin\Column;
use PhpOffice\PhpSpreadsheet\Reader\Exception;
use Illuminate\Database\QueryException;


class ImportDB implements ToCollection ,WithHeadingRow
{
    private $tableId;
    public function __construct($tableIdTemp) {

        $this->tableId = $tableIdTemp;
    }

    public function collection(Collection $rows){
        try{
        // Validate
        Validator::make($rows->toArray(), [

        ],[

        ])->validate();
        $columns = Column::where('table_id', $this->tableId)->where('edit', 1)->whereNotIn('type_edit', ['image', 'images', 'images_crop', 'image_crop', 'tiny'])->get();
        $table = Table::find($this->tableId);
        foreach ($rows as $row) {
            $resultTemp = [];
            foreach ($columns as $col) {
                $name = app('Helper')->formatText02($col->display_name, '_');
                if(empty($row[$name])) {
                    continue;
                }
                $resultTemp[$col->name] = $row[$name];
            }
            DB::table($table->name)->insert($resultTemp);
         }
         
        } catch (QueryException $e) {
            $error_code = $e->errorInfo[1];
            return back()->withErrors('There was a problem uploading the data!');
        }
        return back()->withSuccess('Great! Data has been successfully uploaded.');
      }

     // Specify header row index position to skip
     public function headingRow(): int {
        return 1;
     }
}
