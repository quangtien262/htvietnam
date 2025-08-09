@extends('layouts.layout04.index')
@section('content')

<div id="content" class="blog-wrapper blog-single page-wrapper">
	<div class="row row-large">
		<div class="large-12 col">
			<article id="post-980" class="post-980 post type-post status-publish format-standard has-post-thumbnail hentry category-tin-tuc">
				<div class="article-inner">
					<header class="entry-header">
						<div class="entry-header-text entry-header-text-bottom text-left">
							<h6 class="entry-category is-xsmall">
								<a href="{{route('contact')}}" rel="category tag">liên Hệ</a>
							</h6>

							<h1 class="entry-title"></h1>
							<div class="entry-divider is-divider small"></div>
						</div>
					</header>
					<div class="entry-content single-page">

                        <div class="row center-block" id="row-568880864">

                            <div id="col-1264372998" class="col medium-7 small-10 large-7">
                                <div class="col-inner">
                                   <div class="container section-title-container">

                                      <h3 class="section-title section-title-normal">
                                        <b></b>
                                        <span class="section-title-main" style="font-size:undefined%;">BẠN CÓ GÓP Ý HOẶC THẮC MẮC CẦN HỎI ĐÁP, VUI LÒNG GỬI LIÊN HỆ CHO CHÚNG TÔI</span>
                                        <b></b>
                                    </h3>
                                   </div>
                                   <div role="form"  id="wpcf7-f7041-p7025-o2" lang="en-US" dir="ltr">
                                      <div class="screen-reader-response">
                                         <p role="status" aria-live="polite" aria-atomic="true"></p>
                                         <ul></ul>
                                      </div>
                                      <form action="" method="post" class="wpcf7-form init">
                                        @csrf
                                         <p>
                                            <label>Họ Tên (*)</label>
                                            <br>
                                            <span class="wpcf7-form-control-wrap your-name">
                                                <input type="text" name="contact[name]" value="{{ old('contact.name') }}" size="40" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required" aria-required="true" aria-invalid="false">
                                            </span>
                                            @error('contact.name')
                                                <span class="invalid-feedback" role="alert">
                                                    <label class="error" id="name_error" for="name">{{ $message }}</label>
                                                </span>
                                            @enderror
                                        </p>

                                         <p>
                                            <label>Email (*)</label>
                                            <br>
                                            <span class="wpcf7-form-control-wrap your-email">
                                                <input type="text" name="contact[email]"  value="{{ old('contact.email') }}" size="40" class="wpcf7-form-control wpcf7-text wpcf7-email wpcf7-validates-as-required wpcf7-validates-as-email" aria-required="true" aria-invalid="false">
                                            </span>
                                            @error('contact.email')
                                                <span class="invalid-feedback" role="alert">
                                                    <label class="error" id="email_error" for="email">{{ $message }}</label>
                                                </span>
                                            @enderror
                                        </p>

                                        <p>
                                            <label>Số Điện Thoại (*)</label>
                                            <br>
                                            <span class="wpcf7-form-control-wrap your-email">
                                                <input type="text" name="contact[phone]" value="{{ old('contact.phone') }}" size="40" class="wpcf7-form-control wpcf7-text wpcf7-email wpcf7-validates-as-required wpcf7-validates-as-email" aria-required="true" aria-invalid="false">
                                            </span>
                                            @error('contact.phone')
                                                <span class="invalid-feedback" role="alert">
                                                    <label class="error" id="phone_error" for="phone">{{ $message }}</label>
                                                </span>
                                            @enderror
                                        </p>

                                         <p>
                                            <label>Nội Dung (*)</label>
                                            <br>
                                            <span class="wpcf7-form-control-wrap your-message">
                                                <textarea name="contact[content]" cols="40" rows="10" class="wpcf7-form-control wpcf7-textarea" aria-invalid="false">{{ old('contact.content') }}</textarea>
                                            </span>
                                            @error('contact.content')
                                                <span class="invalid-feedback" role="alert">
                                                    <label class="error" id="content_error" for="content">{{ $message }}</label>
                                                </span>
                                            @enderror
                                        </p>

                                         <p>
                                            <input type="submit" value="Gửi liên hệ" class="wpcf7-form-control wpcf7-submit button" aria-invalid="false">
                                            <span class="ajax-loader"></span>
                                        </p>
                                      </form>
                                   </div>
                                </div>
                             </div>

                             <div id="col-1264372998" class="col medium-5 small-14 large-5">
                                <div class="col-inner">
                                    <div id="custom_html-11" class="widget_text col pb-0 widget widget_custom_html">
                                        <span class="widget-title">THÔNG TIN LIÊN HỆ</span>
                                        <div class="is-divider small"></div>
                                        <div class="textwidget custom-html-widget">
                                            <span class="item_branch">
                                                <h4>{{$config->name}}</h4>
                                                <p class="address">Địa chỉ: {{$config->address}}</p>
                                                <p class="phone">Mobile:  {{$config->phone}}</p>
                                                <p class="email">Email: {{$config->email}}</p>
                                    </span>
                                </div>
                            </div>

                            @include('components.alert')

                                </div>
                            </div>


                        </div>

					</div>
				</div>
			</article>
		</div>
	</div>
</div>

@endsection
