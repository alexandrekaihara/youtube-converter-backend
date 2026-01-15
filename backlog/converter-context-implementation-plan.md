# YouTube Converter Backend - Converter Context Implementation Plan

## Feature Overview
Create the Converter context with two endpoints that leverage yt-dlp CLI to:
1. Fetch available video format options from a YouTube URL
2. Get the direct download URL for a specific format

---

## Technical Architecture

### Data Flow
```
Client Request (YouTube URL)
    ↓
Controller Layer (HTTP Handler)
    ↓
Converter Service (Business Logic)
    ↓
yt-dlp Service (CLI Execution)
    ↓
Response with Formatted Data
```

### Components Structure
```
src/contexts/converter/
├── interfaces/
│   ├── videoMetadata.interface.ts      # Format options structure
│   ├── downloadUrl.interface.ts        # Download URL response
│   └── converter.interface.ts          # Service contract
├── services/
│   ├── youtubeConverterInterface.ts    # Service interface definition
│   ├── youtubeConverterImpl.ts          # Converter service implementation
│   └── ytdlp.service.ts                # yt-dlp CLI wrapper
└── controllers/
    └── converter.controller.ts         # Route handlers
```

### Key Interfaces

#### IVideoFormat
```typescript
interface IVideoFormat {
  id: string;
  ext: string;
  resolution?: string;
  fps?: number;
  filesize?: string;
  vcodec?: string;
  acodec?: string;
  tbr?: string;
  protocol?: string;
  format_note?: string;
}
```

#### IVideoMetadataResponse
```typescript
interface IVideoMetadataResponse {
  videoId: string;
  formats: IVideoFormat[];
  timestamp: Date;
}
```

#### IDownloadUrlResponse
```typescript
interface IDownloadUrlResponse {
  videoId: string;
  formatId: string;
  downloadUrl: string;
  timestamp: Date;
}
```

---

## Implementation Tasks

### Phase 1: Foundation & Interfaces

**✅ Task 1.1: Create Video Metadata Interfaces**
- **Description**: Define TypeScript interfaces for video format options and metadata responses
- **Implementation Steps**:
  - ✅ Create `src/contexts/converter/interfaces/videoMetadata.interface.ts` - Define IVideoFormat and IVideoMetadataResponse
  - ✅ Create `src/contexts/converter/interfaces/downloadUrl.interface.ts` - Define IDownloadUrlResponse interface
  - ✅ Create `src/contexts/converter/interfaces/index.ts` - Export all interfaces
- **Acceptance Criteria**:
  - ✅ IVideoFormat includes id, ext, resolution, fps, filesize, vcodec, acodec, and other relevant fields
  - ✅ IVideoMetadataResponse includes videoId, formats array, and timestamp
  - ✅ IDownloadUrlResponse includes videoId, formatId, downloadUrl, and timestamp
  - ✅ All interfaces are properly exported from index.ts

**✅ Task 1.2: Create Converter Service Interface**
- **Description**: Define the service contract that implementations must follow
- **Implementation Steps**:
  - ✅ Create `src/contexts/converter/interfaces/converter.interface.ts` - Define IConverterService with getFormats() and getDownloadUrl() methods
  - ✅ Update `src/contexts/converter/interfaces/index.ts` - Export IConverterService
- **Acceptance Criteria**:
  - ✅ IConverterService has method: `getFormats(url: string): Promise<IVideoMetadataResponse>`
  - ✅ IConverterService has method: `getDownloadUrl(url: string, formatId: string): Promise<IDownloadUrlResponse>`
  - ✅ Methods have clear JSDoc comments explaining parameters and return types

---

### Phase 2: Service Implementation

**✅ Task 2.1: Create yt-dlp CLI Wrapper Service**
- **Description**: Implement a service that executes yt-dlp CLI commands and returns formatted results
- **Implementation Steps**:
  - ✅ Create `src/contexts/converter/services/ytdlp.service.ts` - Service class that wraps yt-dlp CLI
  - ✅ Implement `getFormatOptions(url: string): Promise<IVideoFormat[]>` - Execute yt-dlp -F and return parsed formats
    - ✅ Execute yt-dlp -F command on the URL
    - ✅ Parse table-formatted output into IVideoFormat array
    - ✅ Handle parsing errors gracefully
  - ✅ Implement `getDownloadUrl(url: string, formatId: string): Promise<string>` - Execute yt-dlp -g and return URL
    - ✅ Execute yt-dlp -g command with format specification
    - ✅ Return the download URL string
    - ✅ Handle command execution errors
  - ✅ Implement error handling and logging for all operations
- **Acceptance Criteria**:
  - ✅ Service uses child_process to execute yt-dlp commands
  - ✅ getFormatOptions correctly parses the table format from yt-dlp -F output
  - ✅ getDownloadUrl returns a valid download URL string
  - ✅ Handles CLI errors gracefully and throws meaningful error messages
  - ✅ Includes logging for debugging yt-dlp execution
  - ✅ Timeout protection for long-running commands

