# defineSkipsHandler

Handles skip segment requests for content filtering, intro skipping, ad skipping, etc.

## Arguments

`args` - Object containing:

- `type` - Content type (`movie`, `series`)
- `id` - IMDB ID (e.g., `tt1234567` for movies, `tt1234567:1:1` for series episodes)
- `extra` - Additional parameters
- `config` - User configuration from the addon

## Returns

A Promise resolving to an object containing:

```javascript
{
  skips: [
    {
      id: "skip-1",           // Unique identifier for this skip segment
      startMs: 3600000,       // Start time in milliseconds
      endMs: 3660000,         // End time in milliseconds  
      category: "violence",   // Category: nudity, sex, violence, language, drugs, fear, intro, outro, recap, ad
      severity: "high",       // Severity level: low, medium, high
      description: "Fight scene", // Optional human-readable description
      action: "skip"          // Optional: "skip" (auto-skip) or "warn" (show button)
    }
  ]
}
```

## Example

```javascript
const { addonBuilder } = require('stremio-addon-sdk')

const builder = new addonBuilder({
  id: 'org.example.myskipaddon',
  version: '1.0.0',
  name: 'My Skip Addon',
  resources: ['skips'],
  types: ['movie', 'series'],
  idPrefixes: ['tt']
})

builder.defineSkipsHandler(async ({ type, id, config }) => {
  // Fetch skip data from your database
  const skipData = await getSkipsFromDatabase(id)
  
  return {
    skips: skipData.map(skip => ({
      id: skip.id,
      startMs: skip.startMs,
      endMs: skip.endMs,
      category: skip.category,
      severity: skip.severity,
      description: skip.description
    }))
  }
})
```

## Use Cases

- **Content filtering** - Skip nudity, violence, language (e.g., CleanStream, VidAngel-style)
- **Intro/outro skipping** - Like Netflix's "Skip Intro" button
- **Ad skipping** - For ad-supported content
- **Recap skipping** - Skip "Previously on..." segments
- **SponsorBlock-style** - Community-driven skip timestamps

## Categories

| Category | Description |
|----------|-------------|
| `nudity` | Nudity, bare skin |
| `sex` | Sexual content, intimacy |
| `violence` | Fighting, blood, gore |
| `language` | Profanity, slurs |
| `drugs` | Drug/alcohol use |
| `fear` | Scary scenes, jumpscares |
| `intro` | Opening credits/intro sequence |
| `outro` | End credits |
| `recap` | "Previously on..." segments |
| `ad` | Advertisements, promotions |

## Severity Levels

| Level | Description |
|-------|-------------|
| `low` | Mild content |
| `medium` | Moderate content |
| `high` | Intense/explicit content |

## Related

- [Feature Request #1608](https://github.com/Stremio/stremio-features/issues/1608) - Skip Segments API proposal
- [CleanStream](https://cleanstream.elfhosted.com) - Reference implementation with 376+ movies
