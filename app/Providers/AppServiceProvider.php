<?php

namespace App\Providers;

use App\Services\Helper;
use App\Services\Admin\AdminHelper;
use Illuminate\Support\ServiceProvider;
use Illuminate\Pagination\Paginator;
use App\Services\CommonService;
use App\Services\DataService;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Gate;
use App\Models\Project\Project;
use App\Models\Project\Task;
use App\Policies\Project\ProjectPolicy;
use App\Policies\Project\TaskPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if(env('FORCE_HTTPS',false)) { // Default value should be false for local server
            URL::forceScheme('https');
        }

        $this->app->singleton('Helper', function () { return new Helper;});
        $this->app->singleton('DataService', function () { return new DataService;});
        $this->app->singleton('AdminHelper', function () { return new AdminHelper;});
	    $this->app->singleton('CommonService', function () { return new CommonService;});
        Paginator::useBootstrapFive();
        // Paginator::useBootstrapFour();

        // Register policies
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Task::class, TaskPolicy::class);
    }
}
