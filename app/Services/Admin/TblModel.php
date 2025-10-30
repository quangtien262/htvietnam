<?php

namespace App\Services\Admin;
/**
 * Class CompanyService
 * @package App\Services\Users
 */
class TblModel
{
    static function model($tableName) {
        $model = 'App\\Models\\Auto\\' . $tableName;
        $result = new $model();
        return $result;
    }

    /**
     * $tableName
     * $conditions = ['column_name' => $value]
     */
    static function getAll($tableName, $conditions = []) {
        $datas = self::model($tableName);
        return $datas->get();
    }

    /**
     * $tableName
     * $id
     */
    static function find($tableName, $id) {
        $data = self::model($tableName);
        return $data->find($id);
    }

    /**
     * $tableName
     * $limit
     * $conditions = ['column_name' => $value]
     */
    static function paginate($tableName, $limit = 30, $conditions = []) {
        $datas = self::model($tableName);
        foreach($conditions as $key => $val) {
            $datas->where($key, $val);
        }
        return $datas->paginate($limit);
    }

}
