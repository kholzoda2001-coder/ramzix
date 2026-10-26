@php
    use App\Utils\QuantityPricing;
    $tierRows = isset($product) ? QuantityPricing::tiers((int)$product['id']) : [];
    $rows = [];
    if (count($tierRows) > 0) {
        foreach ($tierRows as $t) {
            $rows[] = ['min' => $t->min_qty, 'max' => $t->max_qty, 'markup' => $t->markup_percent, 'whatsapp' => $t->contact_whatsapp];
        }
    } else {
        foreach (QuantityPricing::DEFAULT_TIERS as $t) {
            $rows[] = ['min' => $t[0], 'max' => $t[1], 'markup' => $t[2], 'whatsapp' => $t[3]];
        }
    }
    while (count($rows) < 6) {
        $rows[] = ['min' => '', 'max' => '', 'markup' => '', 'whatsapp' => false];
    }
@endphp
<div class="card mt-3">
    <div class="card-header">
        <h3 class="mb-0">{{ translate('Quantity_pricing') }}</h3>
    </div>
    <div class="card-body">
        <div class="row gy-3 mb-3">
            <div class="col-md-6 col-lg-4">
                <label class="form-label" for="purchase_price">{{ translate('Cost_price') }} (USD)</label>
                <input type="number" min="0" step="0.0001" class="form-control" name="purchase_price" id="purchase_price"
                       value="{{ isset($product) ? round((float)$product['purchase_price'], 4) : 0 }}">
                <small class="text-muted">
                    {{ translate('Price_per_piece_=_cost_price_x_(1_+_markup_%)._Leave_the_cost_at_0_to_use_the_unit_price_above_for_every_quantity.') }}
                </small>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-bordered align-middle text-center mb-2">
                <thead>
                <tr>
                    <th>{{ translate('From_qty') }}</th>
                    <th>{{ translate('To_qty') }} ({{ translate('empty_=_no_limit') }})</th>
                    <th>{{ translate('Markup') }} %</th>
                    <th>{{ translate('Agree_on_WhatsApp') }}</th>
                    <th>{{ translate('Price_per_piece') }} (USD)</th>
                </tr>
                </thead>
                <tbody>
                @foreach($rows as $i => $row)
                    <tr>
                        <td><input type="number" min="1" class="form-control" name="price_tiers[{{ $i }}][min]" value="{{ $row['min'] }}"></td>
                        <td><input type="number" min="1" class="form-control" name="price_tiers[{{ $i }}][max]" value="{{ $row['max'] }}"></td>
                        <td><input type="number" min="0" step="0.01" class="form-control tier-markup" name="price_tiers[{{ $i }}][markup]" value="{{ $row['markup'] }}"></td>
                        <td><input type="checkbox" class="form-check-input" name="price_tiers[{{ $i }}][whatsapp]" value="1" {{ $row['whatsapp'] ? 'checked' : '' }}></td>
                        <td>
                            @if(isset($product) && (float)$product['purchase_price'] > 0 && $row['markup'] !== '' && $row['markup'] !== null && !$row['whatsapp'])
                                {{ number_format($product['purchase_price'] * (1 + $row['markup'] / 100), 2) }}
                            @else
                                -
                            @endif
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
        <small class="text-muted">{{ translate('Empty_rows_are_ignored._The_unit_price_of_the_product_is_set_to_the_price_of_the_first_row_when_you_save.') }}</small>
    </div>
</div>
