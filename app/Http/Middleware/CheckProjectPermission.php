<?php

namespace App\Http\Middleware;

use App\Services\Project\PermissionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckProjectPermission
{
    protected $permissionService;

    public function __construct(PermissionService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permission  The required permission name
     * @param  string  $projectParam  The route parameter name for project ID (default: 'project')
     */
    public function handle(Request $request, Closure $next, string $permission, string $projectParam = 'project'): Response
    {
        $user = $request->user('admin');
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Authentication required'
            ], 401);
        }

        // Get project ID from route parameter
        $projectId = $request->route($projectParam);
        
        if (!$projectId) {
            // Try to get from request body for POST/PUT requests
            $projectId = $request->input('project_id');
        }

        if (!$projectId) {
            return response()->json([
                'success' => false,
                'message' => 'Project ID not found in request'
            ], 400);
        }

        // Check permission
        $hasPermission = $this->permissionService->userHasPermissionInProject(
            $user->id,
            $projectId,
            $permission
        );

        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden - You do not have permission to perform this action',
                'required_permission' => $permission
            ], 403);
        }

        return $next($request);
    }
}
