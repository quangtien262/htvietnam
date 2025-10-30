
<div id="wide-nav" class="header-bottom wide-nav hide-for-medium">
    <div class="flex-row container">
        <div class="flex-col hide-for-medium flex-left">
            {!! app('Helper')->menuLayout01() !!}
        </div>
        <div class="flex-col hide-for-medium flex-right flex-grow">
            <ul class="nav header-nav header-bottom-nav nav-right  nav-size-medium nav-spacing-xlarge nav-uppercase">


                <li class="header-search header-search-dropdown has-icon has-dropdown menu-item-has-children">
                    <a href="#" aria-label="Search" class="is-small"><i class="icon-search"></i></a>
                    <ul class="nav-dropdown nav-dropdown-simple">
                        <li class="header-search-form search-form html relative has-icon">
                            <div class="header-search-form-wrapper">
                                <div class="searchform-wrapper ux-search-box relative is-normal">
                                    <form role="search" method="get" class="searchform"
                                        action="{{ route('searchProduct') }}">
                                        <div class="flex-row relative">
                                            <div class="flex-col flex-grow">
                                                <label class="screen-reader-text"
                                                    for="woocommerce-product-search-field-0">Search for:</label>
                                                <input type="search" id="woocommerce-product-search-field-0"
                                                    class="search-field mb-0" placeholder="Search&hellip;" value=""
                                                    name="keyword"/>
                                                <input type="hidden" name="post_type" value="product" />
                                            </div>
                                            <div class="flex-col">
                                                <button type="submit" value="Search"
                                                    class="ux-search-submit submit-button secondary button wp-element-button icon mb-0"
                                                    aria-label="Submit">
                                                    <i class="icon-search"></i> </button>
                                            </div>
                                        </div>
                                        <div class="live-search-results text-left z-top"></div>
                                    </form>
                                </div>
                            </div>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</div>

