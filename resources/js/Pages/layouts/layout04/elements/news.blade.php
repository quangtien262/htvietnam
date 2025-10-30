<section class="section tin-moi" id="section_446906396">
    <div class="bg section-bg fill bg-fill  bg-loaded">
        <div class="is-border"
            style="border-color:rgb(197, 190, 190);border-width:0px 0px 0px 0px;margin:0px 0px 0px 0px;">
        </div>
    </div>
    <div class="section-content relative">
        <div class="row tin-tuc" id="row-333577787">
            <div class="col small-12 large-12">
                <div class="col-inner text-center">
                    <h2 class="page-subheading">Tin tức – bài viết</h2>
                    <div id="gap-659483876" class="gap-element clearfix" style="display:block; height:auto;">
                        <style scope="scope">
                            #gap-659483876 {
                                padding-top: 20px;
                            }
                        </style>
                    </div>
                    <div class="row blogs large-columns-4 medium-columns-1 small-columns-1 row-small">
                        @foreach ($news as $item)
                            @include('layouts.layout04.elements.news_item')
                        @endforeach
                    </div>
                </div>
            </div>
            <style scope="scope">
            </style>
        </div>
    </div>
    <style scope="scope">
        #section_446906396 {
            padding-top: 30px;
            padding-bottom: 30px;
        }
    </style>
</section>