**✅ Task 2.2: Create YouTube Converter Service Interface Definition**
- **Description**: Create the service interface file that defines the contract
- **Implementation Steps**:
  - ✅ Create `src/contexts/converter/services/converter.interface.ts` - Define service interface with detailed documentation
  - ✅ Include method signatures for getFormats and getDownloadUrl
  - ✅ Add JSDoc with examples
- **Acceptance Criteria**:
  - ✅ Interface clearly documents the expected behavior
  - ✅ Method documentation includes parameter descriptions
  - ✅ Example usage is provided in comments

**✅ Task 2.3: Create YouTube Converter Implementation Service**
- **Description**: Implement the main converter service that orchestrates yt-dlp service and formats responses
- **Implementation Steps**:
  - ✅ Create `src/contexts/converter/services/youtubeConverterImpl.ts` - Main converter service class
  - ✅ Implement constructor that injects ytdlpService and logger
  - ✅ Implement `getFormats(url: string): Promise<IVideoMetadataResponse>` method
    - ✅ Validate input URL
    - ✅ Execute yt-dlp -F command
    - ✅ Parse and return formatted response
  - ✅ Implement `getDownloadUrl(url: string, formatId: string): Promise<IDownloadUrlResponse>` method
    - ✅ Validate input parameters
    - ✅ Execute yt-dlp -g command with format specification
    - ✅ Return download URL response
  - ✅ Add comprehensive error handling and logging
- **Acceptance Criteria**:
  - ✅ Service validates URLs before processing
  - ✅ getFormats returns properly structured IVideoMetadataResponse
  - ✅ getDownloadUrl returns properly structured IDownloadUrlResponse
  - ✅ All methods include logging at info and error levels
  - ✅ Service handles and logs all error cases
  - ✅ Response timestamps are accurate

---

### Phase 3: Controller & Endpoints

**[] Task 3.1: Create Converter Controller**
- **Description**: Implement HTTP endpoints for format retrieval and download URL generation
- **Implementation Steps**:
  - [] Create `src/contexts/converter/controllers/converter.controller.ts` - Controller class
  - [] Create constructor that injects IConverterService and Logger
  - [] Implement `getFormats(req: Request, res: Response): Promise<void>` endpoint
    - [] Extract YouTube URL from request query parameter
    - [] Call service.getFormats()
    - [] Return 200 with formatted response
    - [] Handle errors with appropriate status codes
  - [] Implement `getDownloadUrl(req: Request, res: Response): Promise<void>` endpoint
    - [] Extract URL and formatId from request parameters
    - [] Call service.getDownloadUrl()
    - [] Return 200 with download URL
    - [] Handle errors with appropriate status codes
  - [] Add JSDoc comments for each endpoint
  - [] Add request/response logging
- **Acceptance Criteria**:
  - [] getFormats endpoint responds with IVideoMetadataResponse on success
  - [] getDownloadUrl endpoint responds with IDownloadUrlResponse on success
  - [] Both endpoints return appropriate HTTP status codes (200, 400, 500)
  - [] Error responses include meaningful error messages
  - [] All requests are logged with method and URL
  - [] Controllers are thin and delegate to services

**[] Task 3.2: Create Endpoint Routes Configuration**
- **Description**: Set up Express routes for the converter endpoints
- **Implementation Steps**:
  - [] Create `src/contexts/converter/routes.ts` - Route definitions
  - [] Define GET /api/converter/formats - Call controller.getFormats()
  - [] Define GET /api/converter/download/:formatId - Call controller.getDownloadUrl()
  - [] Add request validation middleware if needed
- **Acceptance Criteria**:
  - [] Routes are properly bound to controller methods
  - [] Route paths follow RESTful conventions
  - [] All routes are documented with their purpose

### Phase 4: Integration & Testing

**[] Task 4.1: Create Unit Tests for Service Layer**
- **Description**: Write unit tests for converter service and yt-dlp wrapper
- **Implementation Steps**:
  - [] Create `test/contexts/converter/services/ytdlp.service.test.ts` - Test yt-dlp service
    - [] Test getFormatOptions with sample yt-dlp output
    - [] Test getDownloadUrl with mocked child_process
  - [] Create `test/contexts/converter/services/youtubeConverterImpl.test.ts` - Test converter service
    - [] Mock ytdlpService dependency
    - [] Test getFormats method
    - [] Test getDownloadUrl method
    - [] Test error handling
- **Acceptance Criteria**:
  - [] All service methods have test coverage
  - [] Mocking properly isolates service dependencies
  - [] Error cases are tested
  - [] All tests pass

**[] Task 4.3: Update Main Entry Point**
- **Description**: Register converter routes and initialize service dependencies
- **Implementation Steps**:
  - [] Update `src/index.ts` - Initialize Express app and routes
  - [] Register converter routes
  - [] Initialize YtdlpService and YoutubeConverterImpl
  - [] Set up dependency injection
- **Acceptance Criteria**:
  - [] Application starts without errors
  - [] Routes are properly registered
  - [] Services are properly instantiated