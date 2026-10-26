@if ($categories->count() > 0 )
    <section class="container py-0 rtl px-0 px-md-3">
        <div class="__inline-62">
            <div>
                <div class="card __shadow h-100 max-md-shadow-0">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-baseline">
                            <h2 class="categories-title m-0 letter-spacing-0">
                                <span class="font-semibold">{{ translate('categories')}}</span>
                            </h2>
                            <div>
                                <a class="text-capitalize view-all-text web-text-primary"
                                   href="{{route('categories')}}">{{ translate('view_all')}}
                                    <i class="czi-arrow-{{Session::get('direction') === "rtl" ? 'left mr-1 ml-n1 mt-1 float-left' : 'right ml-1 mr-n1'}}"></i>
                                </a>
                            </div>
                        </div>
                        <div class="d-none d-lg-block">
                            <div class="row mt-3">
                                @foreach($categories as $key => $category)
                                    @if ($key < 8)
                                        <div class="text-center __m-5px __cate-item">
                                            <a href="{{route('products',['category_id'=> $category['id'],'data_from'=>'category','page'=>1])}}" class="d-flex flex-column align-items-center">
                                                <div class="__img">
                                                    <img loading="lazy" alt="{{ $category->name }}"
                                                         src="{{ getStorageImages(path:$category->icon_full_url, type: 'category') }}">
                                                </div>
                                                <h3 class="text-center fs-13 font-semibold mt-2 letter-spacing-0">{{Str::limit($category->name, 15)}}</h3>
                                            </a>
                                        </div>
                                    @endif
                                @endforeach
                            </div>
                        </div>
                        <div class="d-lg-none cat-grid-wrap">
                            <div class="cat-grid">
                                @foreach($categories as $key => $category)
                                    @continue(!\App\Models\Product::active()->where('category_id', $category['id'])->exists())
                                    <a class="cat-grid-item" href="{{route('products',['category_id'=> $category['id'],'data_from'=>'category','page'=>1])}}">
                                        <span class="cat-grid-img"><img loading="lazy" alt="{{ $category->name }}" src="{{ getStorageImages(path: $category->icon_full_url, type: 'category') }}"></span>
                                        <span class="cat-grid-name">{{ $category->name }}</span>
                                    </a>
                                @endforeach
                            </div>
                        </div>
                        <style>
                            @media (max-width: 991.98px) {
                                .categories-title, .categories-title + div{display:none}
                                .cat-grid-wrap{margin:0 -4px}
                                .cat-grid{display:grid;grid-auto-flow:column;grid-template-rows:repeat(2,auto);grid-auto-columns:20%;gap:14px 0;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding:4px 0}
                                .cat-grid::-webkit-scrollbar{display:none}
                                .cat-grid-item{display:flex;flex-direction:column;align-items:center;gap:6px;text-decoration:none!important;scroll-snap-align:start;padding:0 3px;min-width:0}
                                .cat-grid-img{display:block;width:100%;max-width:62px;aspect-ratio:1/1;border-radius:50%;overflow:hidden;background:#f1f4f9;box-shadow:0 0 0 1px rgba(11,42,91,.08)}
                                .cat-grid-img img{width:100%;height:100%;object-fit:cover;display:block}
                                .cat-grid-all{display:flex;align-items:center;justify-content:center;background:#eef5ff;color:var(--web-primary,#1b7fed);font-size:24px}
                                .cat-grid-name{font-size:11px;line-height:1.2;color:#0b2a5b;text-align:center;font-weight:600;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-width:100%}
                            }
                        </style>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endif
