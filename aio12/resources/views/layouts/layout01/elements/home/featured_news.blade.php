
<div class="v4video primay_bg mb10" style="background-color: #FAFAFA">
    <div class="container fix-main-noibat">
        <div class="row">
            <div class="col-12">
                <h4 class="desktop mb-3" topicid="621">{{__('user.featured_news')}}</h4>
            </div>
        </div>
        <div class="justify-content-center">
            <div class="row">
                @foreach ($featuredNews as $key => $item)
                    @php
                        if ($key > 3) {
                            continue;
                        }
                    @endphp
                    @include('layouts.layout01.elements.news.item01')
                @endforeach
            </div>
        </div>
    </div>
</div>
