<?php

namespace App\Http\Controllers\Admin\Spa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KyNangController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('spa_ky_nang')
            ->select('id', 'name', 'color', 'sort_order', 'note', 'is_active', 'created_by', 'created_at', 'updated_at');

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where('name', 'like', $search);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Order by sort_order asc, then by name
        $skills = $query->orderBy('sort_order', 'asc')
                        ->orderBy('name', 'asc')
                        ->get();

        return $this->sendSuccessResponse($skills);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $id = DB::table('spa_ky_nang')->insertGetId([
            'name' => $request->name,
            'color' => $request->color,
            'sort_order' => $request->sort_order ?? 0,
            'note' => $request->note,
            'is_active' => $request->is_active ?? true,
            'created_by' => auth()->id(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $skill = DB::table('spa_ky_nang')->where('id', $id)->first();

        return $this->sendSuccessResponse(['id' => $id, 'data' => $skill], 'Tạo kỹ năng thành công');
    }

    public function update(Request $request, $id)
    {
        $skill = DB::table('spa_ky_nang')->where('id', $id)->first();
        if (!$skill) {
            return $this->sendErrorResponse('Không tìm thấy kỹ năng', 404);
        }

        $data = [];
        if ($request->filled('name')) $data['name'] = $request->name;
        if ($request->has('color')) $data['color'] = $request->color;
        if ($request->has('sort_order')) $data['sort_order'] = $request->sort_order;
        if ($request->has('note')) $data['note'] = $request->note;
        if ($request->has('is_active')) $data['is_active'] = $request->is_active;
        $data['updated_at'] = now();

        DB::table('spa_ky_nang')->where('id', $id)->update($data);

        return $this->sendSuccessResponse(null, 'Cập nhật thành công');
    }

    public function destroy($id)
    {
        DB::table('spa_ky_nang')->where('id', $id)->delete();
        return $this->sendSuccessResponse(null, 'Xóa thành công');
    }

    public function show($id)
    {
        $skill = DB::table('spa_ky_nang')->where('id', $id)->first();
        if (!$skill) {
            return $this->sendErrorResponse('Không tìm thấy kỹ năng', 404);
        }

        return $this->sendSuccessResponse($skill);
    }
}
