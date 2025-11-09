<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class NewsController extends Controller
{
    /**
     * Get languages list ordered by sort_order
     */
    public function getLanguages()
    {
        try {
            $languages = DB::table('languages')
                ->orderBy('sort_order', 'asc')
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Lấy danh sách ngôn ngữ thành công',
                'data' => $languages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get news list with pagination and search
     */
    public function apiList(Request $request)
    {
        try {
            $searchData = $request->input('searchData', []);
            $page = $searchData['page'] ?? 1;
            $pageSize = $searchData['pageSize'] ?? 20;
            $search = $searchData['search'] ?? '';
            $menu_id = $searchData['menu_id'] ?? null;
            $is_active = $searchData['is_active'] ?? null;
            $is_front = $searchData['is_front'] ?? null;
            $tags = $searchData['tags'] ?? null;

            $query = DB::table('news')
                ->where('is_recycle_bin', 0);

            // Search by name
            if ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            }

            // Filter by menu_id
            if ($menu_id !== null && $menu_id !== '') {
                $query->where('menu_id', $menu_id);
            }

            // Filter by is_active
            if ($is_active !== null && $is_active !== '') {
                $query->where('is_active', $is_active);
            }

            // Filter by is_front
            if ($is_front !== null && $is_front !== '') {
                $query->where('is_front', $is_front);
            }

            // Filter by tags
            if ($tags !== null && $tags !== '') {
                $query->where('tags', 'like', '%' . $tags . '%');
            }

            $total = $query->count();

            // Sắp xếp: Mới nhất trên đầu (id desc), sau đó mới đến sort_order
            $news = $query->orderBy('id', 'desc')
                ->skip(($page - 1) * $pageSize)
                ->take($pageSize)
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Lấy danh sách tin tức thành công',
                'data' => [
                    'list' => $news,
                    'total' => $total,
                    'page' => $page,
                    'pageSize' => $pageSize
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Get news detail with all language data
     */
    public function apiDetail(Request $request)
    {
        try {
            $id = $request->input('id');

            if (!$id) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'ID không hợp lệ'
                ]);
            }

            // Get news main data
            $news = DB::table('news')->where('id', $id)->first();

            if (!$news) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'Không tìm thấy tin tức'
                ]);
            }

            // Get all language data
            $newsData = DB::table('news_data')
                ->where('data_id', $id)
                ->get();

            // Convert to keyed by language_id
            $newsDataByLang = [];
            foreach ($newsData as $data) {
                $newsDataByLang[$data->languages_id] = $data;
            }

            return response()->json([
                'status_code' => 200,
                'message' => 'Lấy chi tiết tin tức thành công',
                'data' => [
                    'news' => $news,
                    'news_data' => $newsDataByLang
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Add new news
     */
    public function apiAdd(Request $request)
    {
        try {
            $newsData = $request->input('news', []);
            $newsDataByLang = $request->input('news_data', []);

            $user = Auth::guard('admin_users')->user();
            $createBy = $user ? $user->id : 0;

            // Get name from first language (id = 1)
            $name = '';
            if (isset($newsDataByLang[1]) && isset($newsDataByLang[1]['name_data'])) {
                $name = $newsDataByLang[1]['name_data'];
            } else {
                // Fallback to first available language
                $firstLang = reset($newsDataByLang);
                $name = $firstLang['name_data'] ?? '';
            }

            // Insert news
            $newsId = DB::table('news')->insertGetId([
                'name' => $name,
                'menu_id' => $newsData['menu_id'] ?? 0,
                'tags_id' => $newsData['tags_id'] ?? 0,
                'tags' => $newsData['tags'] ?? '',
                'image' => $newsData['image'] ?? '',
                'is_active' => $newsData['is_active'] ?? 1,
                'is_front' => $newsData['is_front'] ?? 0,
                'is_translate' => $newsData['is_translate'] ?? 0,
                'views' => $newsData['views'] ?? 0,
                'sort_order' => $newsData['sort_order'] ?? 0,
                'parent_id' => $newsData['parent_id'] ?? 0,
                'create_by' => $createBy,
                'create_date' => now(),
                'is_recycle_bin' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Insert news_data for each language
            foreach ($newsDataByLang as $langId => $data) {
                DB::table('news_data')->insert([
                    'data_id' => $newsId,
                    'languages_id' => $langId,
                    'name_data' => $data['name_data'] ?? '',
                    'description' => $data['description'] ?? '',
                    'embed_code' => $data['embed_code'] ?? '',
                    'content' => $data['content'] ?? '',
                    'meta_title' => $data['meta_title'] ?? '',
                    'meta_keyword' => $data['meta_keyword'] ?? '',
                    'meta_description' => $data['meta_description'] ?? '',
                    'create_by' => $createBy,
                    'parent_id' => 0,
                    'is_recycle_bin' => 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'status_code' => 200,
                'message' => 'Thêm tin tức thành công',
                'data' => ['id' => $newsId]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Update news
     */
    public function apiUpdate(Request $request)
    {
        try {
            $id = $request->input('id');
            $newsData = $request->input('news', []);
            $newsDataByLang = $request->input('news_data', []);

            if (!$id) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'ID không hợp lệ'
                ]);
            }

            $user = Auth::guard('admin_users')->user();
            $createBy = $user ? $user->id : 0;

            // Get name from first language (id = 1)
            $name = '';
            if (isset($newsDataByLang[1]) && isset($newsDataByLang[1]['name_data'])) {
                $name = $newsDataByLang[1]['name_data'];
            } else {
                // Fallback to first available language
                $firstLang = reset($newsDataByLang);
                $name = $firstLang['name_data'] ?? '';
            }

            // Update news
            DB::table('news')
                ->where('id', $id)
                ->update([
                    'name' => $name,
                    'menu_id' => $newsData['menu_id'] ?? 0,
                    'tags_id' => $newsData['tags_id'] ?? 0,
                    'tags' => $newsData['tags'] ?? '',
                    'image' => $newsData['image'] ?? '',
                    'is_active' => $newsData['is_active'] ?? 1,
                    'is_front' => $newsData['is_front'] ?? 0,
                    'is_translate' => $newsData['is_translate'] ?? 0,
                    'views' => $newsData['views'] ?? 0,
                    'sort_order' => $newsData['sort_order'] ?? 0,
                    'parent_id' => $newsData['parent_id'] ?? 0,
                    'updated_at' => now()
                ]);

            // Delete old news_data
            DB::table('news_data')->where('data_id', $id)->delete();

            // Insert new news_data
            foreach ($newsDataByLang as $langId => $data) {
                DB::table('news_data')->insert([
                    'data_id' => $id,
                    'languages_id' => $langId,
                    'name_data' => $data['name_data'] ?? '',
                    'description' => $data['description'] ?? '',
                    'embed_code' => $data['embed_code'] ?? '',
                    'content' => $data['content'] ?? '',
                    'meta_title' => $data['meta_title'] ?? '',
                    'meta_keyword' => $data['meta_keyword'] ?? '',
                    'meta_description' => $data['meta_description'] ?? '',
                    'create_by' => $createBy,
                    'parent_id' => 0,
                    'is_recycle_bin' => 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'status_code' => 200,
                'message' => 'Cập nhật tin tức thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Delete news (single or multiple)
     */
    public function apiDelete(Request $request)
    {
        try {
            $ids = $request->input('ids', []);

            if (empty($ids)) {
                return response()->json([
                    'status_code' => 400,
                    'message' => 'Không có ID để xóa'
                ]);
            }

            // Soft delete news
            DB::table('news')
                ->whereIn('id', $ids)
                ->update(['is_recycle_bin' => 1]);

            // Soft delete news_data
            DB::table('news_data')
                ->whereIn('data_id', $ids)
                ->update(['is_recycle_bin' => 1]);

            return response()->json([
                'status_code' => 200,
                'message' => 'Xóa tin tức thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Lỗi: ' . $e->getMessage()
            ]);
        }
    }
}
