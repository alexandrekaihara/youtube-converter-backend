# Coding Pattern Guidelines

## 0. Project Structure (Modular/Context-Based)

### Architecture Overview
Each business context (module) is organized independently with its own controller, service, and utils. This allows the project to scale horizontally as new features are added without creating a monolithic structure.

**Core Concepts:**
- **Controllers**: Entry points that define routes and contracts. They receive requests and delegate implementation to services. Controllers are thin and focused on HTTP concerns.
- **Services**: Contains the actual business logic implementation. Services are stateful (can hold state), handle core operations, and can depend on other services.
- **Utils**: Stateless utility classes with static methods for helper functions. No state, no side effects.

### Project Structure

```
src/
└── converter/              # Example context: Converter
│       ├── interfaces/
│       │   └── videoMetadata.interface.ts  # Data contracts
│       ├── controllers/
│       │   └── converter.controller.ts     # Route handlers, contracts
│       ├── services/
│       │   ├── youtubeConverterInterface.ts      # Interface the defined contract for any converter service
│       │   ├── youtubeConverterImpl.ts           # Implemnentation of the converter service using yt-dlp service
│       │   └── ytdlp.service.ts                  # Service that interacts with yt-dlp CLI
│       └── utils/
│           └── formatter.util.ts       # Static helper functions
│
└── index.ts                     # Entry point
```

### Layer Responsibilities

#### Controller Layer
```typescript
// contexts/converter/controllers/video.controller.ts
class VideoController {
  private readonly logger: Logger;
  private readonly youtubeService: YouTubeService;

  constructor(youtubeService: YouTubeService) {
    this.logger = new Logger(VideoController.name);
    this.youtubeService = youtubeService;
  }

  // Define route contracts (what endpoint returns)
  async getMetadata(req: Request, res: Response): Promise<void> {
    const videoId = req.params.videoId;
    this.logger.info('GET /videos/:videoId/metadata', { videoId });

    try {
      const metadata = await this.youtubeService.fetchMetadata(videoId);
      res.json(metadata);
    } catch (error) {
      this.logger.error('Failed to get metadata', error as Error, { videoId });
      res.status(500).json({ error: 'Failed to fetch metadata' });
    }
  }

  async getDownloadUrl(req: Request, res: Response): Promise<void> {
    const { videoId, formatId } = req.params;
    this.logger.info('GET /videos/:videoId/download/:formatId', { videoId, formatId });

    try {
      const url = await this.youtubeService.getDownloadUrl(videoId, formatId);
      res.json({ downloadUrl: url });
    } catch (error) {
      this.logger.error('Failed to get download URL', error as Error, { videoId, formatId });
      res.status(500).json({ error: 'Failed to get download URL' });
    }
  }
}
```

#### Service Layer
```typescript
// contexts/converter/services/youtube.service.ts
class YouTubeService {
  private static readonly CACHE_TTL = 86400; // 24 hours
  private readonly logger: Logger;
  private readonly cache: ICacheService;
  private readonly ytdlp: IVideoProcessor;

  constructor(cache: ICacheService, processor: IVideoProcessor) {
    this.logger = new Logger(YouTubeService.name);
    this.cache = cache;
    this.ytdlp = processor;
  }

  async fetchMetadata(videoId: string): Promise<IVideoMetadata> {
    this.logger.info('Fetching metadata', { videoId });

    const cached = await this.cache.get<IVideoMetadata>(`video:${videoId}`);
    if (cached) {
      this.logger.debug('Cache hit', { videoId });
      return cached;
    }

    const metadata = await this.ytdlp.extractMetadata(videoId);
    await this.cache.set(`video:${videoId}`, metadata, YouTubeService.CACHE_TTL);
    return metadata;
  }

  async getDownloadUrl(videoId: string, formatId: string): Promise<string> {
    this.logger.info('Getting download URL', { videoId, formatId });
    return await this.ytdlp.getDownloadUrl(videoId, formatId);
  }
}
```

#### Utils Layer
```typescript
// contexts/converter/utils/formatter.util.ts
class FormatterUtil {
  private static readonly MEGABYTE = 1024 * 1024;
  private static readonly GIGABYTE = 1024 * 1024 * 1024;

  static formatBytes(bytes: number): string {
    if (bytes >= FormatterUtil.GIGABYTE) {
      return (bytes / FormatterUtil.GIGABYTE).toFixed(2) + ' GB';
    }
    return (bytes / FormatterUtil.MEGABYTE).toFixed(2) + ' MB';
  }

  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  static validateVideoId(videoId: string): boolean {
    return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  }
}
```

---

## 1. Variable Declaration Strategy

### Rule: Maximize Use of `const` and `readonly`

```typescript
// ✅ GOOD: Use const for all immutable values
const API_TIMEOUT: number = 30000;
const CACHE_TTL: number = 86400;
const FORMATS: readonly string[] = ['mp3', 'mp4', 'wav'];

// ✅ GOOD: Use readonly for object/array properties
interface Config {
  readonly apiUrl: string;
  readonly maxRetries: number;
}

class ServiceConfig {
  private readonly settings: Map<string, unknown>;
  public readonly logger: Logger;

  constructor(config: Config) {
    this.logger = new Logger(ServiceConfig.name);
    this.settings = new Map(Object.entries(config));
  }
}

// ❌ AVOID: Use let/var only when value will truly change
let activeConnections: number = 0; // Only if this needs to be mutable
```

### Constant Patterns
- Class constants: `static readonly`
- Configuration: `readonly` properties
- Immutable collections: `readonly` or `as const`

```typescript
class YouTubeService {
  private static readonly YOUTUBE_API_BASE_URL = 'https://www.youtube.com';
  private static readonly TIMEOUT_MS = 30000;
  private static readonly RETRY_ATTEMPTS = 3;
  
  private readonly logger: Logger;
  private readonly cache: CacheService;

  constructor(cache: CacheService) {
    this.logger = new Logger(YouTubeService.name);
    this.cache = cache;
  }
}
```

---

## 3. Development Workflow

### Development Steps

1. **Define Interfaces First**
   - Describe contracts and data shapes
   - Enable dependency injection
   - Place in `contexts/[context]/interfaces/`

2. **Implement Services**
   - One service per file
   - Inject dependencies via constructor
   - Use readonly properties
   - Place in `contexts/[context]/services/`

3. **Create Controllers**
   - Route handlers with injected services
   - Delegate business logic to services
   - Catch and log errors

4. **Create Utils (if needed)**
   - Static utility methods only
   - No state management
   - Reusable helper functions
   - Place in `contexts/[context]/utils/`

5. **Testing**
   - Mock interfaces for unit tests
   - Test services in isolation
   - Test controllers with mocked services
