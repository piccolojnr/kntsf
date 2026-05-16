<x-mail::message>
<div class="mail-eyebrow mail-eyebrow-{{ $tone ?? 'default' }}">{{ $eyebrow }}</div>

# {{ $title }}

{{ $intro }}

@if (! empty($details))
<x-mail::table>
| Detail | Value |
| :--- | ---: |
@foreach ($details as $detail)
| **{{ $detail['label'] }}** | {{ $detail['value'] }} |
@endforeach
</x-mail::table>
@endif

@if ($actionLabel && $actionUrl)
<x-mail::button :url="$actionUrl">
{{ $actionLabel }}
</x-mail::button>
@endif

@if ($note)
<x-mail::panel>
{{ $note }}
</x-mail::panel>
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
