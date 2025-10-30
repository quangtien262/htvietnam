<?php
namespace App\Services\Admin;

use App\Models\Admin\Table;
use App\Models\Admin\Column;
use App\Services\Service;

class AutoGenService 
{
    static function genModel($dir = '')
    {
        if(empty($dir)) {
            $dir = base_path() . '/app/Models/Auto/';
        }
        
       // check exit dir
       if (!file_exists($dir)) {
           mkdir($dir, 0755);
       }

       // delete all
       $files = glob($dir . '*'); // get all file names
       foreach($files as $file){
           if(is_file($file)) {
               unlink($file); // delete file
           }
       }

       // create all
       $tables = Table::all();
       foreach($tables as $table) {
           // open file
           $filePath = $dir . $table->name.'.php';

           $file = fopen($filePath, "w");

           // check column
           $columns = Column::where('table_id', $table->id)->get();

           $cast_code = "protected \$casts = [\n";
           foreach($columns as $col) {
               if(in_array($col->type_edit, ['images', 'images_crop'])) {
                   $cast_code .= "         '{$col->name}' => Json::class,\n";
               };

               if(in_array($col->type_edit, ['selects'])) {
                   $cast_code .= "         '{$col->name}' => JoinMultiple::class,\n";
               };

               if(in_array($col->type_edit, ['select'])) {
                   $cast_code .= "         '{$col->name}' => LeftJoin::class,\n";
               };
           }
           $cast_code .= '     ];';


           // write
           $code = '<?php
namespace App\Models\Auto;
use App\Casts\LeftJoin;
use App\Casts\JoinMultiple;
use App\Casts\Json;
use Illuminate\Database\Eloquent\Model;
class '.$table->name.' extends Model{
   protected $table = "'.$table->name.'";
   '.$cast_code.'
}';
           fwrite($file, $code);
           fclose($file);
       }
    
    }
}



