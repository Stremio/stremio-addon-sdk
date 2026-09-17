# Skips Response

The skips response contains an array of skip segments for a given content item.

## Format

```javascript
{
  skips: [
    {
      id: String,          // Required: Unique identifier
      startMs: Number,     // Required: Start time in milliseconds
      endMs: Number,       // Required: End time in milliseconds
      category: String,    // Required: Category of content to skip
      severity: String,    // Optional: Severity level (low/medium/high)
      description: String, // Optional: Human-readable description
      action: String       // Optional: "skip" (auto) or "warn" (button)
    }
  ]
}
```

## Fields

### id (required)
Unique identifier for the skip segment. Used for tracking, voting, and deduplication.

### startMs (required)
Start time in milliseconds from the beginning of the video.

### endMs (required)
End time in milliseconds. Must be greater than `startMs`.

### category (required)
Type of content being skipped. Valid values:

| Category | Description |
|----------|-------------|
| `nudity` | Nudity, bare skin |
| `sex` | Sexual content, intimacy |
| `violence` | Fighting, blood, gore |
| `language` | Profanity, slurs |
| `drugs` | Drug/alcohol use |
| `fear` | Scary scenes, jumpscares |
| `intro` | Opening credits/intro |
| `outro` | End credits |
| `recap` | "Previously on..." |
| `ad` | Advertisements |

### severity (optional)
Intensity level. Allows users to filter by severity.

| Level | Description |
|-------|-------------|
| `low` | Mild |
| `medium` | Moderate |
| `high` | Intense/explicit |

### description (optional)
Human-readable description shown to the user.

Example: `"Fight scene in lobby"`, `"Brief nudity"`, `"Opening credits"`

### action (optional)
How the player should handle the skip. Default is `"skip"`.

| Action | Behavior |
|--------|----------|
| `skip` | Auto-skip when enabled |
| `warn` | Show "Skip" button, don't auto-skip |

## Example Response

```javascript
{
  skips: [
    {
      id: "cs-tt0133093-1",
      startMs: 1800000,
      endMs: 1860000,
      category: "violence",
      severity: "high",
      description: "Lobby shootout",
      action: "skip"
    },
    {
      id: "cs-tt0133093-2", 
      startMs: 3600000,
      endMs: 3720000,
      category: "nudity",
      severity: "medium",
      description: "Brief nudity",
      action: "skip"
    },
    {
      id: "intro-tt0133093",
      startMs: 0,
      endMs: 45000,
      category: "intro",
      description: "Opening credits",
      action: "warn"
    }
  ]
}
```

## Empty Response

When no skips are available:

```javascript
{
  skips: []
}
```
