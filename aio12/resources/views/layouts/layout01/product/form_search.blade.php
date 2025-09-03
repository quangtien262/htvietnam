<aside id="search-2" class="widget widget_search">
    <span class="widget-title shop-sidebar">{{ __('user.search_product') }}</span>
    <div class="is-divider small"></div>
    <form method="get" class="searchform" action="{{ route('searchProduct') }}" role="search">
        <div class="flex-row relative">
            <div class="flex-col flex-grow">
                <input type="search" class="search-field mb-0" name="keyword" value="" id="s"
                    placeholder="Search…">
            </div>
            <div class="flex-col">
                <button type="submit" class="ux-search-submit submit-button secondary button icon mb-0"
                    aria-label="Submit">
                    <i class="icon-search"></i> </button>
            </div>
        </div>
        <div class="live-search-results text-left z-top"></div>
    </form>
</aside>
